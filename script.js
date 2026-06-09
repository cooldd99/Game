const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const infoSection = document.getElementById('infoSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const resultsFrame = document.getElementById('resultsFrame');
const newSearchBtn = document.getElementById('newSearchBtn');
const queryDisplay = document.getElementById('queryDisplay');

searchForm.addEventListener('submit', handleSearch);
newSearchBtn.addEventListener('click', resetSearch);

function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    // Show loading state
    infoSection.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    // Set a small delay to show loading indicator
    setTimeout(() => {
        displayResults(query);
    }, 300);
}

function displayResults(query) {
    loadingIndicator.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    queryDisplay.textContent = query;
    
    // Build DuckDuckGo search URL that displays results directly
    // Using the search parameter with lite mode for better iframe compatibility
    const encodedQuery = encodeURIComponent(query);
    resultsFrame.src = `https://duckduckgo.com/?q=${encodedQuery}&ia=web&t=privatesearch`;
}

function resetSearch() {
    searchInput.value = '';
    resultsSection.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    infoSection.classList.remove('hidden');
    resultsFrame.src = '';
    searchInput.focus();
}

window.addEventListener('load', () => {
    searchInput.focus();
});
