function getSubmissionMetadata() {
	// TODO: Is there a deviantArt API?
	return new Promise(function (resolve, reject) {
		// Get the download button
		var button = document.querySelector("a.dev-page-download");
		
		// Get the URL
		// dA URLs look like so:
		// http://www.deviantart.com/download/[id]/[filename].[ext]?token=XX&ts=XX
		var url = button.getAttribute("href");
		
		// Get the filename
		var urlObj = new URL(url);
		path = urlObj.pathname.split("/");
		var filename = path.pop();
		var id = path.pop(); 
				
		// Get the username
		var usernameElt = document.querySelector(".dev-title-container .username");
		var username = usernameElt.textContent;
		
		resolve({
			url: url,
			user: username,
			filename: filename,
			submissionId: id,
			service: "deviantart"
		});
	});
}
