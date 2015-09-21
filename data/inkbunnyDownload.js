function getSubmissionMetadata() {
	
	// TODO: move this into a common location, if possible.
	function parseQueryString(uri) {
		var queryString = {};
		var regex = new RegExp("([^?=&]+)(=([^&]*))?", "g")
		uri.replace(
			regex,
			function($0, $1, $2, $3) { queryString[$1] = $3; }
		);
		return queryString;
	}
	
	// TODO: Use the InkBunny API if possible, as they don't provide good hooks for scraping.
	return new Promise(function (resolve, reject) {
		// Get the max preview button, if it exists
		var button = document.querySelector("#size_container a[target=_blank]");
		var url;
		if (button) {
			// Get the url off of the button.
			// https://us.ib.metapix.net/files/full/XX/[ID?]_[username]_[filename].[ext]
			url = button.href;
		} else {
			// Go for the URL of the image itself if it doesn't.
			// https://us.ib.metapix.net/files/screen/XX/[ID?]_[username]_[filename]-XX.[ext]
			var image = document.querySelector(".widget_imageFromSubmission img");
			url = image.src;
		}		
		
		// Get the filename from the title, since IB seems to munge them too much in the url.
		// Title format:
		//  "[Title] by [User] < Submission | Inkbunny..."
		var docTitle = document.title;
		var filename = docTitle.substring(0, docTitle.lastIndexOf(" by "));
		var ext = url.split(".").pop();
		filename += "." + ext;
		
		// Get the ID from the page URL
		var pageUrl = new URL(window.location.href);
		var params = parseQueryString(pageUrl.search);
		var id = params['id'];
				
		// Get the username
		var username = docTitle.substring(docTitle.lastIndexOf(" by ") + 4, docTitle.lastIndexOf(" < "));
		
		resolve({
			url: url,
			user: username,
			filename: filename,
			submissionId: id,
			service: "inkbunny"
		});
	});
}

