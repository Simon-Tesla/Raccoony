var {Cu, Cc, Ci} = require("chrome");
var Downloads = Cu.import("resource://gre/modules/Downloads.jsm").Downloads;
var OS = Cu.import("resource://gre/modules/osfile.jsm").OS;	
var Promise = Cu.import("resource://gre/modules/Promise.jsm").Promise;
var Task = Cu.import("resource://gre/modules/Task.jsm").Task;
var PopupNotifications = Cu.import("resource://gre/modules/PopupNotifications.jsm");
var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var prefs = require('sdk/simple-prefs').prefs;

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
  }
});

function showNotification(msg){
  PopupNotifications.show(gBrowser.selectedBrowser, 
    "raccoony-popup",
    msg,
    "raccoony-link",
    {
      label: "Okay",
      accessKey: "O"
    },
    null /* secondary action */)
}

function onPageLoad(worker) {
  // PageMod handler
  worker.port.on("gotDownload", handleGotDownload);
  
  function handleGotDownload(dl)
  {
    // Handler for the gotDownload message
    var downloadRoot = prefs.downloadFolder; 
    //var downloadRoot = OS.Path.join(OS.Constants.Path.homeDir, "temp"); 
    if (!downloadRoot) {
      showNotification("TODO: downloadFolder not configured");
      return false;
    }
    
    var sourceUrl = dl.url;
    var serviceDir = OS.Path.normalize(OS.Path.join(
      downloadRoot, 
      sanitizeFilename(dl.service)));
    var targetDir = OS.Path.join(serviceDir, sanitizeFilename(dl.user));
    var targetPath = OS.Path.join(targetDir, sanitizeFilename(dl.filename));

      
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
    
    createTargetFolder(serviceDir)
      .then(function () { return createTargetFolder(targetDir) })
      .then(rejectIfFileExists)
      .then(downloadFile)
      //.then() //TODO handle done/error state
  }
  
  function createTargetFolder(targetDir) {
    // Creates the target folder.
    // Important: path must be sanitized before passing to this method.
    return OS.File.makeDir(targetDir, { ignoreExisting: true });
  }
    
  button.on("click", function (state) {    
    worker.port.emit("getDownload");
  })
}

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