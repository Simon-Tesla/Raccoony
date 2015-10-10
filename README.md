#Raccoony
A Firefox Addon that adds shiny new features (like automatic downloading) to art sites. 

##Features
 * Download any submission from a supported art site to your computer with a single click.
   Files are downloaded into folders organized like so: 
   `[service]/[username]/[id]_[filename]_by_[username].[ext]`
 * Easily view a downloaded submission or user's folder in the OS file manager.
 * Open all submissions in a given view in new tabs.
 * Preview image submissions in a fullscreen view.

Many more features are planned. Check the issue tracker for some of them and please feel
free to suggest more.

##Supported sites

 * Fur Affinity
 * InkBunny
 * Weasyl
 * SoFurry
 * deviantArt

The architecture of the addon makes it very easy to add support for more sites, 
so if you see one not on the list, feel free to suggest or write your own plugin
for it. Just look at [one of the plugin js files](https://github.com/NatePri/Raccoony/blob/master/data/plugins/weasyl.js) 
to see an example.

##Download
**This is alpha-quality software.** There are bugs, and while it shouldn't harm your computer, use it at your own risk.

[Download raccoony.xpi](https://github.com/NatePri/Raccoony/raw/master/dist/raccoony.xpi)

##Change Log
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
