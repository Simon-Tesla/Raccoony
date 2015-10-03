var site = (function () {

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

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            $links = $(".items a.sfArtworkSmallInner");
            console.log("$links", $links, $links.length);
            for (let ii = 0; ii < $links.length; ii++) {
                console.log("entering loop", ii, $links[ii]);

                let $currLink = $links.eq(ii);
                let href = $currLink.prop('href');
                console.log('Loop', $currLink, href);

                // SoFurry submission URLs are of the format
                // https://www.sofurry.com/view/[id]
                let urlparts = href.split('/');
                let id = urlparts.pop();

                list.push({
                    url: href,
                    id: id
                })
            }
            resolve(list);
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList
    };
})();