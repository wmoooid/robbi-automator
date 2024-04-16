document.addEventListener('DOMContentLoaded', () => {
    const image: HTMLImageElement | null = document.querySelector('.check-image');
    const heading = document.querySelector('h3');

    chrome.runtime.onMessageExternal.addListener(async function ({ blobUrlArray }: { blobUrlArray: BlobURLArray }) {
        // Получаем ссылки и отправляем в робби
        sendToRobbi(blobUrlArray);

        // Отображение загрузки и предзагрузка
        image!.classList.add('loading');
        const preloadImage = new Image();
        preloadImage.src = blobUrlArray[0];
    });

    async function sendToRobbi(blobUrlArray: BlobURLArray) {
        const robbiTabId: TabID = await chrome.storage.session.get(['robbiTabId']).then((res) => res.robbiTabId);
        const robbiInject = await chrome.scripting.executeScript({
            target: { tabId: Number(robbiTabId) },
            args: [blobUrlArray],
            func: async (blobUrlArray) => {
                try {
                    const responseArray = blobUrlArray.map(async (url: BlobURL): Promise<RobbiResultReturn> => {
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
                        const parsedRobbiResponse: RobbiResponse = await robbiResponse.json();
                        const result: RobbiResultReturn = [parsedRobbiResponse.result, url];
                        return new Promise((res) => res(result));
                    });

                    const results = await Promise.all(responseArray);
                    return results;
                } catch (error) {
                    return new String(error);
                }
            },
        });

        robbiInject.forEach((inject) => {
            //@ts-expect-error неправильные тайпинги Chrome
            inject.result.forEach((result) => {
                image!.style.setProperty('--image', `url(${result[1]})`);
                heading!.textContent = result[0];
                image!.classList.remove('loading');
            });
        });
    }

    document.querySelector('button')!.addEventListener('click', async () => {
        const figmaTabId = await chrome.storage.session.get(['figmaTabId']).then((res) => res.figmaTabId);
        const robbiTabId = await chrome.storage.session.get(['robbiTabId']).then((res) => res.robbiTabId);
        chrome.tabs.sendMessage(figmaTabId, { type: 'stop' });
        chrome.tabs.remove(robbiTabId);
        window.close();
    });
});
