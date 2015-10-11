var site = (function () {
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

    function getSubmissionMetadata() {
        // TODO: Use the InkBunny API if possible, as they don't provide good hooks for scraping.
        // TODO: Return title and extension as separate metadata items for all scrapers.
        return new Promise(function (resolve, reject) {
            // Check to see if we're on a submission page.
            if (window.location.href.indexOf("submissionview.php") === -1) {
                reject();
            }

            // Get the max preview button, if it exists
            var button = document.querySelector("#size_container a[target=_blank]");
            var url;
            if (button) {
                // Get the url off of the button.
                // https://us.ib.metapix.net/files/full/XX/[ID]_[username]_[filename].[ext]
                url = button.href;
            } else {
                // Go for the URL of the image itself if it doesn't.
                // https://us.ib.metapix.net/files/screen/XX/[ID]_[username]_[filename].[ext]
                var image = document.querySelector(".widget_imageFromSubmission img");
                url = image.src;
            }

            // Get the filename, submission ID and username from the URL
            var filename = url.split('/').pop();
            var filenameParts = filename.split("_");
            var id = filenameParts.shift();
            // TODO: the username part of the filename does not change if the user changes their name.
            var username = filenameParts.shift();
            filename = filenameParts.join("_");

            //TODO: don't repeat yourself
            let extIndex = filename.lastIndexOf(".");
            let ext = filename.substring(extIndex + 1);
            filename = filename.substring(0, extIndex);

            // Get the filename from the title, since IB seems to munge them too much in the url.
            // Title format:
            //  "[Title] by [User] < Submission | Inkbunny..."
            //var docTitle = document.title;
            //var title = docTitle.substring(0, docTitle.lastIndexOf(" by "));

            resolve({
                url: url,
                user: username,
                filename: filename,
                submissionId: id,
                //title: title,
                extension: ext,
                type: fileTypes.getTypeByExt(ext),
                service: "inkbunny"
            });
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            let $links;
            let pageParams = parseQueryString(window.location.search);
            let mode = pageParams["mode"];
            let nosort = mode === "search" ||
                mode === "userfavs" ||
                mode === "popular" ||
                mode === "suggestions" ||
                mode === "pool" ||
                pageParams["random"] === "yes" ||
                !!pageParams["orderby"];

            if (window.location.href.indexOf("submissionview.php") !== -1) {
                let $filesArea = $('#files_area');
                if ($filesArea.length > 0) {
                    // Submissions only have submission lists if there is a files_area element somewhere,
                    // in which case they are inside the element containing that element.
                    // TODO: if we want to be excruciatingly correct about this, we'd also omit the link to the current submission.
                    $links = $(".widget_imageFromSubmission a", $filesArea.parent());
                } else {
                    reject();
                }
            } else {
                $links = $(".widget_imageFromSubmission a");
            }

            //console.log("$links", $links, $links.length);
            for (let ii = 0; ii < $links.length; ii++) {
                //console.log("entering loop", ii, $links[ii]);

                var $currLink = $links.eq(ii);
                var href = $currLink.prop('href');
                //console.log('Loop', $currLink, href);

                // Inkbunny submission URLs are of the format
                // https://inkbunny.net/submissionview.php?id=[ID]
                let url = new URL(href);
                let queryParams = parseQueryString(url.search);
                let id = queryParams["id"];

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