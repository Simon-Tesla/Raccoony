function getMetadataResponderFn(emitEventName) {
	return function () {
		self.port.emit(emitEventName, getSubmissionMetadata());
	}
}

self.port.on("beginCheckIfDownloaded", getMetadataResponderFn("checkIfDownloaded"))
self.port.on("getDownload", getMetadataResponderFn("gotDownload"));
self.port.on("beginShowFolder", getMetadataResponderFn("showFolder"));

(function () {
	var _ui = {};
	function _n(name) {
		return "raccoony-" + name;
	}
	
	function _el(id) {
		return document.getElementById(_n(id));
	}
	
	var _logoImg = "data:image/png;base64,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";

	function injectUi() {
		var mainUi = _ui.main = document.createElement("DIV");
		mainUi.id = _n("ui");
		mainUi.innerHTML = 
			'<a id="'+_n("close")+'">&#x2716;</a>'+
			'<img src="'+_logoImg+'" id="'+_n("img")+'"/>' +
			'<div id="'+_n("ctr")+'">' +
				'<div id="'+_n("notify")+'" class="'+_n("bubble")+' '+_n("hide")+'">'+
					'<div id="'+_n("message")+'"></div>' +
					'<progress value="0" max="100" id="'+_n("dl-progress")+'" class="'+_n("nodisplay")+'" />'+
				'</div>' +
				'<div id="'+_n("tools")+'" class="'+_n("bubble")+' '+_n("hide")+'">'+
					'Stuff goes here'+
				'</div>' +
			'</div>';
		document.body.appendChild(mainUi);
		_ui.progress = _el("dl-progress");
		_ui.logo = _el("img");
		_ui.notify = _el("notify");
		_ui.message = _el("message");
		_ui.close = _el("close");
		_ui.tools = _el("tools")
		
		_ui.close.addEventListener("click", function (ev) {
			hideElt(mainUi);
		});
		
		_ui.logo.addEventListener("click", function (ev) {
			var skipAnim = visibleElt(_ui.notify);
			hideElt(_ui.notify, true).then(function () {
				toggleElt(_ui.tools, skipAnim);	
			})
		});
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
	
	self.port.on("injectUi", injectUi);
	self.port.on("downloadStart", function () {
		_ui.progress.classList.remove(_n("hide"));
		_ui.main.classList.add("active");
		updateNotificationMessage('Downloading... (<span id="'+_n("percent")+'">0</span>%)');
		showElt(_ui.notify);
		_ui.progress.value = 0;
	});
	self.port.on("downloadProgress", function (percent) {
		_el("percent").innerHTML = percent;
		_ui.progress.value = percent;
	})
	self.port.on("downloadComplete", function () {
		updateNotificationMessage('Download complete.');
		hideProgress();
	});
	self.port.on("downloadError", function (msg) {
		updateNotificationMessage('Error downloading. ' + msg);
		hideProgress();
	});
	
})();