(async () => {
    const runtimeId: RuntimeID | null = sessionStorage.getItem('robbi-runtime-id');

    let prevBufferLength: number;

    window.robbiEventHandler = async (e: MouseEvent) => {
        if (e.button != 0) return;

        // Определеяем фрейм для проверки
        const rawFrameID = new URLSearchParams(window.location.search).get('node-id');

        if (rawFrameID === null) {
            alert('Выдели фрейм в фигме');
            return;
        }

        const watchFrameId = rawFrameID.replace('-', ':');

        if (watchFrameId === '0:1') {
            alert('Выдели фрейм в фигме. Если вдруг он не на первой странице, перемести его туда');
            return;
        }

        const watchFrame = await figma.getNodeByIdAsync(watchFrameId);

        if (watchFrame === null) {
            alert('Фигма почему-то не нашла фрейм. Попробуй обновить страницу.');
            return;
        }

        if (watchFrame.type !== 'FRAME') {
            alert('Выдели именно фрейм в фигме');
            return;
        }

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
            if (ctx === null) {
                alert('Что-то пошло не так во время экспорта из фигмы');
                return;
            }
            ctx.drawImage(image, 0, 0);
            canvas.toBlob(
                (blob) => {
                    // Отправляем ссылку в попап
                    if (blob === null) {
                        alert('Что-то пошло не так во время экспорта блоба из фигмы');
                        return;
                    }
                    const blobUrlArray: BlobURLArray = [URL.createObjectURL(blob)];
                    chrome.runtime.sendMessage(runtimeId, { blobUrlArray });
                },
                'image/jpeg',
                0.5,
            );

            const end = performance.now();
            console.log('Фрейм блобнулся за', end - start, 'мс');
        };
        image.src = blobURL;
    };

    document.addEventListener('mouseup', window.robbiEventHandler);
})();
