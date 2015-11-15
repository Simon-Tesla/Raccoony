var site = (function () {

    function getSubmissionMetadata() {
        // TODO: Should look into using the Weasyl API for this.
        return new Promise(function (resolve, reject) {
            // Get the download button
            let buttonSpan = document.querySelector("#detail-actions .icon-arrowDown");
            let button = buttonSpan.parentElement;

            // Get the URL
            // Weasyl download URLs are of the format 
            // https://cdn.weasyl.com/~[user]/submissions/[id]/[hash]/[user]-[filename.ext]?download
            let url = button.getAttribute("href");
            let urlObj = new URL(url);

            // Get the username
            let pathParts = urlObj.pathname.split('/'); // "/~user/..."
            let username = pathParts[1] || "";
            username = username.replace("~", "");

            // Get the filename
            let filename = pathParts.pop();
            pathParts.pop(); //pop off the unneeded hash
            let id = pathParts.pop();

            // Strip off the username
            filename = filename.substring(username.length + 1);

            // TODO: don't repeat yourself
            let extIndex = filename.lastIndexOf(".");
            let ext = filename.substring(extIndex + 1);
            filename = filename.substring(0, extIndex);

            let previewImg = document.querySelector('#detail-art img');
            let previewUrl = previewImg.src;

            resolve({
                url: url,
                previewUrl: previewUrl,
                user: username,
                filename: filename,
                extension: ext,
                type: fileTypes.getTypeByExt(ext),
                submissionId: id,
                service: "weasyl"
            });
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];
            let nosort = window.location.pathname.indexOf("/favorites") === 0;
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