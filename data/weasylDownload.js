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

self.port.on("getDownload", function() {
	var url = getDownloadUrl();
	if (!url) {
		console.error("Download URL not found.");
		return false;	
	}
	var urlObj = new URL(url);
	var username = getUserName(urlObj);
	var filename = getFileName(urlObj);
	if (!username)
	{
		console.error("Username not found.");
		return false;
	}
	if (!filename)
	{
		console.error("Filename not found.");
		return false;
	}
	
	self.port.emit("gotDownload", {
		url: url,
		user: username,
		filename: filename,
		service: "weasyl"
	});
});