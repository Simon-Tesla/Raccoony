var {Cu, Cc, Ci} = require("chrome");
var Downloads = Cu.import("resource://gre/modules/Downloads.jsm").Downloads;
var OS = Cu.import("resource://gre/modules/osfile.jsm").OS;	
// TODO: convert to using PromiseUtils.jsm or core/promises
var Promise = Cu.import("resource://gre/modules/Promise.jsm").Promise;
var Task = Cu.import("resource://gre/modules/Task.jsm").Task;
var FileUtils = Cu.import("resource://gre/modules/FileUtils.jsm").FileUtils;
var notifications = require("sdk/notifications");
var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var prefs = require('sdk/simple-prefs').prefs;
var tabs = require("sdk/tabs");

var data = self.data;

var button = buttons.ActionButton({
  id: "raccoony-link",
  label: "Save this!",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  disabled: true
});

/////////////////////////
// Page Mod declarations

pageMod.PageMod({
  include: "https://www.weasyl.com/submission/*",
  contentScriptFile: ["./weasylDownload.js", "./common.js"],
  contentStyleFile: "./pageUi.css",
  onAttach: onPageLoad
})

function onPageLoad(worker) {
  // PageMod handler
  var downloaded = false;
  worker.port.emit("injectUi");
  worker.port.on("gotDownload", handleGotDownload);
  worker.port.on("checkIfDownloaded", handleCheckIfDownloaded);
  worker.port.on("showFolder", showFolderInExplorerFromInfo);
  worker.port.on("getDownloadRootSet", function () {
    worker.port.emit("gotDownloadRootSet", !!getDownloadRoot());
  })
  
  worker.tab.on("activate", enableButton);
  worker.tab.on("deactivate", function () {
    // Disable the button whenever we switch away from this tab.
    button.badge = null;
    button.disabled = true;
  })
  if (worker.tab === tabs.activeTab) {
    enableButton();
  }
  
  function enableButton() {
    // Enable the button if we're on a supported page.
    button.disabled = false;
    worker.port.emit("beginCheckIfDownloaded");
  }
  
  function updateDownloadedState(isDownloaded) {
    downloaded = isDownloaded;
    if (isDownloaded) {
      button.badge = "\u2713"; // check mark
      button.badgeColor = "#666666";
    } else {
      button.badge = "\u25BC"; // downward triangle
      button.badgeColor = "#009900";
    }
    worker.port.emit("isDownloaded", isDownloaded);
  }
  
  function showError() {
    // Show the error state in the toolbar.
    button.badge = "\u2716"; // multiplication x
    button.badgeColor = "#ff0000";
  }
  
  function getDownloadRoot() {
    return prefs.downloadFolder; 
    //return OS.Path.join(OS.Constants.Path.homeDir, "temp"); 
  }
  
  function normalizePaths(info) {
    // Get normalized paths from the submission metadata
    var downloadRoot = getDownloadRoot();
    if (!downloadRoot) {
      return null;
    }
    var serviceDir = OS.Path.normalize(OS.Path.join(
      downloadRoot, 
      sanitizeFilename(info.service)));
    var targetDir = OS.Path.join(serviceDir, sanitizeFilename(info.user));
    var targetPath = OS.Path.join(targetDir, sanitizeFilename(info.filename));
    return {
      downloadRoot: downloadRoot,
      serviceDir: serviceDir,
      targetDir: targetDir,
      targetPath: targetPath
    }
  }
  
  function handleCheckIfDownloaded(info) {
    var paths = normalizePaths(info);
    if (!paths) {
      showError(false);
      return;
    }
    OS.File.exists(paths.targetPath).then(function (fileExists) {
      updateDownloadedState(fileExists);
    }, function () {
      updateDownloadedState(false);
    });
  }
  
  function validateSubmissionMetadata(info) {
    if (!info.url) {
      console.error("Download URL not found.");
      return false;	
    }
    if (!info.user)	{
      console.error("Username not found.");
      return false;
    }
    if (!info.filename)	{
      console.error("Filename not found.");
      return false;
    }
    if (!info.service) {
      console.error("Service not found.");
      return false;
    }
    return true;
  }
  
  function handleGotDownload(info) {
    // Handler for the gotDownload message
    
    if (!validateSubmissionMetadata(info)) {
      showError();
      worker.port.emit("downloadError", "Invalid paths.");
      return false;
    }
    var paths = normalizePaths(info);
    if (!paths) {
      showError();
      worker.port.emit("downloadError", "Download folder not set up.");
      return false;
    }
    
    var sourceUrl = info.url;
    var serviceDir = paths.serviceDir;
    var targetDir = paths.targetDir;
    var targetPath = paths.targetPath;
    
    // Start the download process.
    createTargetFolder(serviceDir)
      .then(function () { return createTargetFolder(targetDir); })
      .then(rejectIfFileExists)
      .then(downloadFile)
      .then(function () {
        updateDownloadedState(true);
        showNotification("Finished downloading " + info.filename);
        worker.port.emit("downloadComplete");
      }, function (error) {
        showError();
        worker.port.emit("downloadError", error);
      });
      
    function rejectIfFileExists() {
      // Returns a promise that rejects if the file exists.
      return new Promise(function (resume, abort) {
        OS.File.exists(targetPath).then(function (fileExists) {
          if (fileExists) { 
            abort("File already exists: " + targetPath);
          } else {
            resume();
          }
        }, abort);
      });
    }
    
    function downloadFile() {
      // Downloads the file.
      return Task.spawn(function () {
        worker.port.emit("downloadStart");
        var download = yield Downloads.createDownload({
          source: sourceUrl,
          target: targetPath
        });
        
        download.onchange = function () {
          console.log("Downloaded " + download.progress + "%");
          worker.port.emit("downloadProgress", download.progress);
        }
        
        yield download.start();
      })
    }
  }
  
  function createTargetFolder(targetDir) {
    // Creates the target folder.
    // Important: path must be sanitized before passing to this method.
    return OS.File.makeDir(targetDir, { ignoreExisting: true });
  }
  
  function showFolderInExplorerFromInfo(info) {
    // TODO: FileUtils is a deprecated API, is there a replacement?
    var paths = normalizePaths(info);
    if (!showFolderInExplorer(paths.targetPath)) {
      showFolderInExplorer(paths.targetDir);
    }
  }
  
  function showFolderInExplorer(path) {
    var file = new FileUtils.File(path);
    if (file.exists()) {
      file.reveal();
      return true;
    } 
    return false;
  }
  
  
  function showNotification(msg, context) {
    // Shows a popup notification.
    // TODO: should probably change this to use a panel instead of desktop notifications.
    notifications.notify({
      title: "Raccoony",
      text: msg,
      iconUrl: "./icon-32.png"
    }); 
    worker.port.emit("notification", msg, context);
  }
  
  button.on("click", function (state) { 
    if (!downloaded) {
      worker.port.emit("getDownload");
    } else {
      worker.port.emit("beginShowFolder");
    }
  })
}

