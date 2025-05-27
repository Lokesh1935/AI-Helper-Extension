(function () {
    // Save original methods
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    // Hook into the `open` method
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url; // Save URL for later use
        return originalOpen.apply(this, arguments);
    };

    // Hook into the `send` method
    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
            const isProfileUrl = this._url === "https://api2.maang.in/users/profile/private";

            // Check for problems/user/<number> pattern
            const problemPrefix = "https://api2.maang.in/problems/user/";
            const isProblemUrl =
                this._url.startsWith(problemPrefix) &&
                !isNaN(Number(this._url.substring(problemPrefix.length)));
                
            if (!isProfileUrl && !isProblemUrl) return;

            let problemId = -1;

            if(isProblemUrl){
                const url_split = this._url.split("/");
                problemId = Number(url_split[url_split.length - 1]);
            }

            const data = {
                id:problemId,
                status: this.status,
                response: this.responseText,
            };
            // console.log("In Inject.js",data);

            // Dispatch a custom event with the data
            window.dispatchEvent(new CustomEvent("xhrDataFetched", { detail : data }));
        });

        return originalSend.apply(this, arguments);
    };
})();
