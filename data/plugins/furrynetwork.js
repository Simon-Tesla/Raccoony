var site = (function () {

    function getSubmissionMetadata() {
        return new Promise(function (resolve, reject) {
            try {
                // Get the max preview button, if it exists
                let button = document.querySelector(".submission-actions a[target=_blank]");
                let url = button.href;

                // FN download URLs look like so:
                // https://furrynetwork-beta.s3.amazonaws.com/[us]/[username]/submission/[year]/[month]/[hexstring].[ext]	
                let urlParts = url.split("/");
                let dlFilename = urlParts.pop();
                urlParts.pop() // month
                urlParts.pop() // year
                urlParts.pop() // submission
                let username = urlParts.pop();
                let extIndex = dlFilename.lastIndexOf(".");
                let ext = dlFilename.substring(extIndex + 1);

                // Get the preview URL
                let previewImg = document.querySelector('.submission__image img');
                let previewUrl = previewImg.src;

                // Get the filename
                let titleElt = document.querySelector('.submission-description__title');
                let filename = titleElt.textContent;

                // FN page URLs look like so:
                //https://beta.furrynetwork.com/artwork/[id]/[title]/
                let pagePath = window.location.pathname.split("/");
                let id = pagePath[2];

                let title, description, tags;
                title = $(".submission-description__title").text().trim();
                description = $(".submission-description__description__md").text() || "";
                description = description.trim();
                tags = $(".tag__label")
                    .toArray()
                    .map(function (el) { return el.textContent.trim() });

                resolve({
                    url: url,
                    previewUrl: url,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "furrynetwork",
                    title: title,
                    description: description,
                    tags: tags
                });
            } catch (e) {
                // swallow errors
                console.warn("furrynetwork getSubmissionMetadata exception", e.message, e.name, e.number, e.stack, e.description);
                resolve(null);
            }
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            // FurryNetwork already has ajax paging, so we're not going to support lists for now.
            let list = [];
            resolve({
                list: list,
                nosort: false
            });
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList,
        // FurryNetwork uses a fair amount of XHR, so don't cache anything.
        nocache: true,
        reinitOnMutation: true,
        mutationElementSelector: "#app",
        noAutoFullscreen: true,
    };
})();