var site = (function () {

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

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            let list = [];

            // links on the new submissions page
            $links = $("#messagecenter-submissions b u s a");
            if (!$links.length) {
                // look for gallery links instead
                $links = $(".submission-list b u s a");
            }

            console.log("$links", $links, $links.length);
            for (let ii = 0; ii < $links.length; ii++) {
                console.log("entering loop", ii, $links[ii]);

                let $currLink = $links.eq(ii);
                let href = $currLink.prop('href');
                console.log('Loop', $currLink, href);

                // FA submission URLs are of the format
                // https://www.furaffinity.net/view/[ID]/
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