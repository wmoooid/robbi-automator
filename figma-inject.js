(async () => {
    if (figma.currentPage.selection.length === 0) {
        alert('Нет выделенных фреймов в фигме');
        return;
    }

    console.warn('figma inject');

    const runtimeId = document.body.getAttribute('robbi-runtime-id');

    const promiseArray = figma.currentPage.selection.map(async (node) => {
        const u8a = await node.exportAsync({
            format: 'JPG',
            constraint: { type: 'SCALE', value: 1 },
        });
        const blob = new Blob([u8a], { type: 'image/jpeg' });
        const link = URL.createObjectURL(blob);

        return new Promise(async (res) => res(link));
    });

    const blobUrlArray = await Promise.all(promiseArray);
    chrome.runtime.sendMessage(runtimeId, await blobUrlArray);
})();
