document.addEventListener('DOMContentLoaded', function () {
    const searchBox = document.getElementById('searchBox');
    const results = document.getElementById('results');

    // Focus on search box
    searchBox.focus();

    searchBox.addEventListener('input', function () {
        const query = searchBox.value.toLowerCase();
        results.innerHTML = '';

        if (query) {
            searchTabs(query);
            searchBookmarks(query);
            searchHistory(query);
        }
    });

    function searchTabs(query) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
                    console.log(tab); // Log favicon URL
                    addResult(tab.title, tab.url, tab.favIconUrl);
                }
            });
        });
    }

    function searchBookmarks(query) {
        chrome.bookmarks.search(query, function (bookmarks) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            bookmarks.forEach(function (bookmark) {
                console.log(bookmark); // Log bookmark icon URL
                addResult(bookmark.title, bookmark.url, bookmark.iconUrl || '');
            });
        });
    }

    function searchHistory(query) {
        const sevenDaysAgo = (new Date()).getTime() - (7 * 24 * 60 * 60 * 1000);
        chrome.history.search({
            text: query,
            startTime: sevenDaysAgo
        }, function (historyItems) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            historyItems.forEach(function (item) {
                console.log(item); // Log history favicon URL
                addResult(item.title, item.url, item.favIconUrl || '');
            });
        });
    }

    function addResult(title, url, iconUrl) {
        const li = document.createElement('li');
        const img = document.createElement('img');
        const a = document.createElement('a');

        img.src = iconUrl || ''; // Only use favicon URL
        img.onerror = function() {
            console.log('Failed to load favicon for:', url); // Log failure to load favicon
        };
        img.width = 24; // Adjust the size of the favicon
        img.height = 24;

        a.href = url;
        a.textContent = title || url;
        a.target = '_blank';

        li.appendChild(img);
        li.appendChild(a);
        results.appendChild(li);
    }
});
