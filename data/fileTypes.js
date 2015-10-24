////////////////////
// File type mapping
var fileTypes = (function () {
    let extMap = {};
    let fileTypes = {
        'image': ['jpg', 'jpeg', 'png', 'gif'],
        'text': ['txt', 'rtf', 'doc', 'docx', 'odf'],
        'flash': ['swf'],
        'video': ['mpeg', 'mpg', 'mp4', 'avi', 'divx', 'mkv', 'flv', 'mov', 'wmv']
    };

    // Create extension to type mapping
    for (let type in fileTypes) {
        let extList = fileTypes[type];
        for (let ext of extList) {
            extMap[ext] = type;
        }
    };

    fileTypes.getTypeByExt = function (ext) {
        return extMap[ext] || "unknown";
    };

    return fileTypes;
})();
