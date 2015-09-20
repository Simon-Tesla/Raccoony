function getMetadataResponderFn(emitEventName) {
	return function () {
		self.port.emit(emitEventName, getSubmissionMetadata());
	}
}

self.port.on("beginCheckIfDownloaded", getMetadataResponderFn("checkIfDownloaded"))
self.port.on("getDownload", getMetadataResponderFn("gotDownload"));
