let {Cu, Cc, Ci} = require("chrome");
let OS = Cu.import("resource://gre/modules/osfile.jsm").OS;	
let Downloads = Cu.import("resource://gre/modules/Downloads.jsm").Downloads;
let FileUtils = Cu.import("resource://gre/modules/FileUtils.jsm").FileUtils;
var Task = Cu.import("resource://gre/modules/Task.jsm").Task;
var fileIO = require("sdk/io/file");

function Downloader(downloadFolder, writeMetadata) {
    this.downloadFolder = downloadFolder;
    this._writeMetadata = writeMetadata;
}

Downloader.prototype = {
    download: function (info, onDownloadStart, onDownloadProgress) {
        /// <summary>
        /// Initiates a download
        /// </summary>
        /// <param name="info">The submission metadata</param>
        /// <param name="onDownloadStart" optional="true">Callback called when the download starts.</param>
        /// <param name="onDownloadProgress" optional="true">Callback called as the download progresses, 
        /// reporting the percentage completed.</param>
        /// <returns>A promise that resolves upon completion of the download.</returns>

        let _this = this;

        if (!validateSubmissionMetadata(info)) {
            //TODO normalize errors into Error objects
            return Promise.reject("Invalid submission metadata.");
        }
        let paths; 
        try {
            paths = this._normalizePaths(info);
        } catch (e) {
            return Promise.reject(e);
        }
    
        let sourceUrl = info.url;
        let serviceDir = paths.serviceDir;
        let targetDir = paths.targetDir;
        let targetPath = paths.targetPath;
        
    
        // Start the download process.
        // TODO: rewrite this to use the Task pattern:
        // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Task.jsm
        return createTargetFolder(serviceDir)
            .then(function () { return createTargetFolder(targetDir); })
            .then(rejectIfFileExists)
            .then(downloadFile)
            .then(function () { return writeMetadata(targetPath, info);});
      
        function rejectIfFileExists() {
            // Returns a promise that rejects if the file exists.
            return new Promise(function (resume, abort) {
                // TODO: fileIO.exists
                OS.File.exists(targetPath).then(function (fileExists) {
                    if (fileExists) { 
                        abort("File already exists: " + targetPath);
                    } else {
                        resume();
                    }
                }, abort);
            });
        }
    
        function downloadFile() {
            // Downloads the file.
            return Task.spawn(function () {
                onDownloadStart && onDownloadStart();
                let download = yield Downloads.createDownload({
                    source: sourceUrl,
                    target: targetPath
                });
        
                download.onchange = function () {
                    console.log("Downloaded " + download.progress + "%");
                    onDownloadProgress && onDownloadProgress(download.progress);
                }
        
                yield download.start();
            })
        }

        function writeMetadata(filename, info) {
            return new Promise(function (resolve, reject) {
                if (_this._writeMetadata) {
                    filename = filename +  ".txt";
                    var TextWriter = fileIO.open(filename, "w");
                    let metadata = "Title:\t" + info.title + "\n";
                    metadata += "Author:\t" + info.user + "\n";
                    metadata += "Tags:\t" + (info.tags || []).join(", ") + "\n";
                    metadata += "Source URL:\t" + info.sourceUrl + "\n";
                    metadata += "Description: \n" + info.description + "\n";
                    metadata += "JSON: \n" + JSON.stringify(info, null, "  ") + "\n";

                    if (!TextWriter.closed) {
                        TextWriter.writeAsync(metadata, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                } else {
                    resolve();
                }
            });
        }
    },
    exists: function (info) {
        /// <summary>
        /// Returns a promise that resolves with the exists state of the file.
        /// </summary>
        /// <param name="info">The submission metadata.</param>
        let paths = this._normalizePaths(info);
        return OS.File.exists(paths.targetPath);
    },
    showFolder: function (info) {
        /// <summary>
        /// Shows the file in the folder in explorer/the OS.
        /// </summary>
        /// <param name="info">The submisssion metadata.</param>

        let paths = this._normalizePaths(info);
        if (!showFolderInExplorer(paths.targetPath)) {
            showFolderInExplorer(paths.targetDir);
        }
    },

    _normalizePaths: function (info) {
        return normalizePaths(info, this.downloadFolder);
    }
};

function normalizePaths(info, downloadRoot) {
    // Get normalized paths from the submission metadata
    if (!downloadRoot) {
        throw "downloadFolder";
    }
    //TODO: use sdk/fs/path instead
    let serviceDir = OS.Path.normalize(OS.Path.join(
        downloadRoot, 
        sanitizeFilename(info.service)));
    let targetDir = OS.Path.join(serviceDir, sanitizeFilename(info.user));
    let filename = info.submissionId + "_" + info.filename + "_by_" + info.user + "." + info.extension;
    let targetPath = OS.Path.join(targetDir, sanitizeFilename(filename));
    let metadataPath = OS.Path.join(targetDir, sanitizeFilename(filename + ".txt"));
    return {
        downloadRoot: downloadRoot,
        serviceDir: serviceDir,
        targetDir: targetDir,
        targetPath: targetPath,
        metadataPath: metadataPath
    }
}
  
function validateSubmissionMetadata(info) {
    // Validate the submission metadata
    let requiredProps = ['url', 'user', 'filename', 'extension', 'service', 'submissionId'];
    for (let prop of requiredProps) {
        if (!info[prop]) {
            console.error("Field not found: " + prop);
            return false;
        }
    }
    return true;
}
   
function createTargetFolder(targetDir) {
    // Creates the target folder.
    // Important: path must be sanitized before passing to this method.
    // TODO: use fileIO.mkpath
    return OS.File.makeDir(targetDir, { ignoreExisting: true });
}
  
function showFolderInExplorer(path) {
    // TODO: FileUtils is a deprecated API, is there a replacement?
    let file = new FileUtils.File(path);
    if (file.exists()) {
        file.reveal();
        return true;
    } 
    return false;
}

function sanitizeFilename(filename)
{
    // Replace any spaces with underscores
    filename = filename.replace(" ", "_");
    // Replace any consecutive dots (e.g. "..") with a single dot.
    filename = filename.replace(/\.+/g, ".");
    // Replace any significant OS characters with underscores.
    return filename.replace(/[*"\\\/:|?%<>]/g, "_");
}


exports.Downloader = Downloader;