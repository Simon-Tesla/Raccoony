var site = (function () {

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


    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            $links = $(".messages a.thumb, .folderview a.thumb");
            //console.log("$links", $links, $links.length);
            for (let ii = 0; ii < $links.length; ii++) {
                //console.log("entering loop", ii, $links[ii]);

                let $currLink = $links.eq(ii);
                let href = $currLink.prop('href');
                //console.log('Loop', $currLink, href);

                // dA submission URLs are usually of the format
                // http://www.deviantart.com/art/[title]-[id]
                let urlparts = href.split('-');
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