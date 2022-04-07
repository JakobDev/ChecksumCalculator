chrome.contextMenus.create({
    id: "calculate-checksum",
    title: chrome.i18n.getMessage("contextMenu"),
    contexts: ["link"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "calculate-checksum") {
        chrome.windows.create({ url: chrome.runtime.getURL("popup.html?url=" + info.linkUrl), type:  "popup", width: 1015, height: 400});
    }
})