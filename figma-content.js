chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'start') {
        console.log('START');
        const { runtimeId } = request.payload;

        // Сохраняем айди
        sessionStorage.setItem('robbi-runtime-id', runtimeId);

        // Запускаем скрипт и удаляем после запуска
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('figma-inject-start.js');

        script.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }

    if (request.type === 'stop') {
        console.log('STOP');
        // Запускаем скрипт и удаляем после запуска
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('figma-inject-stop.js');

        script.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }

    sendResponse('recieved');
});
