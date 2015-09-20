var downloadButton = null;
var downloadUrl = "";

function getDownloadButton() {
	//Get the span
	var buttonSpan = document.querySelector("#detail-actions .icon-arrowDown");
	return buttonSpan.parentElement;
}

function getDownloadUrl() {
	var button = getDownloadButton();
	return button.getAttribute("href");
}

function getUserName(url) {
	// Weasyl download URLs are of the format 
	// https://cdn.weasyl.com/~user/submissions/##/####/user-filename.jpg?download
	
	var pathParts = url.pathname.split('/'); // "/~user/..."
	var username = pathParts[1] || "";
	return username.replace("~", "");
}

function getFileName(url) {
	return url.pathname.split('/').pop();
}

function getSubmissionMetadata()
{
	var url = getDownloadUrl();
	var urlObj = new URL(url);
	
	return {
		url: url,
		user: getUserName(urlObj),
		filename: getFileName(urlObj),
		service: "weasyl"
	}
}

self.port.emit("checkIfDownloaded", getSubmissionMetadata());

self.port.on("getDownload", function() {
	var info = getSubmissionMetadata();
	if (!info.url) {
		console.error("Download URL not found.");
		return false;	
	}
	if (!info.user)
	{
		console.error("Username not found.");
		return false;
	}
	if (!info.filename)
	{
		console.error("Filename not found.");
		return false;
	}
	
	self.port.emit("gotDownload", info);
});