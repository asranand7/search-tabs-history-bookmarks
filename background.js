// Listen for a command (e.g., keyboard shortcut)
chrome.commands.onCommand.addListener(function (command) {
    if (command === "open-search-popup") {
        // Open the extension's popup
        chrome.action.openPopup();
    }
});
