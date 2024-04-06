chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    document.body.setAttribute('robbi-runtime-id', request);
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('figma-inject.js');
    console.warn('content script');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    sendResponse('recieved');
});