//////////////////////
// Utility functions
// TODO: move to a separate file?

function sanitizeFilename(filename)
{
  // Strip any non-alphanumeric characters at the beginning of the filename.
  filename = filename.replace(/^[^a-zA-Z0-9]+/, "");
  // Replace any spaces with underscores
  filename = filename.replace(" ", "_");
  // Replace any consecutive dots (e.g. "..") with a single dot.
  filename = filename.replace(/\.+/g, ".");
  // Strip out anything non-alphanumeric that isn't a -, _ or .
  return filename.replace(/[^a-zA-Z0-9-_.]/g, "");
}

function merge(depth, target, source) {
  // Merges two (or more) objects, giving the last one precedence
  // If depth is specified, merges them that number of levels recursively.
  var startExtra = 3;
  if (typeof depth === "object") {
    // User didn't specify what kind of merge they want.
    // Default to shallow merge.
    startExtra = 2;
    source = target;
    target = depth;
    depth = 0;
  }

  if (typeof target !== 'object') {
    // Create an empty object to merge to if none was provided.
    target = {};
  }
  
  if (typeof depth !== "number")
  {
    // If we weren't given a maximum depth for recursion, cast from a boolean.
    // Maximum depth is 16 if depth coerces to true.
    depth = depth ? 16 : 0;
  }
  
  // Merge source with target
  for (var property in source) {
    if ( source.hasOwnProperty(property) ) {
      var sourceProperty = source[ property ];
      if (depth > 0 && typeof sourceProperty === 'object' ) {
        target[ property ] = merge(depth - 1, target[ property ], sourceProperty );
        continue;
      }
      target[ property ] = sourceProperty;
    }
  }
  
  // Merges the rest of the objects on the arguments list
  for (var a = startExtra, l = arguments.length; a < l; a++) {
    merge(depth, target, arguments[a]);
  }
  
  return target;
};
