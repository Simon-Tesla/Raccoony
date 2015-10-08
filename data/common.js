//TODO: separate out into individual files (maybe some lightweight non-loading AMD pattern?)

////////////////////
// File type mapping
var fileTypes = (function () {
    let extMap = {};
    let fileTypes = {
        'image': ['jpg', 'jpeg', 'png', 'gif'],
        'text': ['txt', 'rtf', 'doc', 'docx', 'odf'],
        'flash': ['swf'],
        'video': ['mpeg', 'mpg', 'mp4', 'avi', 'divx', 'mkv', 'flv', 'mov', 'wmv']
    };

    // Create extension to type mapping
    for (let type in fileTypes) {
        let extList = fileTypes[type];
        for (let ext of extList) {
            extMap[ext] = type;
        }
    };

    fileTypes.getTypeByExt = function (ext) {
        return extMap[ext] || "unknown";
    };

    return fileTypes;
})();

///////////////////////////////
// Submission metadata handlers

let _submissionMetadataPromise = null;
let _submissionListPromise = null;

function getSubmissionMetadataCached() {
    if (!_submissionMetadataPromise || site.nocache) {
        _submissionMetadataPromise = site.getSubmissionMetadata();
    }
    return _submissionMetadataPromise;
};

function getSubmissionListCached() {
    if (!_submissionListPromise || site.nocache) {
        _submissionListPromise = site.getSubmissionList();
    }
    return _submissionListPromise;
}

// Submission metadata responder
function getMetadataResponderFn(emitEventName) {
    return function () {
        getSubmissionMetadataCached().then(function (info) {
            self.port.emit(emitEventName, info);
        });
    }
}

self.port.on("beginCheckIfDownloaded", getMetadataResponderFn("checkIfDownloaded"))
self.port.on("getDownload", getMetadataResponderFn("gotDownload"));
self.port.on("beginShowFolder", getMetadataResponderFn("showFolder"));

// Submission list responder
function getSubmissionListResponderFn(emitEventName) {
    return function () {
        getSubmissionListCached().then(function (list) {
            self.port.emit(emitEventName, list);
        });
    };
}
self.port.on("getSubmissionList", getSubmissionListResponderFn("gotSubmissionList"));

