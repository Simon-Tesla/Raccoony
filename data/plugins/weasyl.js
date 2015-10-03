var site = (function () {

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

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            $links = $(".thumb a.thumb-bounds");
            console.log("$links", $links, $links.length);
            for (let ii = 0; ii < $links.length; ii++) {
                console.log("entering loop", ii, $links[ii]);
            
                let $currLink = $links.eq(ii);
                let href = $currLink.prop('href');
                console.log('Loop', $currLink, href);
                
                // Weasyl submission URLs are of the format
                // https://www.weasyl.com/submission/[ID]/[title]
                let urlparts = href.split('/');
                urlparts.pop();
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