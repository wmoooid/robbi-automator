document.addEventListener('DOMContentLoaded', () => {
    const image = document.querySelector('.check-image');
    const heading = document.querySelector('h3');

    chrome.runtime.onMessageExternal.addListener(async function (request) {
        // Получаем ссылки и отправляем в робби
        const { blobUrlArray } = request;
        sendToRobbi(blobUrlArray);

        // Отображение загрузки и предзагрузка
        image.classList.add('loading');
        const preloadImage = new Image();
        preloadImage.src = blobUrlArray[0];
    });

    async function sendToRobbi(blobUrlArray) {
        const robbiTabId = await chrome.storage.session.get(['robbiTabId']).then((res) => res.robbiTabId);

        const robbiInject = await chrome.scripting.executeScript({
            target: { tabId: parseInt(robbiTabId) },
            args: [blobUrlArray],
            func: async (blobUrlArray) => {
                try {
                    const responseArray = blobUrlArray.map(async (url) => {
                        const urlResponse = await fetch(url);
                        const blob = await urlResponse.blob();
                        const file = new File([blob], 'image.jpg', { type: blob.type });

                        const formData = new FormData();
                        formData.append('id', 'ocr');
                        formData.append('image', file);

                        const robbiResponse = await fetch('https://robbi.ai/app/execute', {
                            method: 'POST',
                            body: formData,
                        });
                        const parsedRobbiResponse = await robbiResponse.json();

                        return new Promise(async (res) => res([await parsedRobbiResponse.result, url]));
                    });

                    const results = await Promise.all(responseArray);
                    return results;
                } catch (error) {
                    return new String(error);
                }
            },
        });

        robbiInject[0].result.forEach((result) => {
            image.style.setProperty('--image', `url(${result[1]})`);
            heading.textContent = result[0];
            image.classList.remove('loading');
        });
    }

    document.querySelector('button').addEventListener('click', async () => {
        const figmaTabId = await chrome.storage.session.get(['figmaTabId']).then((res) => res.figmaTabId);
        const robbiTabId = await chrome.storage.session.get(['robbiTabId']).then((res) => res.robbiTabId);
        chrome.tabs.sendMessage(figmaTabId, { type: 'stop' });
        chrome.tabs.remove(robbiTabId);
        window.close();
    });
});