(function () {
    var _ui = {};
    var _isDownloaded = false;
    function _n(name) {
        return "raccoony-" + name;
    }
    
    function _el(id) {
        return document.getElementById(_n(id));
    }

    function injectUi() {
        //TODO: refactor the UI bits to have better seperation of concerns, possibly some lightweight MVVM/MVC pattern.
        //TODO: is there a better way to do templates? :P
        //TODO: refactor to use Zepto more, especially for hiding/showing UI.
        //TODO: use contentScriptOptions to pass prefs/templates to the content script.
        //TODO: replace Magnific Popup with a smaller image viewer (write our own?)

        var mainUi = _ui.main = document.createElement("DIV");
        mainUi.id = _n("ui");
        mainUi.classList.add(_n("hide"));
        mainUi.innerHTML =
            '<a id="' + _n("close") + '" title="Hide Raccoony">&#x2716;</a>' +
            '<a id="' + _n("imglink") + '" title="Raccoony - click for page options"><img src="resource://raccoony/data/icon-64.png" id="' + _n("img") + '" /></a>' +
            '<div id="' + _n("ctr") + '">' +
                '<div id="' + _n("notify") + '" class="' + _n("bubble") + ' ' + _n("hide") + '">' +
                    '<div id="' + _n("message") + '"></div>' +
                    '<progress value="0" max="100" id="' + _n("dl-progress") + '" class="' + _n("nodisplay") + '" />' +
                '</div>' +
                '<div id="' + _n("tools") + '" class="' + _n("bubble") + ' ' + _n("hide") + '">' +
                    '<div class="' + _n("nodownload") + '"><div class="rc-icon">&#x26A0;</div> The download folder for Raccoony is not set up! Please go to the add-on settings in <a href="about:addons">Add-ons</a> &gt; Extensions, and click the Options button to set it up.</div>' +
                    '<div class="' + _n("reqdownload") + '">' +
                        '<button id="' + _n("download") + '" class="' + _n("action") + '"><span>&#x25BC;</span> Download</button>' +
                        '<button id="' + _n("open-folder") + '" class="' + _n("action") + '"><span>&#x1f4c2;</span> Open folder</button> ' +
                        '<button id="' + _n("fullscreen") + '" class="' + _n("action") + '" style="display:none"><span>&#x1F50E;</span> Fullscreen</button> ' +
                        '<button id="' + _n("close-fullscreen") + '" class="' + _n("action") + '" style="display:none"><span>&#x2716;</span> Exit fullscreen</button> ' +
                        '<button id="' + _n("open-all") + '" class="' + _n("action") + '"><span>&#x27A5;</span> Open all in tabs</button> ' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(mainUi);
        _ui.progress = _el("dl-progress");
        _ui.logo = _el("imglink");
        _ui.notify = _el("notify");
        _ui.message = _el("message");
        _ui.close = _el("close");
        _ui.tools = _el("tools")
        
        // Close button handler
        _ui.close.addEventListener("click", function (ev) {
            hideElt(mainUi);
            ev.preventDefault();
        });
        
        // Logo click handler
        _ui.logo.addEventListener("click", function (ev) {
            getMetadataResponderFn("checkIfDownloaded")();
            var skipAnim = visibleElt(_ui.notify);
            hideElt(_ui.notify, true).then(function () {
                toggleElt(_ui.tools, skipAnim);	
            })
        });
        
        // Action button handlers.
        _el("download").addEventListener("click", function(ev) {
            if (!_isDownloaded) {
                getMetadataResponderFn("gotDownload")();
                hideElt(_ui.tools, true);
            }
        });
        _el("open-folder").addEventListener("click", function(ev) {
            getMetadataResponderFn("showFolder")();
            hideElt(_ui.tools);
        });

        _el("fullscreen").addEventListener("click", function (ev) {
            hideElt(_ui.tools);
            openFullscreenPreview();
        });
        self.port.on("showFullscreen", openFullscreenPreview);

        function openFullscreenPreview() {
            getSubmissionMetadataCached().then(function (info) {
                if (info.url && info.type === "image") {
                    $.magnificPopup.open({
                        items: {
                            src: info.url
                        },
                        type: 'image',
                        callbacks: {
                            open: function () {
                                $(_el("fullscreen")).hide();
                                $(_el("close-fullscreen")).show();
                            },
                            close: function () {
                                $(_el("fullscreen")).show();
                                $(_el("close-fullscreen")).hide();
                            }
                        }
                    }, 0);
                }
            });
        }
        $(_el("close-fullscreen")).click(function () {
            $.magnificPopup.instance.close();
            hideElt(_ui.tools);
        });

        _el("open-all").addEventListener("click", function (ev) {
            getSubmissionListResponderFn("gotSubmissionList")();
            hideElt(_ui.tools);
        });
        
        // Hide tools when mousing away for more than a second.
        var mouseLeaveTimeout = null;
        mainUi.addEventListener("mouseleave", function (ev) {
            mouseLeaveTimeout = setTimeout(function () {
                hideElt(_ui.tools);
                mouseLeaveTimeout = null;
            }, 1000);
        });
        mainUi.addEventListener("mouseenter", function (ev) {
            if (mouseLeaveTimeout) {
                clearTimeout(mouseLeaveTimeout);
            }
            if (!visibleElt(_ui.notify)) {
                showElt(_ui.tools);
            }
        });
        
        window.addEventListener("wheel", function (ev) {
            if (ev.deltaY > 0 && $.magnificPopup.instance) {
                $.magnificPopup.instance.close();
            } else if (window.scrollY === 0) {
                // TODO: make this respect the configuration
                openFullscreenPreview();
            }
        });

        checkIfDownloadRootSet();
        checkIfDownloaded();

        if (site.forceSubmissionListOn && site.forceSubmissionListOn()) {
            // In some cases, the site may not have a submission list ready in the DOM on page load.
            // This allows us to show the open all in tabs UI in spite of that.
            _ui.tools.classList.add(_n("haslist"));
            _ui.main.classList.remove(_n("hide"));
        }

        getSubmissionListCached().then(function (data) {
            // If we have a submission list, show the folder UI.
            let list = data.list;
            if (list && list.length > 0) {
                _ui.tools.classList.add(_n("haslist"));
                _ui.main.classList.remove(_n("hide"));
            }
        });

        getSubmissionMetadataCached().then(function (info) {
            // If we have submission metadata, show the download UI.
            if (info) {
                _ui.tools.classList.add(_n("hassub"));
                _ui.main.classList.remove(_n("hide"));
                if (info.url && info.type === "image") {
                    $(_el("fullscreen")).show();
                }
            }
        });
    }
    
    function updateNotificationMessage(msg) {
        _ui.message.innerHTML = msg;
    }
    
    function hideProgress() {
        setTimeout(function() {
            hideElt(_ui.notify).then(function () {
                _ui.main.classList.remove("active");
                _ui.progress.classList.add(_n("hide"));
            });
        }, 10000);
    }
    
    function showIsDownloaded() {
        _isDownloaded = true;
        var dl = _el("download");
        dl.innerHTML = "<span>&#x2713;</span> File exists";
        dl.disabled = true;
    }
    
    function checkIfDownloaded() {
        return new Promise(function (resolve, reject) {
            var handler = function (isDownloaded) {
                self.port.removeListener("isDownloaded", handler);
                if (isDownloaded) {
                    showIsDownloaded();
                }
                resolve(isDownloaded);
            }
            self.port.on("isDownloaded", handler);
            getMetadataResponderFn("checkIfDownloaded")();
        });
    }
    
    function checkIfDownloadRootSet() {
        return new Promise(function (resolve, reject) {
            var handler = function (isRootSet) {
                self.port.removeListener(handler);
                if (!isRootSet) {
                    _ui.tools.classList.add(_n("need-dl-setup"));
                } else {
                    _ui.tools.classList.remove(_n("need-dl-setup"));
                }
                _el("download").disabled = !isRootSet;
                _el("open-folder").disabled = !isRootSet;
                self.port.removeListener("gotDownloadRootSet", handler)
            }
            self.port.on("gotDownloadRootSet", handler);
            self.port.emit("getDownloadRootSet");
        });
    }
    
    self.port.on("injectUi", injectUi);
    self.port.on("downloadStart", function () {
        _ui.progress.classList.remove(_n("hide"));
        _ui.main.classList.add("active");
        updateNotificationMessage('Downloading... (<span id="'+_n("percent")+'">0</span>%)');
        showElt(_ui.notify);
        _ui.progress.value = 0;
    });
    self.port.on("downloadProgress", onDownloadProgress);
    self.port.on("downloadComplete", function () {
        onDownloadProgress(100);
        updateNotificationMessage('Download complete.');
        showIsDownloaded();
        hideProgress();
    });
    self.port.on("downloadError", function (msg) {
        updateNotificationMessage('Error downloading. ' + msg);
        hideProgress();
    });
    
    function onDownloadProgress(percent) {
        _el("percent").innerHTML = percent;
        _ui.progress.value = percent;
    }

    function visibleElt(el) {
        return !el.classList.contains(_n("hide"));
    }
    
    function toggleElt(el, skipAnim) {
        if (visibleElt(el)) {
            return hideElt(el, skipAnim);
        } else {
            return showElt(el, skipAnim);
        }
    }
    
    function showElt(el, skipAnim) {
        return new Promise(function (resolve, reject) {
            if (skipAnim) {
                el.classList.remove(_n("begin-hide"));
                el.classList.remove(_n("hide"));
                resolve();
            } else {
                var listener = function () {
                    el.removeEventListener("animationend", listener);
                    resolve();
                }
                el.addEventListener("animationend", listener);
                el.classList.remove(_n("begin-hide"));
                el.classList.remove(_n("hide"));
                el.classList.add(_n("show"));
            }
        });
    }
    
    function hideElt(el, skipAnim) {
        return new Promise(function (resolve, reject) {
            if (skipAnim) {
                el.classList.remove(_n("show"));
                el.classList.add(_n("hide"));
                resolve();
            } else {
                var listener = function () {
                    // Adding a class with display: none immediately hides the element.
                    // We get around this by waiting for the animation to complete before adding that class.
                    el.classList.add(_n("hide"));
                    el.classList.remove(_n("begin-hide"));
                    el.removeEventListener("animationend", listener);
                    resolve();
                };
                el.addEventListener("animationend", listener);
                el.classList.add(_n("begin-hide"));
                el.classList.remove(_n("show"));
            }
        })
    }
    
    function closest(el, selector) {
        // Find the closest parent to the given element that matches the selector.
        // Returns the element, or null if no element was found.
        var parent;
        while (el!==null) {
            parent = el.parentElement;
            if (parent !== null && parent.matches(selector)) {
                return parent;
            }
            el = parent;
        }
    
        return null;
    }
})();