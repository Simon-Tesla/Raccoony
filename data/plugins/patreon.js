var site = (function () {

    function getSubmissionMetadata() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    // Get the post image
                    let image = document.querySelector(".patreon-creation-shim--image") ||
                        document.querySelector("[data-test-tag=post-card] img");
                    let url = new URL(image.src);

                    // Patreon image URLs look like so:
                    // https://cdn3.patreon.com/1/patreon.posts/#####.jpg?v=####                    
                    let extIndex = url.pathname.lastIndexOf(".");
                    let ext = url.pathname.substring(extIndex + 1);

                    // Get the filename
                    // Patreon page URLs look like so:
                    // https://www.patreon.com/posts/[filename]-[id]
                    let pageUrlSlug = window.location.pathname.split('/').pop();
                    let slugParts = pageUrlSlug.split('-');
                    let id = slugParts.pop();
                    let filename = slugParts.join('-');

                    // Get the username
                    let userLink = document.querySelectorAll('.patreon-patreon-creation-shim--creator--top--text a')[0] ||
                        document.querySelector("[class$='CreatorCardContent--creatorName']");
                    let username = userLink.textContent;

                    let title, description, tags;
                    title = document.querySelector(".patreon-heading") ||
                        document.querySelector("[class$='Post--title']");
                    title = title.textContent.trim();
                    description = document.querySelector(".patreon-creation-shim--text--body") ||
                        document.querySelector("[class$='Post--postContentWrapper text']");
                    description = description.textContent.trim();
                    tags = [];

                    resolve({
                        url: url.href,
                        previewUrl: url.href,
                        user: username,
                        filename: filename,
                        extension: ext,
                        type: fileTypes.getTypeByExt(ext),
                        submissionId: id,
                        service: "patreon",
                        title: title,
                        description: description,
                        tags: tags
                    });
                } catch (e) {
                    // swallow errors
                    console.warn("patreon getSubmissionMetadata exception", e.message, e.name, e.number, e.stack, e.description);
                    resolve(null);
                }
            }, 500);
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                try {
                    console.log("getting patreon submission list");
                    let itemLinks = document.querySelectorAll('div[data-test-tag=post-card] a[class$="components-PostHeader--timestampLink"]');
                    let list = Array.from(itemLinks, (link) => {
                        return {
                            url: link.href,
                            id: link.href.split('-').pop(),
                        };
                    }).filter((item) => new URL(item.url).pathname.indexOf("/bePatron") !== 0);
                    console.log("patreon submission list length: " + list.length);
                    resolve({
                        list: list,
                        nosort: false
                    });
                } catch (e) {
                    console.warn("patreon getSubmissionList exception", e.message, e.name, e.number, e.stack, e.description);
                    resolve(null);
                }
            }, 500);
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList,
        //reinitOnMutation: true,
        //mutationElementSelector: ".patreon-page-content",
        noAutoFullscreen: true,
    };
})();