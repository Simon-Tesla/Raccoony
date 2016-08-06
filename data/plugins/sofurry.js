var site = (function () {

    function getSubmissionMetadata() {
        // TODO: Should look into using the SoFurry API for this.
        return new Promise(function (resolve, reject) {
            try {
                // Get the download button
                var button = document.getElementById("sfDownload");

                if (!button) {
                    // When not logged in (and possibly under other circumstances?) 
                    // no download button is available, however the image has a link to the larger image.
                    var button = document.querySelector("#sfContentImage a");
                }

                // Get the URL
                var url = button.getAttribute("href");
                var id = window.location.href.split("/").pop();

                // Get the filename
                var titleElt = document.getElementById("sfContentTitle");
                var filename = titleElt.textContent;
                // And the extension - we use the preview image to determine this.
                var imgPreview = document.querySelector("#sfContentImage img");
                var ext = imgPreview.getAttribute("src").split('.').pop();
                var previewUrl = imgPreview.src;

                // Get the username
                var usernameElt = document.querySelector("#sf-userinfo-outer .sf-username");
                var username = usernameElt.textContent;

                let title, description, tags;
                title = $("#sfContentTitle").text().trim();
                description = $("#sfContentDescription").text() || "";
                description = description.trim();
                tags = $("#submission_tags .sf-tag").toArray();
                tags = tags.map(function (tagEl) { return tagEl.textContent.trim(); });

                resolve({
                    url: url,
                    previewUrl: previewUrl,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "sofurry",
                    title: title,
                    description: description,
                    tags: tags
                });
            } catch (e) {
                // swallow errors
                resolve(null);
            }
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            try {
                let list = [];
                let nosort = window.location.search.indexOf("sort=") !== -1 ||
                    window.location.search.indexOf("sortby=") !== -1 ||
                    window.location.pathname.indexOf("/browse") === 0;
                $links = $(".items a.sfArtworkSmallInner")
                    .add(".items .sf-story-big-headline a")
                    .add(".items .sf-story-headline a")
                    .add(".items .sfTextDark a")
                    .add(".items .sf-browse-shortlist-title a");
                if (!$links.length) {
                    // Look for watchlist links
                    $links = $(".watchlist a.watchlist_thumbnail_link")
                        .add(".watchlist h3 a");
                }
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
                resolve({
                    list: list,
                    nosort: nosort
                });
            } catch (e) {
                resolve(null);
            }
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList,
        noAutoFullscreen: true, 
    };
})();