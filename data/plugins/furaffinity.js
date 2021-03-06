﻿var site = (function () {

    function getSubmissionMetadata() {
        // FA is notoriously difficult to scrape, so we're punting and taking pretty much
        // all of the metadata from the (fortunately nicely formatted) download URL.
        return new Promise(function (resolve, reject) {
            try {
                // Get the download button, if it exists
                let button = document.querySelector(".actions a[href^='//d.facdn.net/art/']");
                if (!button) {
                    // Must be in the Beta UI...
                    button = document.querySelector('.sidebar-section a.button.download-logged-in');
                }
                let url = button.href;

                let img = document.getElementById('submissionImg');
                let previewUrl = img.getAttribute('data-preview-src');

                if (!url) {
                    // If all else fails, get the submission image source URL
                    url = img.getAttribute('data-fullview-src') || img.src;
                    if (url.indexOf('http:') !== 0 || url.indexOf('https:') !== 0) {
                        // Add the protocol scheme to the URL if it's missing
                        url = window.location.protocol + url;
                    }
                }

                // FA download URLs look like so:
                // http://d.facdn.net/art/[username]/[id]/[id].[username]_[origfilename].[ext]	
                // Preivew URLs look like so:
                // //t.facdn.net/22795737@400-[id].[ext]

                let urlParts = url.split("/");
                let filename = urlParts.pop();
                let id = urlParts.pop();
                let username = urlParts.pop();

                // Strip off the ID from the filename, so that it doesn't get repeated when saved.
                let usrIndex = filename.indexOf(username);
                filename = filename.substring(usrIndex + username.length + 1);
                let extIndex = filename.lastIndexOf(".");
                let ext = filename.substring(extIndex + 1);
                filename = filename.substring(0, extIndex);

                if (!ext) {
                    // In rare cases, we don't even end up with an extension. 
                    // We'll use the preview image extension and default to jpg if all else fails.
                    ext = previewUrl.substr(previewUrl.lastIndexOf('.') + 1) || 'jpg';
                }

                let title, description, tags;
                title = $("meta[property='og:title']").attr("content");

                if (!filename) {
                    // Sometimes the image doesn't end up with a filename; in this case we'll read a title from the metadata
                    filename = title
                }

                description = document.querySelectorAll("#page-submission .maintable .alt1 .maintable .alt1");
                if (description && description.length >= 3) {
                    description = description[2].textContent;
                } else {
                    // Might be the beta layout
                    description = $('.p20').text() || $('.submission-description').text();
                }
                description = description && description.trim();

                tags = $("#keywords a");
                if (!tags || tags.length === 0) {
                    tags = $(".submission-sidebar .tags-row .tags a");
                }

                tags = tags.toArray().map(function (el) { return el.textContent.trim(); });

                resolve({
                    url: url,
                    previewUrl: url,
                    user: username,
                    filename: filename,
                    extension: ext,
                    type: fileTypes.getTypeByExt(ext),
                    submissionId: id,
                    service: "furaffinity",
                    title: title,
                    description: description,
                    tags: tags
                });
            } catch (e) {
                // Swallow any errors here.
                console.error("error:", e.message, e.stack);
                resolve(null);
            }
        });
    }

    function getSubmissionList() {
        return new Promise(function (resolve, reject) {
            try {
                let list = [];
                // Don't try to sort the favorites lists.
                let pageUrl = window.location.href;
                let nosort = pageUrl.indexOf("/favorites/") !== -1 || 
                    pageUrl.indexOf("/search/") !== -1;
                // links on the new submissions page
                $links = $("#messagecenter-submissions b u s a");
                if (!$links.length) {
                    // look for gallery links instead
                    $links = $(".submission-list b u s a");
                }
                if (!$links.length) {
                    // Look for favorite links
                    $links = $(".favorites b u s a");
                }
                if (!$links.length) {
                    // Search links
                    $links = $(".search b u s a");
                }
                if (!$links.length) {
                    // Browse links
                    $links = $(".browse b u s a");
                }
                if (!$links.length) {
                    // Beta favorites
                    $links = $(".gallery b u s a");
                }
                if (!$links.length) {
                    $links = $(".gallery figure b u a");
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
                    });
                }
                resolve({
                    list: list,
                    nosort: nosort
                });
            } catch (e) {
                // Swallow errors
                resolve(null);
            }
        });
    }

    return {
        getSubmissionMetadata: getSubmissionMetadata,
        getSubmissionList: getSubmissionList
    };
})();