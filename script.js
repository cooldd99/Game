const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const historyContainer = document.getElementById('historyContainer');

let searchHistory = JSON.parse(localStorage.getItem('privateSearchHistory')) || [];

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function displayHistory() {
    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: #999; font-size: 13px; padding: 10px 0;">No searches yet</p>';
        return;
    }

    let html = '';
    searchHistory.slice().reverse().forEach((item, index) => {
        html += `
            <div class="history-item">
                <div class="history-item-text" onclick="searchFor('${item.replace(/'/g, "\\'")}'" title="${item}">${item}</div>
                <div class="history-item-delete" onclick="deleteHistoryItem(${searchHistory.length - 1 - index})">✕</div>
            </div>
        `;
    });
    historyContainer.innerHTML = html;
}

function searchFor(query) {
    searchInput.value = query;
    performSearch();
}

function deleteHistoryItem(index) {
    searchHistory.splice(index, 1);
    localStorage.setItem('privateSearchHistory', JSON.stringify(searchHistory));
    displayHistory();
}

function clearHistory() {
    if (confirm('Clear all search history?')) {
        searchHistory = [];
        localStorage.setItem('privateSearchHistory', JSON.stringify(searchHistory));
        displayHistory();
    }
}

function newSearch() {
    searchInput.value = '';
    searchInput.focus();
    resultsContainer.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">🛡️</div>
            <div class="welcome-title">Search Privately</div>
            <div class="welcome-subtitle">Anonymous search powered by DuckDuckGo</div>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">✓</div>
                    <div class="feature-title">No Tracking</div>
                    <div class="feature-desc">Your searches stay private</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">✓</div>
                    <div class="feature-title">Local History</div>
                    <div class="feature-desc">History stored only on this device</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">✓</div>
                    <div class="feature-title">Fast Results</div>
                    <div class="feature-desc">Instant search results from DuckDuckGo</div>
                </div>
            </div>
        </div>
    `;
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Add to history
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('privateSearchHistory', JSON.stringify(searchHistory));
        displayHistory();
    }

    resultsContainer.innerHTML = '<div class="loading">Searching</div>';

    try {
        // Fetch from DuckDuckGo API
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const data = await response.json();
        let html = '';

        // Display instant answer if available
        if (data.AbstractText) {
            html += `
                <div class="result">
                    <div class="result-title">${data.Heading || 'Answer'}</div>
                    <div class="result-snippet">${data.AbstractText}</div>
                    ${data.AbstractURL ? `<div class="result-url"><strong>Source:</strong> ${data.AbstractURL}</div>` : ''}
                </div>
            `;
        }

        // Display related topics
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.forEach(topic => {
                if (topic.FirstURL && topic.Text) {
                    html += `
                        <div class="result">
                            <div class="result-title">${topic.Text}</div>
                            ${topic.Result ? `<div class="result-snippet">${topic.Result}</div>` : ''}
                            <div class="result-url"><strong>URL:</strong> ${topic.FirstURL}</div>
                        </div>
                    `;
                }
            });
        }

        if (!html) {
            html = await fetchWebResults(query);
        }

        resultsContainer.innerHTML = html || '<div class="no-results">📭 No results found. Try a different search.</div>';
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<div class="error">⚠️ Error searching: ${error.message}</div>`;
    }
}

async function fetchWebResults(query) {
    try {
        // Fallback: Try SearX proxy for web results
        const response = await fetch(`https://searx.be/search?q=${encodeURIComponent(query)}&format=json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        let html = '';
        if (data.results && data.results.length > 0) {
            data.results.slice(0, 10).forEach(result => {
                html += `
                    <div class="result">
                        <div class="result-title">${result.title || result.url}</div>
                        <div class="result-url"><strong>URL:</strong> ${result.url}</div>
                        <div class="result-snippet">${result.content || 'No description available'}</div>
                    </div>
                `;
            });
        }
        return html;
    } catch (error) {
        console.error('Web search error:', error);
        return '<div class="no-results">📭 Unable to fetch web results. Please try again.</div>';
    }
}

window.addEventListener('load', () => {
    displayHistory();
    searchInput.focus();
});
