var site = (function () {

    function getSubmissionMetadata() {
        return new Promise(function (resolve, reject) {
            try {
                // Get the username
                let profileLink = document.querySelector('h4 a[href^="./artist-profile"]');
                username = profileLink.textContent;

                // Get the filename
                let titleElt = document.querySelector(".panel-heading a");
                let filename = titleElt.textContent;

                // Get the preview image
                // Preview image URLs look like this:
                // /upl0ads/covers/[code].png
                let previewImg = document.querySelector('.panel-body img[src^="./upl0ads"]');
                let previewImgUrl = new URL(previewImg.src);
                let ext = previewImgUrl.pathname.split('.').pop();
                let previewUrl = previewImgUrl.href;

                // Get the full-sized image; should be the link parent of the preview image.
                let fullSizeLink = previewImg.parentElement;
                let url = (fullSizeLink && fullSizeLink.href) || previewUrl;

                // Get the id
                let pageUrl = new URL(window.location.href);
                let id = pageUrl.searchParams.get('pid');


                let title, description, tags;
                title = titleElt.textContent;
                let descriptionElt = document.querySelectorAll('.col-md-10 .panel-body')[1];
                description = descriptionElt && descriptionElt.textContent;
                description = description.trim();
                tags = [];

                resolve({
                    url: url,
                    previewUrl: url,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "hiccears",
                    title: title,
                    description: description,
                    tags: tags
                });
            } catch (e) {
                // swallow errors
                console.warn("hiccears getSubmissionMetadata exception", e.message, e.name, e.number, e.stack, e.description);
                resolve(null);
            }
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            try {
                let linkList = document.querySelectorAll('.panel-body .col-md-3 a');
                let list = Array.from(linkList, (link) => {
                    let url = new URL(link.href);
                    return {
                        url: link.href,
                        id: url.searchParams.get('pid'),
                    };
                });
                resolve({
                    list: list,
                    nosort: false
                });
            } catch (e) {
                console.warn("hiccears getSubmissionList exception", e.message, e.name, e.number, e.stack, e.description);
                resolve(null);
            }
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList
    };
})();