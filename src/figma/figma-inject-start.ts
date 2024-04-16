/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

(async () => {
    const runtimeId = sessionStorage.getItem('robbi-runtime-id');

    let prevBufferLength;

    window.robbiEventHandler = async (e) => {
        if (e.button != 0) return;

        // Определеяем фрейм для проверки
        const watchFrameId = new URLSearchParams(window.location.search).get('node-id').replace('-', ':');
        if (watchFrameId === '0:1') return;
        const watchFrame = figma.getNodeById(watchFrameId);

        // Экспортируем фрейм
        const imageBuffer = await watchFrame.exportAsync({
            format: 'JPG',
            constraint: { type: 'WIDTH', value: 960 },
        });

        // Прерываем, если изображение не изменилось
        if (imageBuffer.length === prevBufferLength) return;
        prevBufferLength = imageBuffer.length;

        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const blobURL = URL.createObjectURL(blob);

        const image = new Image();
        image.onload = () => {
            const start = performance.now();
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            canvas.toBlob(
                (blob) => {
                    // Отправляем ссылку в попап
                    const blobUrlArray = [URL.createObjectURL(blob)];
                    chrome.runtime.sendMessage(runtimeId, { blobUrlArray });
                },
                'image/jpeg',
                0.5,
            );

            const end = performance.now();
            console.log(end - start, 'ms');
        };
        image.src = blobURL;
    };

    document.addEventListener('mouseup', robbiEventHandler);
})();
