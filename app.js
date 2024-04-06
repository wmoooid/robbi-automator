document.querySelector('button').addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    console.log(activeTab);
    chrome.tabs.sendMessage(activeTab.id, chrome.runtime.id);
});

chrome.runtime.onMessageExternal.addListener(function (request) {
    sendToRobbi(request);
});

async function sendToRobbi(blobUrlArray) {
    const robbiTab = await chrome.tabs.create({ url: 'https://robbi.ai/', active: false });

    const robbiInject = await chrome.scripting.executeScript({
        target: { tabId: robbiTab.id },
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

    chrome.tabs.remove(robbiTab.id);

    robbiInject[0].result.forEach((result) => {
        const section = document.createElement('section');
        const image = document.createElement('img');
        const heading = document.createElement('h3');
        image.src = result[1];
        heading.textContent = result[0];
        section.append(image, heading);
        document.body.prepend(section);
    });
}
