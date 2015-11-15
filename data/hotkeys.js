var hotkeys = (function () {
    let handlers;

    function initHotkeys(page) {
        handlers = page;
        $(document).on("keyup", handleKeypress);
    }

    function disposeHotkeys() {
        $(document).off("keyup", handleKeypress);
    }

    function handleKeypress(ev) {
        let el = document.activeElement;
        // if in textfield, do nothing
        if (el && (
            el.tagName.toLowerCase() == 'input' ||
            el.tagName.toLowerCase() == 'textarea' ||
            $(el).closest('[contenteditable=true]'))) {
            return true;  
        }

        if (!(ev.altKey || ev.ctrlKey || ev.metaKey)) {
            switch (ev.which) {
                case KeyboardEvent.DOM_VK_T:
                    handlers.openAllInTabs();
                    break;
                case KeyboardEvent.DOM_VK_D:
                    handlers.download();
                    break;
                case KeyboardEvent.DOM_VK_F:
                    handlers.showFolder();
                    break;
                case KeyboardEvent.DOM_VK_O:
                    handlers.toggleFullscreen();
                    break;
            }
        }
    }

    return {
        init: initHotkeys,
        dispose: disposeHotkeys,
    }
})()