(function () {
    let page = new Page(site);
    let ui = {};

    page.on(Page.Events.injectUi, function (initProps) {
        if (initProps.prefs.hotkeysEnabled) {
            hotkeys.init(page);
        }
        renderUi(initProps);
        addPageEventHandlers(initProps);
        addUiEventHandlers(initProps);
    });

    function n(name) {
        return 'ry-' + name;
    }
    
    function el(name) {
        return $('#' + n(name));
    }

    function visible(el) {
        return el.css('display') !== 'none' && el.css('opacity') !== 0;
    }

    function renderUi(initProps) {
        // Render the UI on the page.
        let logoUrl = initProps.dataPath + "icon-64.png";
        let html = `<a id="${n("close")}" title="Hide Raccoony">&#x2716;</a>` +
            `<a id="${n("imglink")}" title="Raccoony - click for page options"><img src="${logoUrl}" id="${n("img")}" /></a>` +
            `<div id="${n("ctr")}">` +
                `<div id="${n("notify")}" class="${n("bubble")}" style="display:none">` +
                    `<div id="${n("message")}"></div>` +
                    `<progress value="0" max="100" id="${n("dl-progress")}" />` +
                    `<button id="${n("dl-open")}" class="${n("action")}" title="Hotkey: R" style="display:none"><span>&#x1f4c2; </span> Open folder</button>` +
                `</div>` +
                `<div id="${n("tools")}" class="${n("bubble")}" style="display:none">` +
                    `<div id="${n("nodownload")}" style="display:none">` +
                        `<span class="${n('msg')}"><span class ="${n("icon")}">&#x26A0; </span> The download folder for Raccoony is not set up!</span>` +
                        `<button id="${n('open-prefs')}" class ="${n("action")}"><span>&#x2699; </span> Set up Raccoony</button>` +
                    `</div>` +
                    `<button id="${n("download")}" class="${n("action")}" title="Hotkey: D" style="display:none"><span>&#x25BC; </span> Download</button>` +
                    `<button id="${n("open-folder")}" class="${n("action")}" title="Hotkey: R" style="display:none"><span>&#x1f4c2; </span> Open folder</button>` +
                    `<button id="${n("fullscreen")}" class="${n("action")}" title="Hotkey: O" style="display:none"><span>&#x1F50E;</span> Fullscreen</button>` +
                    `<button id="${n("close-fullscreen")}" class="${n("action")}" title="Hotkey: O" style="display:none"><span>&#x2716;</span> Exit fullscreen</button>` +
                    `<button id="${n("open-all")}" class="${n("action")}" title="Hotkey: T" style="display:none"><span>&#x27A5;</span> Open all in tabs</button>` +
                    `<button id="${n('configure')}" class ="${n("action")} ${n('nolabel')}" title="Configure Raccoony"><span>&#x2699;</span></button>` +
                `</div>` +
            `</div>`;

        var main = ui.main = $('<div />', { id: n('ui') });
        main.html(html);
        main.appendTo(document.body);
        ui.progress = el('dl-progress');
        ui.logo = el('imglink');
        ui.notify = el('notify');
        ui.message = el('message');
        ui.close = el('close');
        ui.tools = el('tools');
    }

    function addPageEventHandlers(initProps) {
        // Adjust UI to match page state.
        page.isDownloaded().then(function (isDownloaded) {
            if (isDownloaded) {
                onDownloadFinished();
            }
        });
        page.needDownloadSetup().then(function (needSetup) {
            if (needSetup) {
                onNeedDownloadSetup();
            }
        });
        page.hasSubmission().then(function (hasSubmission) {
            if (hasSubmission) {
                el('download').show();
                el('open-folder').show();
                el('fullscreen').show();
            }
        });
        page.hasSubmissionList().then(function (hasList) {
            if (hasList) {
                el('open-all').show();
            }
        })

        // Handle Page events
        page.on(Page.Events.downloadStart, function () {
            ui.tools.hide();
            el('dl-progress').show();
            el('dl-open').hide();
            updateNotificationMessage(`Downloading... (<span id="${n('percent')}">0</span>%)`);
            ui.main.addClass('active');
            ui.notify.fadeIn();
        });

        page.on(Page.Events.downloadProgress, onDownloadProgress);

        page.on(Page.Events.downloadEnd, function () {
            onDownloadProgress(100);
            updateNotificationMessage('Download complete.');
            el('dl-progress').hide();
            el('dl-open').show();
            onDownloadFinished();
            hideProgressDelay();
        });

        page.on(Page.Events.downloadError, function (msg) {
            if (msg === 'downloadFolder') {
                ui.main.addClass('active');
                onNeedDownloadSetup();
            } else {
                updateNotificationMessage("Error downloading: " + msg);
                hideProgressDelay();
            }
        });

        page.on(Page.Events.fullscreen, function (isFullscreen) {
            el('fullscreen').toggle(!isFullscreen);
            el('close-fullscreen').toggle(isFullscreen);
        });
    }

    function onNeedDownloadSetup() {
        el('nodownload').show();
        el('download').prop('disabled', true);
        el('open-folder').prop('disabled', true);
    }

    function onDownloadProgress(percent) {
        el('percent').text(percent);
        ui.progress.val(percent);
    }

    function updateNotificationMessage(msg) {
        el('message').html(msg);
    }

    function onDownloadFinished() {
        el('download')
            .html('<span>&#x2713;</span> File exists')
            .prop('disabled', true);
    }

    function hideProgressDelay() {
        setTimeout(function () {
            ui.notify.fadeOut(200, function () {
                ui.main.removeClass('active');
            })
        }, 5000);
    }

    function addUiEventHandlers(initProps) {
        // Initiate page actions based on UI events.

        ui.close.click(function (ev) {
            ui.main.fadeOut();
            return false;
        });

        ui.logo.click(function (ev) {
            if (visible(ui.notify)) {
                ui.notify.hide();
                ui.tools.show();
            } else {
                ui.tools.fadeIn();
            }
        });

        // Action button handlers
        el('open-prefs').click(function (ev) {
            page.openPrefs();
        });

        el('configure').click(function (ev) {
            page.openPrefs();
        });

        el('download').click(function (ev) {
            console.log("Clicked download.");
            page.download();
            ui.tools.hide();
        });

        el('open-folder').click(function (ev) {
            console.log("Clicked open folder.");
            page.showFolder();
            ui.tools.fadeOut();
        });

        el('fullscreen').click(function (ev) {
            page.showFullscreen();
            ui.tools.fadeOut();
        });

        el('close-fullscreen').click(function (ev) {
            page.hideFullscreen();
            ui.tools.fadeOut();
        });

        el('open-all').click(function (ev) {
            console.log("Clicked open all.");
            page.openAllInTabs();
            ui.tools.fadeOut();
        });

        el('dl-open').click(function (ev) {
            page.showFolder();
            ui.notify.fadeOut();
        })

        // Hide tools when mousing away for more than a second
        let mouseLeaveTimeout = null;
        ui.main.on('mouseleave', function (ev) {
            mouseLeaveTimeout = setTimeout(function () {
                ui.tools.fadeOut();
                mouseLeaveTimeout = null;
            }, 1000);
        }).on('mouseenter', function (ev) {
            if (mouseLeaveTimeout) {
                clearTimeout(mouseLeaveTimeout);
            }
            if (!visible(ui.notify) && !visible(ui.tools)) {
                // Also show the tools bubble if the notification isn't showing.
                ui.tools.fadeIn();
            };
        });

        // Handle scrolling
        window.addEventListener("wheel", function (ev) {
            if (ev.deltaY > 0) {
                page.hideFullscreen();
            } else if (window.scrollY === 0 && initProps.prefs.autoFullscreen) {
                page.showFullscreen();
            }
        });
    }

})();