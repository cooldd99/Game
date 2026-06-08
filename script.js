const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const infoSection = document.getElementById('infoSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const errorMessage = document.getElementById('errorMessage');
const newSearchBtn = document.getElementById('newSearchBtn');
const queryDisplay = document.getElementById('queryDisplay');

searchForm.addEventListener('submit', handleSearch);
newSearchBtn.addEventListener('click', resetSearch);

async function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    infoSection.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        const results = await fetchResults(query);
        displayResults(query, results);
    } catch (error) {
        console.error('Search error:', error);
        showError('Error searching. Please try again.');
        loadingIndicator.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }
}

async function fetchResults(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        const results = [];

        if (data.AbstractText && data.AbstractURL) {
            results.push({
                title: data.Heading || 'Result',
                url: data.AbstractURL,
                snippet: data.AbstractText
            });
        }

        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.forEach(topic => {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.substring(0, 60),
                        url: topic.FirstURL,
                        snippet: topic.Text
                    });
                }
            });
        }

        return results.slice(0, 10);
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

function displayResults(query, results) {
    loadingIndicator.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    queryDisplay.textContent = query;
    resultsList.innerHTML = '';

    if (!results || results.length === 0) {
        resultsList.innerHTML = '<div style="text-align: center; padding: 40px;">No results found. Try a different search.</div>';
        return;
    }

    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        const title = document.createElement('div');
        title.className = 'result-title';
        title.textContent = result.title;
        title.addEventListener('click', () => window.open(result.url, '_blank'));
        
        const url = document.createElement('div');
        url.className = 'result-url';
        url.textContent = result.url;
        
        const snippet = document.createElement('div');
        snippet.className = 'result-snippet';
        snippet.textContent = result.snippet;
        
        div.appendChild(title);
        div.appendChild(url);
        div.appendChild(snippet);
        resultsList.appendChild(div);
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function resetSearch() {
    searchInput.value = '';
    resultsSection.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    infoSection.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    searchInput.focus();
}

window.addEventListener('load', () => {
    searchInput.focus();
});
