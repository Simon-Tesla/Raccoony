var tabs = require("sdk/tabs");

function openAllInTabs(list, delay, order) {
    /// <summary>
    /// Opens all the submissions in tabs.
    /// </summary>
    /// <param name="list">The list of submissions.</param>
    /// <param name="delay">The number of seconds to delay before navigating to the next url.</param>
    /// <param name="order">The sort order preference string.</param>

    sortList(list, order);

    for (let ii = 0; ii < list.length; ii++) {
        let url = list[ii].url;
        let currentDelay = ii * delay;
        if (currentDelay === 0) {
            // Open the tab directly to the URL if there is no delay.
            tabs.open({
                url: url,
                inBackground: true
            });
        } else {
            tabs.open({
                url: "./delay.html",
                inBackground: true,
                onReady: function (tab) {
                    let worker = tab.attach({ contentScriptFile: "./delay.js" });
                    worker.port.emit("delayLoad", { url: url, delay: currentDelay });
                }
            });
        }
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