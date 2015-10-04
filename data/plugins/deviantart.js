var site = (function () {

    function getSubmissionMetadata() {
        // TODO: Is there a deviantArt API?
        return new Promise(function (resolve, reject) {
            let url, username, filename, id, ext;

            // Get the username
            var usernameElt = document.querySelector(".dev-title-container .username");
            username = usernameElt.textContent;

            // Get the download button
            let button = document.querySelector("a.dev-page-download");

            if (button) {
                // Get the download button URL
                // dA URLs look like so:
                // http://www.deviantart.com/download/[id]/[filename]_by_[username].[ext]?token=XX&ts=XX
                url = button.getAttribute("href");

                // Get the filename
                let urlObj = new URL(url);
                path = urlObj.pathname.split("/");
                filename = path.pop();

                // De-munge the filename
                ext = filename.split(".").pop();
                let byIdx = filename.lastIndexOf("_by_");
                filename = filename.substr(0, byIdx);

                id = path.pop();

            } else {
                // The deviant disabled the download button, so let's just grab the url from the image.
                // dA image URLs look like so:
                // http://img12.deviantart.net/64ca/i/2015/273/f/9/[filename]_by_[user]-d9bi7fp.jpg
                let img = document.querySelector("img.dev-content-full");
                if (!img) {
                    img = document.querySelector("img.dev-content-normal");
                }
                url = img.src;

                // De-munge the filename.
                filename = url.split("/").pop();
                ext = filename.split(".").pop();
                let byIdx = filename.lastIndexOf("_by_");
                filename = filename.substr(0, byIdx);

                // Grab the ID from the img element
                id = img.getAttribute("data-embed-id");
            }

            resolve({
                url: url,
                user: username,
                filename: filename,
                extension: ext,
                submissionId: id,
                service: "deviantart"
            });
        });
    }


    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            let nosort = window.location.pathname.indexOf("/favourites") === 0 ||
                window.location.pathname.indexOf("/browse") === 0 ||
                window.location.search.indexOf("q=") !== -1 ||
                window.location.search.indexOf("order=") !== -1;
            $links = $(".messages a.thumb, .folderview a.thumb, .stream a.thumb");
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
            resolve({
                list: list,
                nosort: nosort
            });
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList
    };
})();