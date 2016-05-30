var tabs = require("sdk/tabs");

var hasPrimedPrivateTab = false;

function openAllInTabs(list, delay, order, isPrivate) {
    /// <summary>
    /// Opens all the submissions in tabs.
    /// </summary>
    /// <param name="list">The list of submissions.</param>
    /// <param name="delay">The number of seconds to delay before navigating to the next url.</param>
    /// <param name="order">The sort order preference string.</param>
    /// <param name="isPrivate">True if the tabs should be opened in private browsing mode.
    primePrivateTab(isPrivate).then(function () {
        openAllInTabsImpl(list, delay, order, isPrivate);
    });
}

function openAllInTabsImpl(list, delay, order, isPrivate) {
    console.log("openAllInTabsImpl", list);
    sortList(list, order);

    for (let ii = 0; ii < list.length; ii++) {
        let url = list[ii].url;
        let currentDelay = ii * delay;
        if (currentDelay === 0) {
            // Open the tab directly to the URL if there is no delay.
            tabs.open({
                url: url,
                inBackground: true,
                isPrivate: isPrivate,
                inNewWindow: false
            });
        } else {
            tabs.open({
                url: "./delay.html",
                inBackground: true,
                isPrivate: isPrivate,
                inNewWindow: false,
                onReady: function (tab) {
                    let worker = tab.attach({ contentScriptFile: "./delay.js" });
                    worker.port.emit("delayLoad", { url: url, delay: currentDelay });
                }
            });
        }
    }
}

function primePrivateTab(isPrivate) {
    if (isPrivate && !hasPrimedPrivateTab) {
        // Fix for issue #18.
        // Firefox private browsing has a strange behavior where the first time we call tabs.open 
        // inside a private browsing session, it opens them in new windows no matter what.
        // This is used to "prime the pump" when running in that mode so that subsequent calls to 
        // tabs.open behave as expected.
        return new Promise(function (resolve, reject) {
            console.log("primePrivateTab");
            hasPrimedPrivateTab = true;
            //setTimeout(function () { resolve() }, 5000);
            tabs.open({
                url: "./delay.html",
                inBackground: true,
                isPrivate: isPrivate,
                inNewWindow: false,
                onReady: function (tab) {
                    resolve();
                    tab.close();
                }
            });
        });
    } else {
        return Promise.resolve();
    }
}

function sortList(list, order) {
    let params = order.split("-");
    let field = params[0];
    let direction = params[1];

    if (field == "D" && list[0].id) {
        // Only sort by date if we have an ID.
        list.sort(function (a, b) {
            return a.id - b.id;
        });
    }

    if (direction == "D") {
        list.reverse();
    }
}

exports.openAllInTabs = openAllInTabs;