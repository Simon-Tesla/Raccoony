var tabs = require("sdk/tabs");
var { prefs } = require('sdk/simple-prefs');
var self = require("sdk/self");

var firstRunUrl = "http://raccoony.thornvalley.com"

function onStartup() {
    // If the first-run version doesn't match the current version, show the first run tab
    if (prefs.firstRunVersion === self.version) {
        return;
    }

    tabs.open(firstRunUrl);

    // Set the first run version.
    prefs.firstRunVersion = self.version;
}

exports.onStartup = onStartup;