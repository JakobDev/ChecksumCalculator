let urls = new Map();

async function openFilePicker() {
    let [fileHandle] = await window.showOpenFilePicker();
    let file = await fileHandle.getFile();
    let url = URL.createObjectURL(file);
    chrome.runtime.sendMessage({ openCalculatePageURL: url });
    urls.set(url, new Date());
}


function keepAliveURL(url) {
    // Update the Time of the URL to mark it is still needed
    if (urls.has(url)) {
        urls.set(url, new Date());
    }
}

function clearURLs() {
    let now = new Date();
    urls.forEach(function(value, key)  {
        // If the blob: URL hasn't been needed for over 30 seconds, we can delete it
        if (((now - value) / 1000) > 30) {
            URL.revokeObjectURL(key);
            urls.delete(key);
        }
    })

    // If we have no URLs left, we can close the Page
    if (urls.size == 0) {
        window.close();
    }
}

chrome.runtime.onMessage.addListener(msg => {
    if (msg.offscreenShowOpenFilePicker)  { openFilePicker() }
    if (msg.offscreenKeepAliveURL) { keepAliveURL(msg.offscreenKeepAliveURL) }
    return true;
});

setInterval(function() {
    clearURLs();
}, 10000);
