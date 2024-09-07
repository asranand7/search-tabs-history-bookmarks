chrome.commands.onCommand.addListener(function (command) {
    if (command === "open-search-popup") {
        chrome.action.openPopup();
    }
});

