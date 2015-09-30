function getSubmissionMetadata() {
    // FA is notoriously difficult to scrape, so we're punting and taking pretty much
    // all of the metadata from the (fortunately nicely formatted) download URL.
    return new Promise(function (resolve, reject) {
        // Get the max preview button, if it exists
        var button = document.querySelector(".actions a[href^='//d.facdn.net/art/']");
        if (!button) {
            // Must be in the Beta UI...
            button = document.querySelector(".subnavcontainer a[href^='//d.facdn.net/art/']");
        }
        var url = button.href;

        // FA download URLs look like so:
        // http://d.facdn.net/art/[username]/[id]/[id].[username]_[origfilename].jpg	
        var urlParts = url.split("/");
        var filename = urlParts.pop();
        var id = urlParts.pop();
        var username = urlParts.pop();

        // Strip off the ID from the filename, so that it doesn't get repeated when saved.
        filename = filename.substring(id.length + 1);

        resolve({
            url: url,
            user: username,
            filename: filename,
            submissionId: id,
            service: "furaffinity"
        });
    });
}