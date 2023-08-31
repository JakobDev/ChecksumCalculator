async function filePickerClicked() {
    if (chrome.offscreen == null) {
        await chrome.permissions.request({ permissions: ["offscreen"]});

        if (chrome.offscreen == null) {
            return;
        }
    }

    if (!(await chrome.offscreen.hasDocument())) {
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('Popup/offscreen.html'),
            reasons: ["BLOBS"],
            justification: 'reason for needing the document',
        });
    }

    chrome.runtime.sendMessage({ offscreenShowOpenFilePicker: true });
    return;
}

window.onload = function() {
    document.querySelectorAll("[chrome-i18n]").forEach(function(element) {
        element.innerText = chrome.i18n.getMessage(element.getAttribute("chrome-i18n"));
    });

    document.getElementById("file-picker-button").addEventListener("click", filePickerClicked);
}