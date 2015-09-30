function getSubmissionMetadata() {
    
    // TODO: move this into a common location, if possible.
    //function parseQueryString(uri) {
    //    var queryString = {};
    //    var regex = new RegExp("([^?=&]+)(=([^&]*))?", "g")
    //    uri.replace(
    //        regex,
    //        function($0, $1, $2, $3) { queryString[$1] = $3; }
    //    );
    //    return queryString;
    //}
    
    // TODO: Use the InkBunny API if possible, as they don't provide good hooks for scraping.
    // TODO: Return title and extension as separate metadata items for all scrapers.
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
        
        // Get the filename, submission ID and username from the URL
        var filename = url.split('/').pop();
        var filenameParts = filename.split("_");
        var id = filenameParts.shift();
        var username = filenameParts.shift();
        filename = filenameParts.join("_");

        // Get the filename from the title, since IB seems to munge them too much in the url.
        // Title format:
        //  "[Title] by [User] < Submission | Inkbunny..."
        //var docTitle = document.title;
        //var title = docTitle.substring(0, docTitle.lastIndexOf(" by "));
        //var ext = filename.split(".").pop();
                
        resolve({
            url: url,
            user: username,
            filename: filename,
            submissionId: id,
            //title: title,
            //extension: ext,
            service: "inkbunny"
        });
    });
}

