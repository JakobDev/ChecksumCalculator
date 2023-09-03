function openCalculatePage(url) {
    chrome.storage.sync.get({
        calculatePageOpenType: "window"
    }).then(function(options) {
        if (options.calculatePageOpenType === "window") {
            chrome.windows.create({ url: chrome.runtime.getURL("Calculate/calculate.html?url=" + url), type:  "popup"});
        }
        else {
            chrome.tabs.create({ url: chrome.runtime.getURL("Calculate/calculate.html?url=" + url)});
        }
    });
}

chrome.contextMenus.create({
    id: "calculate-checksum",
    title: chrome.i18n.getMessage("contextMenu"),
    contexts: ["link"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "calculate-checksum") {
        openCalculatePage(info.linkUrl);
    }
});

chrome.runtime.onMessage.addListener(msg => {
    if (msg.openCalculatePageURL) openCalculatePage(msg.openCalculatePageURL);
})
