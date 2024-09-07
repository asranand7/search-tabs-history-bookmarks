document.addEventListener('DOMContentLoaded', function () {
    const searchBox = document.getElementById('searchBox');
    const tabsResults = document.getElementById('tabs-results');
    const bookmarksResults = document.getElementById('bookmarks-results');
    const historyResults = document.getElementById('history-results');
    let currentIndex = -1;
    let allResults = [];

    // Focus on search box
    searchBox.focus();

    searchBox.addEventListener('input', function () {
        const query = searchBox.value.toLowerCase();
        tabsResults.innerHTML = '';
        bookmarksResults.innerHTML = '';
        historyResults.innerHTML = '';
        currentIndex = -1;
        allResults = [];

        if (query) {
            searchTabs(query);
            searchBookmarks(query);
            searchHistory(query);
        }
    });

    searchBox.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
            navigateResults(1);
        } else if (e.key === 'ArrowUp') {
            navigateResults(-1);
        } else if (e.key === 'Enter') {
            openResult();
        }
    });

    function searchTabs(query) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
                    console.log(tab); // Log favicon URL
                    addResult(tabsResults, tab.title, tab.url, tab.favIconUrl, 'Tab');
                }
            });
            updateAllResults();
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
                const faviconUrl = getFaviconUrl(bookmark.url);
                addResult(bookmarksResults, bookmark.title, bookmark.url, faviconUrl, 'Bookmark');
            });
            updateAllResults();
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
                const faviconUrl = getFaviconUrl(item.url);
                addResult(historyResults, item.title, item.url, faviconUrl, 'History', item.lastVisitTime);
            });
            updateAllResults();
        });
    }

    function getFaviconUrl(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.origin}/favicon.ico`;
        } catch (e) {
            console.error('Invalid URL:', url);
            return 'icon16.png'; // Default icon if URL is invalid
        }
    }

    function addResult(container, title, url, iconUrl, source, visitTime) {
        const li = document.createElement('li');
        const img = document.createElement('img');
        const a = document.createElement('a');
        const sourceSpan = document.createElement('span');

        img.src = iconUrl || 'icon16.png'; // Use local icon16.png if favicon URL is not available
        img.onerror = function() {
            console.log('Failed to load favicon for:', url); // Log failure to load favicon
            this.src = 'icon16.png'; // Fallback to local icon16.png
        };
        img.width = 24; // Adjust the size of the favicon
        img.height = 24;

        sourceSpan.className = 'source-info';
        if (source === 'History' && visitTime) {
            const date = new Date(visitTime);
            sourceSpan.textContent = ` • ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }

        a.href = url;
        a.textContent = title || url;
        a.target = '_blank';

        li.appendChild(img);
        li.appendChild(a);
        li.appendChild(sourceSpan);
        container.appendChild(li);
    }

    function updateAllResults() {
        allResults = Array.from(document.querySelectorAll('.results-list li'));
    }

    function navigateResults(direction) {
        if (allResults.length === 0) return;

        // Remove highlight from current item
        if (currentIndex >= 0) {
            allResults[currentIndex].classList.remove('highlight');
        }

        // Update current index
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = allResults.length - 1;
        } else if (currentIndex >= allResults.length) {
            currentIndex = 0;
        }

        // Highlight the new current item
        allResults[currentIndex].classList.add('highlight');
        allResults[currentIndex].scrollIntoView({ block: 'nearest' });
    }

    function openResult() {
        if (currentIndex >= 0 && allResults.length > 0) {
            const link = allResults[currentIndex].querySelector('a');
            if (link) {
                link.click();
            }
        }
    }
});
