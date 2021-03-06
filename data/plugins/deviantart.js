﻿var site = (function () {

    function getSubmissionMetadata() {
        // TODO: Is there a deviantArt API?
        return new Promise(function (resolve, reject) {
            try {
                let url, username, filename, id, ext, previewUrl;
                // Get the username
                var usernameElt = document.querySelector(".dev-title-container .username");
                username = usernameElt.textContent;

                // Get the download button
                let button = document.querySelector("a.dev-page-download");

                // Get the displayed image.
                // dA image URLs look like so:
                // http://img12.deviantart.net/64ca/i/2015/273/f/9/[filename]_by_[user]-d9bi7fp.jpg
                // Or it can also look like this:
                // http://orig15.deviantart.net/412a/f/2015/277/4/1/41dc9b8a50185effd6956ef62b506458-d9bxb8s.png

                let img = document.querySelector("img.dev-content-full");
                if (!img) {
                    img = document.querySelector("img.dev-content-normal");
                }
                previewUrl = img.src;

                if (button) {
                    // Get the download button URL
                    // dA URLs look like so:
                    // http://www.deviantart.com/download/[id]/[filename]_by_[username].[ext]?token=XX&ts=XX
                    url = button.getAttribute("href");
                    //console.log("submission url", url);
                    // Get the filename
                    let urlObj = new URL(url);
                    path = urlObj.pathname.split("/");
                    filename = path.pop();
                    //console.log("submission filename 1", filename);

                    // De-munge the filename
                    ext = filename.split(".").pop();
                    let byIdx = filename.lastIndexOf("_by_");
                    filename = filename.substring(0, byIdx);
                    //console.log("submission filename 2", filename, byIdx);

                    id = path.pop();

                } else {
                    // The deviant disabled the download button, so let's just grab the url from the image.
                    url = previewUrl;

                    // De-munge the filename.
                    filename = url.split("/").pop();
                    ext = filename.split(".").pop();
                    let byIdx = filename.lastIndexOf("_by_");
                    //console.log("submission filename 1", filename, byIdx);
                    filename = filename.substring(0, byIdx);


                    if (!filename) {
                        // This didn't work, so we probably have the second form of URL.
                        // Make a filename from the image alt tag.
                        filename = img.alt;
                        byIdx = filename.lastIndexOf(" by ");
                        //console.log("submission filename 2", filename, byIdx);
                        filename = filename.substring(0, byIdx);
                    }

                    // Grab the ID from the img element
                    id = img.getAttribute("data-embed-id");
                }

                let title, description, tags;
                var docTitle = document.title;
                title = docTitle.substring(0, docTitle.lastIndexOf(" by "));
                description = $(".dev-description").text() || "";
                description = description.trim();
                tags = []; //dA doesn't have tags.

                resolve({
                    url: url,
                    previewUrl: previewUrl,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "deviantart",
                    title: title,
                    description: description,
                    tags: tags
                });
            } catch (e) {
                //console.warn("Could not get submission metadata", e);
                resolve(null);
            }
        });
    }

    let _submissionListQuery = ".messages a.thumb, .folderview a.thumb, .stream a.thumb";

    function isNotificationPage() {
        return window.location.pathname.indexOf("/notifications") === 0;
    }

    function getSubmissionList() {
        //TODO: The Notifications page is rendered with data retrieved via a later XHR, 
        // so the UI is not always ready when this executes.
        // Also, Raccoony does not always respect changing between different tabs on the page.
        return new Promise(function (resolve, reject) {
            try {
                let list = [];
                let nosort = window.location.pathname.indexOf("/favourites") === 0 ||
                    window.location.pathname.indexOf("/browse") === 0 ||
                    window.location.search.indexOf("q=") !== -1 ||
                    window.location.search.indexOf("order=") !== -1;
                $links = $(_submissionListQuery);
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
                console.log("Found submissions:", list.length, list);
                resolve({
                    list: list,
                    nosort: nosort
                });
            } catch (e) {
                //console.warn("Could not get submission list", e);
                resolve(null);
            }
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList,
        forceSubmissionListOn: isNotificationPage,
        // deviantArt makes extensive use of XHR in their site, so you can never guarantee that 
        // the DOM hasn't changed out from under you. Therefore, we disable any caching of responses.
        // TODO: investigate invalidating caches based on URL changes
        nocache: true,
        reinitOnMutation: true,
        mutationElementSelector: "body",
        noAutoFullscreen: true,

    };
})();