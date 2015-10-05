var {Cu, Cc, Ci} = require("chrome");
//var Downloads = Cu.import("resource://gre/modules/Downloads.jsm").Downloads;
//var OS = Cu.import("resource://gre/modules/osfile.jsm").OS;	
// TODO: convert to using PromiseUtils.jsm or core/promises
//var Promise = Cu.import("resource://gre/modules/Promise.jsm").Promise;
//var Task = Cu.import("resource://gre/modules/Task.jsm").Task;
//var FileUtils = Cu.import("resource://gre/modules/FileUtils.jsm").FileUtils;
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var prefs = require('sdk/simple-prefs').prefs;

var openTabs = require("./lib/openTabs.js");
var Downloader = require("./lib/downloader.js").Downloader;

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

var commonScript = ["./zepto.js", "./magnific.js", "./common.js"];
var commonCss = ["./magnific.css", "./pageUi.css"];

pageMod.PageMod({
    include: "https://www.weasyl.com/*",
    contentScriptFile: ["./plugins/weasyl.js"].concat(commonScript),
    contentStyleFile: commonCss,
    onAttach: onPageLoad,
    contentScriptWhen: "ready"
});

pageMod.PageMod({
    include: "https://www.sofurry.com/*",
    contentScriptFile: ["./plugins/sofurry.js"].concat(commonScript),
    contentStyleFile: commonCss,
    onAttach: onPageLoad,
    contentScriptWhen: "ready"
});

pageMod.PageMod({
    include: "https://inkbunny.net/*",
    contentScriptFile: ["./plugins/inkbunny.js"].concat(commonScript),
    contentStyleFile: commonCss,
    onAttach: onPageLoad,
    contentScriptWhen: "ready"
});

pageMod.PageMod({
    include: ["https://www.furaffinity.net/*", "http://www.furaffinity.net/*"],
    contentScriptFile: ["./plugins/furaffinity.js"].concat(commonScript),
    contentStyleFile: commonCss,
    onAttach: onPageLoad,
    contentScriptWhen: "ready"
});

pageMod.PageMod({
    include: "*.deviantart.com", 
    contentScriptFile: ["./plugins/deviantart.js"].concat(commonScript),
    contentStyleFile: commonCss,
    onAttach: onPageLoad,
    contentScriptWhen: "end" //DeviantArt renders its UI dynamically, so the DOM can't be scraped at onReady time.
});

function onPageLoad(worker) {
    // PageMod handler
    console.log("Entering onPageLoad");
    var downloaded = false;
    worker.port.emit("injectUi");
    worker.port.on("gotDownload", handleGotDownload);
    worker.port.on("checkIfDownloaded", handleCheckIfDownloaded);
    worker.port.on("showFolder", showFolderInExplorerFromInfo);
    worker.port.on("getDownloadRootSet", function () {
        worker.port.emit("gotDownloadRootSet", !!getDownloadRoot());
    });
    worker.port.on("gotSubmissionList", openAllInTabs)
  
    worker.tab.on("activate", enableButton);
    worker.tab.on("deactivate", disableButton);
    worker.tab.on("close", function () {
        if (worker.tab === tabs.activeTab) {
            disableButton();
        }
    });

    if (worker.tab === tabs.activeTab) {
        enableButton();
    }

    if (prefs.showFullscreenOnLoad) {
        worker.port.emit("showFullscreen");
    }
  
    function handleButtonClick(state) { 
        if (worker.tab === tabs.activeTab)
        {
            // TODO: handle non-submission pages appropriately.
            if (!downloaded) {
                worker.port.emit("getDownload");
            } else {
                worker.port.emit("beginShowFolder");
            }
        }
    };
  
    function enableButton() {
        // Enable the button if we're on a supported page.
        button.on("click", handleButtonClick);
        button.disabled = false;
        worker.port.emit("beginCheckIfDownloaded");
    }

    function disableButton() {
        // Disable the button whenever we switch away from this tab.
        button.badge = null;
        button.disabled = true;
        button.removeListener("click", handleButtonClick);
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
  
    function showErrorBadge() {
        // Show the error state in the toolbar.
        button.badge = "\u2716"; // multiplication x
        button.badgeColor = "#ff0000";
    }
  
    function openAllInTabs(data) {
        let list = data.list;
        let order = data.nosort && prefs.tabLoadOrder.charAt(0) !== "P" ? "P-A" : prefs.tabLoadOrder;
        console.log("Opening tabs:", order, list);
        openTabs.openAllInTabs(list, prefs.tabLoadDelay, order);
    }

    function getDownloadRoot() {
        return prefs.downloadFolder; 
    }
  
    function handleCheckIfDownloaded(info) {
        console.log("handleCheckIfDownloaded", info);
        let downloader = new Downloader(getDownloadRoot());
        downloader.exists(info).then(function (fileExists) {
            updateDownloadedState(fileExists);
        }, function () {
            updateDownloadedState(false);
        });
    }
  
    function handleGotDownload(info) {
        // Handler for the gotDownload message
        console.log("handleGotDownload", info);
        let downloader = new Downloader(getDownloadRoot());
        downloader.download(info, function () {
            // onDownloadStart
            console.log("onDownloadStart");
            worker.port.emit("downloadStart");
        }, function (progress) {
            // onDownloadProgress
            console.log("onDownloadProgress", progress);
            worker.port.emit("downloadProgress", progress);
        }).then(function () {
            console.log("onDownloadFinished");
            updateDownloadedState(true);
            worker.port.emit("downloadComplete");
        }, function (error) {
            console.log("onDownloadError", error);
            showErrorBadge();
            worker.port.emit("downloadError", error);
        });
    }
  
    function showFolderInExplorerFromInfo(info) {
        console.log("showFolderInExplorerFromInfo", info);
        let downloader = new Downloader(getDownloadRoot());
        downloader.showFolder(info);
    }
}