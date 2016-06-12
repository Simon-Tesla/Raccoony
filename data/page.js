var Page = (function () {
    
    var observeDOM = (function () {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        return function (obj, callback) {
            // define a new observer
            var obs = new MutationObserver(function (mutations, observer) {
                if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe(obj, { childList: true, subtree: true });
        }
    })();

    function Page(sitePlugin) {
        let _this = this;
        this.site = sitePlugin;
        this.downloaded = null;
        this._popup = null;
        this._submission = null;
        this._list = null;
        this._handlers = {};

        // Set up port handlers
        self.port.on("beginCheckIfDownloaded", this._metadataResponderFnFactory("checkIfDownloaded"))
        self.port.on("getDownload", $.proxy(this.download, this));
        self.port.on("beginShowFolder", $.proxy(this.showFolder, this));

        self.port.on("getSubmissionList", this._listResponderFnFactory("gotSubmissionList"));
        self.port.on("beginOpenAllInTabs", $.proxy(this.openAllInTabs, this));

        self.port.on("showFullscreen", $.proxy(this.showFullscreen, this));
        self.port.on("toggleFullcreen", $.proxy(this.toggleFullscreen, this));

        self.port.on("injectUi", function (initProps) {
            _this._emit(Events.injectUi, [initProps]);
        });

        self.port.on("downloadStart", function () {
            _this._emit(Events.downloadStart);
        });
        self.port.on("downloadComplete", function () {
            _this.downloaded = true;
            _this._emit(Events.downloadEnd);
        });
        self.port.on("downloadProgress", function (percent) {
            _this._emit(Events.downloadProgress, [percent]);
        });
        self.port.on("downloadError", function (msg) {
            _this._emit(Events.downloadError, [msg]);
        })

        if (_this.site.reinitOnMutation)
        {
            // This site uses ajax to change its UI from one thing to another without loading new pages
            // Fire an event whenever DOM mutations occur, so that we can reinit.
            let lastLocation = window.location.href;
            let currentTimeout = null;
            observeDOM(document.querySelector(_this.site.mutationElementSelector), function () {
                if (window.location.href != lastLocation || currentTimeout) {
                    // Limiting to firing events that occur in conjunction with URL changes.
                    // This assumes the site updates the URL when navigating to new "pages".
                    lastLocation = window.location.href;
                    _this.downloaded = null;
                    if (currentTimeout) {
                        // Try to wait for the DOM to settle down before we report the change event.
                        clearTimeout(currentTimeout);
                    }
                    currentTimeout = setTimeout(function () {
                        _this._emit(Events.pageChanged);
                        currentTimeout = null;
                    }, 200);
                }
            });
        }
    }

    let Events = Page.Events = {
        //isDownloaded: 'isDownloaded',
        //needDownloadSetup: 'needDownloadSetup',
        injectUi: 'injectUi',
        fullscreen: 'fullscreen',
        downloadStart: 'downloadStart',
        downloadEnd: 'downloadEnd',
        downloadProgress: 'downloadProgress',
        downloadError: 'downloadError',
        pageChanged: 'pageChanged'
    }

    Page.prototype = {
        // Event handling
        on: function (eventName, handler) {
            /// <summary>
            /// Register a handler for a page event.
            /// </summary>
            /// <param name="eventName">The name of the event.</param>
            /// <param name="handler">The handler for the event.</param>
            if (!$.isFunction(handler)) {
                throw new Error("Not a function");
            };
            let handlers = this._handlers[eventName] || [];
            handlers.push(handler);
            this._handlers[eventName] = handlers;
        },
        off: function (eventName, handler) {
            /// <summary>
            /// Unregister a handler for a page event.
            /// </summary>
            /// <param name="eventName">The name of the event.</param>
            /// <param name="handler">The handler for the event.</param>
            let handlers = this._handlers[eventName];
            if (handlers && handlers.length) {
                let idx = handlers.indexOf(handler);
                if (idx !== -1) {
                    handlers.splice(idx, 1);
                }
            }
        },
        _emit: function (eventName, args) {
            // Trigger the event.
            let handlers = this._handlers[eventName] || [];
            for (let handler of handlers) {
                handler.apply(this, args);
            }
        },

        // Properties
        hasSubmissionList: function () {
            /// <summary>
            /// Returns a promise that resolves true if there is a submission list, false otherwise.
            /// </summary>
            let _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.site.forceSubmissionListOn && _this.site.forceSubmissionListOn()) {
                    resolve(true);
                } else {
                    _this.getSubmissionList().then(function (data) {
                        let list = data && data.list;
                        resolve(!!(list && list.length > 0));
                    }, reject);
                }
            });
        },
        hasSubmission: function () {
            /// <summary>
            /// Returns a promise that resolve true if there is a submission, false otherwise.
            /// </summary>
            let _this = this;
            return new Promise(function (resolve, reject) {
                _this.getSubmissionMetadata().then(function (info) {
                    console.log("hasSubmission metadata", info);
                    resolve(!!info);
                }, reject);
            });
        },
        isDownloaded: function () {
            /// <summary>
            /// Returns a promise that resolves true if the submission has been downloaded, false otherwise.
            /// </summary>
            let _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.downloaded === null) {
                    let handler = function (isDownloaded) {
                        self.port.removeListener("isDownloaded", handler);
                        _this.downloaded = isDownloaded;
                        resolve(isDownloaded);
                    }
                    self.port.on("isDownloaded", handler);
                    _this._metadataResponderFnFactory("checkIfDownloaded")();
                } else {
                    resolve(_this.downloaded);
                }
            });
        },
        needDownloadSetup: function () {
            /// <summary>
            /// Returns a promise that resolves true if the user hasn't set up their download folder, false otherwise.
            /// </summary>
            let _this = this;
            return new Promise(function (resolve, reject) {
                var handler = function (isRootSet) {
                    self.port.removeListener(handler);
                    resolve(!isRootSet);
                    self.port.removeListener("gotDownloadRootSet", handler)
                }
                self.port.on("gotDownloadRootSet", handler);
                self.port.emit("getDownloadRootSet");
            });
        },

        // Actions
        download: function () {
            /// <summary>
            /// Starts the download, if it hasn't been started already.
            /// </summary>
            console.log("In page.download()");
            let _this = this;
            this.isDownloaded().then(function (isDownloaded) {
                if (!isDownloaded) {
                    _this._metadataResponderFnFactory("gotDownload")();
                }
                //TODO: show something if already downloaded
            });
        },
        showFolder: function () {
            /// <summary>
            /// Shows the download folder.
            /// </summary>
            console.log("In page.showFolder");
            this._metadataResponderFnFactory("showFolder")();
        },
        openAllInTabs: function () {
            /// <summary>
            /// Opens all submissions in the list in new tabs.
            /// </summary>
            this._listResponderFnFactory("openAllInTabs")();
        },
        showFullscreen: function () {
            /// <summary>
            /// Shows the fullscreen preview
            /// </summary>

            let _this = this;
            return _this.getSubmissionMetadata().then(function (info) {
                url = info.previewUrl || info.url;
                if (url && info.type === "image") {
                    $.magnificPopup.open({
                        items: {
                            src: url
                        },
                        type: 'image',
                        callbacks: {
                            open: function () {
                                _this._popup = $.magnificPopup.instance;
                                _this._emit(Events.fullscreen, [true]);
                            },
                            close: function () {
                                _this._emit(Events.fullscreen, [false]);
                                _this._popup = null;
                            }
                        }
                    }, 0);
                }
            });
        },
        hideFullscreen: function () {
            /// <summary>
            /// Hides the fullscreen preview
            /// </summary>
            this._popup && this._popup.close();
            this._popup = null;
        },
        toggleFullscreen: function () {
            /// <summary>
            /// Shows the fullscreen preview if it isn't currently being shown,
            /// otherwise hides it.
            /// </summary>

            if (this._popup) {
                this.hideFullscreen();
            } else {
                this.showFullscreen();
            }
        },
        openPrefs: function () {
            /// <summary>
            /// Open the preferences page for the add-on
            /// </summary>
            self.port.emit("openPrefs");
        },

        // Private
        getSubmissionMetadata: function () {
            if (!this._submission || this.site.nocache) {
                this._submission = this.site.getSubmissionMetadata();
            }
            return this._submission;
        },
        getSubmissionList: function () {
            if (!this._list || this.site.nocache) {
                this._list = this.site.getSubmissionList();
            }
            return this._list;
        },
        _metadataResponderFnFactory: function (emitEventName) {
            let _this = this;
            return function () {
                return _this.getSubmissionMetadata().then(function (info) {
                    self.port.emit(emitEventName, info);
                });
            };
        },
        _listResponderFnFactory: function (emitEventName) {
            let _this = this;
            return function () {
                return _this.getSubmissionList().then(function (list) {
                    self.port.emit(emitEventName, list);
                });
            };
        }
    }

    return Page;
})()