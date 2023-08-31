function openCalculatePageRadionButtonChanged() {
    if (document.getElementById("open-calculate-page-radio-window").checked) {
        var openType = "window";
    }
    else {
        var openType = "tab";
    }

    chrome.storage.sync.set({
        calculatePageOpenType: openType
    }, function(options) {});
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[chrome-i18n]").forEach(function(element) {
        element.innerText = chrome.i18n.getMessage(element.getAttribute("chrome-i18n"));
    })

    chrome.storage.sync.get({
        calculatePageOpenType: "window",
    }, function(options) {
        calculatePageWindowRadioButton = document.getElementById("open-calculate-page-radio-window");
        calculatePageTabRadioButton = document.getElementById("open-calculate-page-radio-tab");

        if (options.calculatePageOpenType === "window") {
            calculatePageWindowRadioButton.checked = true;
            calculatePageTabRadioButton.checked = false;
        }
        else {
            calculatePageWindowRadioButton.checked = false;
            calculatePageTabRadioButton.checked = true;
        }

        calculatePageWindowRadioButton.addEventListener("change", openCalculatePageRadionButtonChanged);
        calculatePageTabRadioButton.addEventListener("change", openCalculatePageRadionButtonChanged);
    });
});
