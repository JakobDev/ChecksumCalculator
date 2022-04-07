const params = new URLSearchParams(window.location.search);
const currentRunning = {};

function calculateHashFromBlob(method, blob, inputid) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () {
        var wordArray = CryptoJS.lib.WordArray.create(reader.result),
            hash = CryptoJS[method](wordArray).toString();
            document.getElementById(inputid).value = hash;
            delete currentRunning[method];
    };
}

function calculateHashFromUrl(method, inputid) {
    if (method in currentRunning) {
        return;
    }

    currentRunning[method] = true;

    document.getElementById(inputid).value = chrome.i18n.getMessage("waitText");

    var oReq = new XMLHttpRequest();
    oReq.open("GET", params.get("url"));
    oReq.responseType = "blob";

    oReq.onload = function(oEvent) {
        var blob = oReq.response;
        calculateHashFromBlob(method, blob, inputid);
    };

    oReq.onerror = function(oEvent) {
        document.getElementById(inputid).value = chrome.i18n.getMessage("errorText");
        delete currentRunning[method];
    }

    oReq.send();
}

window.onload = function() {
    document.title = chrome.i18n.getMessage("popupTitle")

    document.getElementById("header-text").innerText = chrome.i18n.getMessage("headerText", params.get("url"));

    const checksumTypes = ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512", "SHA3", "RIPEMD160"]

    let tableHtml = ""
    checksumTypes.forEach(function(type) {
        tableHtml += "<tr>"
        tableHtml += "<td>" + type + ":</td>"
        tableHtml += '<td><input id="' + type + '-input" type="text" style="width: 800px" placeholder="' + chrome.i18n.getMessage("placeholderText") + '" readonly/></td>'
        tableHtml += '<td><button id="' + type + '-button"></button></td>'
        tableHtml += "</tr>"
    })

    document.getElementById("checksum-table").innerHTML = tableHtml;

    checksumTypes.forEach(function(type) {
        document.getElementById(type + "-button").innerText = chrome.i18n.getMessage("calculateButton");
        document.getElementById(type + "-button").addEventListener("click", function() { calculateHashFromUrl(type, type + "-input") });
    })
}