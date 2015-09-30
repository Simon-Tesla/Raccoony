function getSubmissionMetadata() {
    // TODO: Should look into using the SoFurry API for this.
    // TODO: SoFurry only shows a download link when logged in.
    return new Promise(function (resolve, reject) {
        // Get the download button
        var button = document.getElementById("sfDownload");

        // Get the URL
        var url = button.getAttribute("href");
        var id = window.location.href.split("/").pop();

        // Get the filename
        var titleElt = document.getElementById("sfContentTitle");
        var filename = titleElt.textContent;
        // And the extension - we use the preview image to determine this.
        var imgPreview = document.querySelector("#sfContentImage img");
        var ext = imgPreview.getAttribute("src").split('.').pop();
        filename = filename + "." + ext;

        // Get the username
        var usernameElt = document.querySelector("#sf-userinfo-outer .sf-username");
        var username = usernameElt.textContent;

        resolve({
            url: url,
            user: username,
            filename: filename,
            submissionId: id,
            service: "sofurry"
        });
    });
}
