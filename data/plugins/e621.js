var site = (function () {

    function getSubmissionMetadata() {
        return new Promise(function (resolve, reject) {
            try {
                // Get the download button
                let button = document.getElementById("image");

                // Get the URL
                // e621 image URLs are of the format
                // https://static1.e621.net/data/99/c5/99c5a9f2195e8025df8e03acef6e2b2f.png
                let url = button.getAttribute("src");

                // Get the artist's name
                username = $(".tag-type-artist a[href^='/post/search']").first().text() || "unknown";

                // Get the filename
                // e612 submission pages are of the format:
                // https://e621.net/post/show/[id]/[tags?]
                let pathParts = window.location.pathname.split('/'); 
                let id = pathParts[3];

                let description, tags;
                description = $("#content .collapse-body").first().text() || "";
                description = description.trim();
                tags = $(".tag-type-artist a[href^='/post/search'], .tag-type-character a[href^='/post/search'], .tag-type-copyright a[href^='/post/search'], .tag-type-species a[href^='/post/search'], .tag-type-general a[href^='/post/search']")
                    .toArray()
                    .map(function (el) { return el.textContent.trim() });

                // Compose a filename using the tag slug, if possible.
                let filename = pathParts[4] || tags.slice(0, 3).join("_");
                let extIndex = url.lastIndexOf(".");
                let ext = url.substring(extIndex + 1);

                resolve({
                    url: url,
                    previewUrl: url,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "e621",
                    title: null,
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

                // Don't try to iterate over stuff in the comments on posts.
                $links = $("#content .tooltip-thumb").not("#comments *");
                console.log("$links", $links, $links.length);
                for (let ii = 0; ii < $links.length; ii++) {
                    console.log("entering loop", ii, $links[ii]);

                    let $currLink = $links.eq(ii);
                    let href = $currLink.prop('href');
                    console.log('Loop', $currLink, href);

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
                    nosort: true
                });
            } catch (e) {
                resolve(null);
            }
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList
    };
})();