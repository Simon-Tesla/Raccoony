function getSubmissionMetadata() {
    // TODO: Should look into using the Weasyl API for this.
    return new Promise(function (resolve, reject) {
        // Get the download button
        var buttonSpan = document.querySelector("#detail-actions .icon-arrowDown");
        var button = buttonSpan.parentElement;

        // Get the URL
        var url = button.getAttribute("href");
        var urlObj = new URL(url);

        // Get the filename
        // Weasyl download URLs are of the format 
        // https://cdn.weasyl.com/~[user]/submissions/[id]/[hash]/[user]-[filename.ext]?download
        var pathParts = urlObj.pathname.split('/');
        var filename = pathParts.pop();
        pathParts.pop(); //pop off the unneeded hash
        var id = pathParts.pop();

        // Get the username
        var pathParts = urlObj.pathname.split('/'); // "/~user/..."
        var username = pathParts[1] || "";
        username = username.replace("~", "");

        resolve({
            url: url,
            user: username,
            filename: filename,
            submissionId: id,
            service: "weasyl"
        });
    });
}
