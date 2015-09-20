function getSubmissionMetadata() {
	// Get the download button
	var buttonSpan = document.querySelector("#detail-actions .icon-arrowDown");
	var button = buttonSpan.parentElement;
	
	// Get the URL
	var url = button.getAttribute("href");
	var urlObj = new URL(url);
	
	// Get the filename
	var filename = urlObj.pathname.split('/').pop();
	
	// Get the username
	// Weasyl download URLs are of the format 
	// https://cdn.weasyl.com/~user/submissions/##/####/user-filename.jpg?download
	var pathParts = urlObj.pathname.split('/'); // "/~user/..."
	var username = pathParts[1] || "";
	username = username.replace("~", "");
	
	return {
		url: url,
		user: username,
		filename: filename,
		service: "weasyl"
	}
}
