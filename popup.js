(async () => {
    // Открываем табы
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const robbiTab = await chrome.tabs.create({ url: 'https://robbi.ai/', active: false });
    chrome.windows.create({ type: 'popup', focused: true, width: 400, height: 520, url: chrome.runtime.getURL('window.html') });

    chrome.storage.session.set({ figmaTabId: activeTab.id });
    chrome.storage.session.set({ robbiTabId: robbiTab.id });

    // Триггерим контент-скрипт фигмы
    chrome.tabs.sendMessage(activeTab.id, { type: 'start', payload: { runtimeId: chrome.runtime.id } });

    window.close();
})();
