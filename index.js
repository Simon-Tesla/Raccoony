var {Cu, Cc, Ci} = require("chrome");
var Downloads = Cu.import("resource://gre/modules/Downloads.jsm").Downloads;
var OS = Cu.import("resource://gre/modules/osfile.jsm").OS;	
var Promise = Cu.import("resource://gre/modules/Promise.jsm").Promise;
var Task = Cu.import("resource://gre/modules/Task.jsm").Task;
var notifications = require("sdk/notifications");
var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var prefs = require('sdk/simple-prefs').prefs;
var tabs = require("sdk/tabs");

var data = self.data;

//var load_weasylDownload = data.url("weasylDownload.js");
var pageMod = pageMod.PageMod({
  include: "https://www.weasyl.com/submission/*",
  contentScriptFile: "./weasylDownload.js",
  onAttach: onPageLoad
})

var button = buttons.ActionButton({
  id: "raccoony-link",
  label: "Save Image",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  disabled: true
});

tabs.on("open", onTabOpen);

function onTabOpen(tab) {
  // Attach tab event handlers.
  tab.on("activate", onTabActivate);
}

function onTabActivate() {
  //TODO: figure out why this doesn't work. :P
  button.disabled = true;
}


function onPageLoad(worker) {
  // PageMod handler
  worker.port.on("gotDownload", handleGotDownload);
  worker.port.on("checkIfDownloaded", handleCheckIfDownloaded)
  worker.tab.on("activate", function () {
    button.disabled = false;
  });
  button.disabled = false;
  
  function getDownloadRoot() {
    return prefs.downloadFolder; 
    //return OS.Path.join(OS.Constants.Path.homeDir, "temp"); 
  }
  
  function normalizePaths(dl) {
    // Get normalized paths from the submission metadata
    var downloadRoot = getDownloadRoot();
    if (!downloadRoot) {
      return null;
    }
    var serviceDir = OS.Path.normalize(OS.Path.join(
      downloadRoot, 
      sanitizeFilename(dl.service)));
    var targetDir = OS.Path.join(serviceDir, sanitizeFilename(dl.user));
    var targetPath = OS.Path.join(targetDir, sanitizeFilename(dl.filename));
    return {
      downloadRoot: downloadRoot,
      serviceDir: serviceDir,
      targetDir: targetDir,
      targetPath: targetPath
    }
  }
  
  function handleCheckIfDownloaded(dl)  {
    var paths = normalizePaths(dl);
    if (!paths) return;
    OS.File.exists(paths.targetPath).then(function (fileExists) {
      if (fileExists) { 
        button.badge = "D";
      } else {
        button.badge = null;
      }
    });
  }
  
  function handleGotDownload(dl) {
    // Handler for the gotDownload message
    var paths = normalizePaths(dl);
    if (!paths) {
      showNotification("TODO: downloadFolder not configured");
      return false;
    }
    
    var sourceUrl = dl.url;
    var serviceDir = paths.serviceDir;
    var targetDir = paths.targetDir;
    var targetPath = paths.targetPath;

    function rejectIfFileExists() {
      // Returns a promise that rejects if the file exists.
      return new Promise(function (resume, abort) {
        OS.File.exists(targetPath).then(function (fileExists) {
          if (fileExists) { 
            abort("File already exists: " + targetPath);
          } else {
            resume();
          }
        });
      });
    }
    
    function downloadFile() {
      // Downloads the file.
      return Task.spawn(function () {
        var download = yield Downloads.createDownload({
          source: sourceUrl,
          target: targetPath
        });
        
        yield download.start();
      })
    }
    
    // Start the download process.
    createTargetFolder(serviceDir)
      .then(function () { return createTargetFolder(targetDir) })
      .then(rejectIfFileExists)
      .then(downloadFile)
      .then(function () {
        button.badge = "D";
        showNotification("Finished downloading " + dl.filename);
      }, function (error) {
        showNotification("Error: " + error);
      });
  }
  
  function createTargetFolder(targetDir) {
    // Creates the target folder.
    // Important: path must be sanitized before passing to this method.
    return OS.File.makeDir(targetDir, { ignoreExisting: true });
  }
    
  button.on("click", function (state) { 
    if (!getDownloadRoot())
    {
      //TODO can we take them to the page to set the options?
      showNotification("Download root not configured.")
    }
    if (state.badge != "D") {
      worker.port.emit("getDownload");
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

function showNotification(msg) {
  // Shows a popup notification with a timeout.
  notifications.notify({
    title: "Raccoony",
    text: msg,
    iconUrl: "./icon-32.png"
  }); 
}