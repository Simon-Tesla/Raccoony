self.port.on("delayLoad", function (options) {
    var url = options.url;
    var delay = options.delay;

    // Update the page with the info from the worker.
    var sub = document.getElementById("sub");
    sub.href = url;
    sub.textContent = url;

    var time = document.getElementById("time");

    function countdown() {
        time.textContent = delay;
        if (delay > 0) {
            delay--;
            setTimeout(countdown, 1000);
        } else {
            window.location = url;
        }
    }
    countdown();
});