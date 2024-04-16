(async () => {
    // Открываем табы
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const robbiTab = await chrome.tabs.create({ url: 'https://robbi.ai/', active: false });
    chrome.windows.create({ type: 'popup', focused: true, width: 400, height: 520, url: chrome.runtime.getURL('/window/window.html') });

    // Триггерим контент-скрипт фигмы и сохраняем id табов
    if (activeTab.id && robbiTab.id) {
        chrome.storage.session.set({ figmaTabId: activeTab.id });
        chrome.storage.session.set({ robbiTabId: robbiTab.id });

        const messageContent: PopupMessageContent = { type: 'start', payload: { runtimeId: chrome.runtime.id } };
        chrome.tabs.sendMessage(activeTab.id, messageContent);
    } else {
        alert('Открой расширение на вкладке с фигмой');
    }

    window.close();
})();
