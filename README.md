#Raccoony!

A Firefox addon that adds shiny new features (like automatic downloading) to art sites. Inspired by the [FurAffinity Extender](https://andrewneo.github.io/faextender/) and [Inkbunny Downloader](http://www.humbird0.com/#/addons/inkbunny_downloader) Firefox addons.

##Features

 * Download any submission from a supported art site to your computer with a single click.
   Files are downloaded into folders organized like so: 
   `[service]/[username]/[id]_[filename]_by_[username].[ext]`
 * Easily view a downloaded submission or user's folder in the OS file manager.
 * Open all submissions in a given view in new tabs.
 * Preview image submissions in a fullscreen view. Can set up Raccoony to automatically show the preview on every submission page.
 * Hotkeys for downloading, opening all in tabs, and fullscreen preview.

Many more features are planned. Check the issue tracker for some of them and please feel
free to suggest more.

##Supported sites

 * Fur Affinity
 * InkBunny
 * Weasyl
 * SoFurry
 * deviantArt
 * FurryNetwork (experimental/partial)
 * e621

The architecture of the addon makes it very easy to add support for more sites, 
so if you see one not on the list, feel free to suggest or write your own plugin
for it. Just look at [one of the plugin js files](https://github.com/NatePri/Raccoony/blob/master/data/plugins/weasyl.js) 
to see an example.

##Download

**This is alpha-quality software.** There are bugs, and while it shouldn't harm your computer, use it at your own risk.

[Download raccoony.xpi](https://github.com/NatePri/Raccoony/raw/master/dist/raccoony.xpi)

##Change Log

* 0.0.25
    - Fixed Fur Affinity support (both classic and beta layouts) to handle the recent thumbnails UI change.
* 0.0.24
    - Fixed e621 open all in tabs support
* 0.0.23
    - Fixed furrynetwork download support
    - Disabled auto-fullscreen for sofurry (interferes with their fullscreen viewer) and deviantart (they already ensure the default preview fits the screen).
* 0.0.22
    - Added support for e621. Note that since anyone can upload to e621, the artist is not always known. If Raccoony cannot determine an artist via the submission tags, it uses "unknown" as the artist's name.
* 0.0.21
    - Fixed SoFurry integration when logged out or browsing via HTTP.
    - Added ability to save a text file with basic metadata about a submission adjacent to the file. The file currently contains things like Title, Author, Tags, Description and Source URL.
    - Improved Furry Network support
        - Raccoony will now track changes on the page and update its UI appropriately when switching between a submission view or a gallery view, or when paging between submissions.
        - Auto-fullscreen is now disabled for FN as it interferes with the site's fullscreen viewer.
        - There is still no Open All in Tabs support for FN in this release. FN's infinite scroll model makes it difficult to support this feature in a useful way, so it's possible Raccoony will never support it. 
    - Improved reliability of the site-scraping plugins generally.
* 0.0.20
    - Fixed issue #18: open all in a private window would open everything in a new non-private window.
* 0.0.19
    - Enabled the extension to work in private-browsing mode. Note that while this extension relies on no third-party services, 
      should not communicate with any third parties and should therefore be safe to use with private-browsing mode, 
      I have not done a complete audit of the libraries I use and I cannot guarantee privacy.
* 0.0.17 & 0.0.18
    - Updated to work with new InkBunny layout.
* 0.0.16
    - Raccoony is now signed to comply with the new extension signing requirements. 
* 0.0.15
    - Fixed bug with hotkeys not working.
* 0.0.14
    - Added experimental support for FurryNetwork (downloading only).
    - Added always-visible badges to the page overlay for downloading and opening in tabs.
    - Improved perfomrance of on-screen preview by always preferring the cached version of an image to load. (Hoping to add a zoom-in to download feature in the future.)
    - Fixed an issue with hotkeys triggering when typing inside contentEditable fields (like comment fields on deviantArt).
    - Fixed bug where trying to start a download before another one had finished would cause an error.
* 0.0.13
    - Changed hotkey handling mechanism to better allow for single-key hotkeys. Removed the hotkey customization preferences as a result of this (hopefully temporarily). 
    - Updated the hotkey mappings. Hotkeys are now:
        - D - Download
        - F - Open Folder
        - O - Open/close fullscreen
        - T - Open all in tabs
    - Updated the first-run experience UI.
    - Added a configuration button that takes the user to the preferences page.
    - Completely refactored the UI overlay code to be more modular.
* 0.0.12
    - Fixed a bug with scraping multi-image submissions in InkBunny.
    - Improved first run experience for users who don't have a download folder set.
* 0.0.11
    - Added hotkeys for downloading (`CTRL`+`F1`), opening all in tabs (`CTRL`+`F2`), and toggling fullscreen mode (`CTRL`+`F3`). These hotkeys can be rebound in preferences, using the [instructions found here](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/hotkeys#Hotkey%28options%29).
    - Fullscreen can be dismissed by scrolling the mousewheel down. If auto-fullscreen is enabled, scrolling to the top of the page will re-enter fullscreen mode.
* 0.0.10
    - Skipped a few version numbers while testing out the auto-update feature. 
      If you use this version of Raccoony, it should auto-update correctly in the future.
      (At least until Firefox stops allowing unsigned addons.)
    - Removed a bunch of stuff from the XPI that shouldn't have been getting packaged with it.
* 0.0.6
    - Show UI on hover.
    - Minor display fixes.
    - Testing out auto-update feature.
* 0.0.5
    - Fixed some issues with the fullscreen preview showing on pages that aren't previewable.
    - Fixed some issues with deviantArt not showing "open in tabs", or loading the incorrect submissions.
    - Added automatic updating - your browser should pick up the next version of raccoony automatically.
* 0.0.4
    - Added fullscreen preview feature.
    - Added option to open the fullscreen preview immediately when opening a submission page.
    - Fixed deviantArt downloading for submissions without a download button.
    - Fixed deviantArt "open all in tabs" support on watchlist notifications page.
* 0.0.3
    - Enabled deviantArt support
    - Added Open in tabs feature (currently only accessible via page overlay)
    - More consistent filename normalization. Note that this breaks compatibility
      with existing filenames, so already downloaded submissions may show up as
      not downloaded.
    - Fixed a bunch of bugs and did some refactoring.
* 0.0.2
    - Fixed bug with saving Inkbunny submissions with multiple pages.
* 0.0.1
    - Initial release.

##Licence
The MIT License (MIT)

Copyright (c) 2015 NatePri

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
