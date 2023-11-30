const params = new URLSearchParams(window.location.search);

function showToast(text) {
    Toastify({
        text: text,
        duration: 3000,
        gravity: "bottom",
        position: "right"
    }).showToast();
}

function calculateHashFromBlob(method, blob, inputid) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () {
        var wordArray = CryptoJS.lib.WordArray.create(reader.result),
            hash = CryptoJS[method](wordArray).toString();

            var inputElement = document.getElementById(inputid);
            inputElement.setAttribute("status", "success");
            inputElement.value = hash;
    };
}

async function calculateHashFromUrl(method, inputid) {
    var inputElement = document.getElementById(inputid);

    if (inputElement.getAttribute("status") == "calculating") {
        return;
    }

    inputElement.setAttribute("status", "calculating");

    var url = new URL(params.get("url"));
    if (url.protocol === "http:" || url.protocol === "https:") {
        inputElement.value = chrome.i18n.getMessage("waitPermissionText");
        var hasPermission = await chrome.permissions.request({"origins": [params.get("url")] });
        if (!hasPermission) {
            inputElement.value = chrome.i18n.getMessage("noPermissionText");
            inputElement.setAttribute("status", "error");
            return;
        }
    }

    inputElement.value = chrome.i18n.getMessage("waitText");

    var oReq = new XMLHttpRequest();
    oReq.open("GET", params.get("url"));
    oReq.responseType = "blob";

    oReq.onload = function(oEvent) {
        var blob = oReq.response;
        calculateHashFromBlob(method, blob, inputid);
    };

    oReq.onerror = function(oEvent) {
        inputElement.value = chrome.i18n.getMessage("errorText");
        inputElement.setAttribute("status", "error");
    }

    oReq.send();
}

function copyHash(inputid) {
    var inputElement = document.getElementById(inputid);

    if (inputElement.getAttribute("status") != "success") {
        showToast(chrome.i18n.getMessage("copyToastNoChecksum"));
        return;
    }

    navigator.clipboard.writeText(inputElement.value);
    showToast(chrome.i18n.getMessage("copyToastSuccess"))
}

async function sendUnloadMessage() {
    await chrome.runtime.sendMessage({ offscreenRemoveURL: params.get("url") });
}

window.onload = function() {
    document.title = chrome.i18n.getMessage("popupTitle");

    let linkElement = document.createElement("a");
    linkElement.href = params.get("url");
    linkElement.text = params.get("url");
    linkElement.target = "_blank";
    linkElement.rel = "noreferrer noopener";

    document.getElementById("header-text").innerHTML = chrome.i18n.getMessage("headerText", linkElement.outerHTML);

    const checksumTypes = ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512", "SHA3", "RIPEMD160"];

    if (typeof browser === "undefined") {
        var fillStyle = "-webkit-fill-available";
    } else {
        var fillStyle = "-moz-available";
    }

    let tableHtml = ""
    checksumTypes.forEach(function(type) {
        tableHtml += "<tr>";
        tableHtml += "<td>" + type + ":</td>";
        tableHtml += '<td width="100%"><input id="' + type + '-input" type="text" class="w3-input w3-border w3-round" style="width: ' + fillStyle + ';" status="none" placeholder="' + chrome.i18n.getMessage("placeholderText") + '" readonly/></td>';
        tableHtml += '<td><button id="' + type + '-calculate-button" class="w3-btn w3-blue"></button></td>';
        tableHtml += '<td><button id="' + type + '-copy-button" class="w3-btn w3-blue"></button></td>';
        tableHtml += "</tr>";
    })

    document.getElementById("checksum-table").innerHTML = tableHtml;

    checksumTypes.forEach(function(type) {
        document.getElementById(type + "-calculate-button").innerText = chrome.i18n.getMessage("calculateButton");
        document.getElementById(type + "-calculate-button").addEventListener("click", function() { calculateHashFromUrl(type, type + "-input") });

        document.getElementById(type + "-copy-button").innerText = chrome.i18n.getMessage("copyButton");
        document.getElementById(type + "-copy-button").addEventListener("click", function() { copyHash(type + "-input") });
    })

    document.getElementById("version-text").innerText = chrome.i18n.getMessage("versionText", chrome.runtime.getManifest()["version"]);

    const aboutLinks = [
        ["https://codeberg.org/JakobDev/ChecksumCalculator", "aboutLinkViewSource"],
        ["https://codeberg.org/JakobDev/ChecksumCalculator/issues", "aboutLinkReportBug"],
        ["https://translate.codeberg.org/projects/ChecksumCalculator/", "aboutLinkTranslate"],
    ];

    aboutLinksElement = document.getElementById("about-links");
    aboutLinks.forEach(function(link) {
        let singleAboutLink = document.createElement("a");
        singleAboutLink.href = link[0];
        singleAboutLink.text = chrome.i18n.getMessage(link[1]);
        singleAboutLink.target = "_blank";
        singleAboutLink.rel = "noreferrer noopener";

        aboutLinksElement.appendChild(singleAboutLink);
        aboutLinksElement.innerHTML += " ";
    })
    aboutLinksElement.innerHTML = aboutLinksElement.innerHTML.slice(0, -1);

    setInterval(function() {
        chrome.runtime.sendMessage({ offscreenKeepAliveURL: params.get("url") });
    }, 10000);}

    //chrome.permissions.request({"origins": [params.get("url")] });