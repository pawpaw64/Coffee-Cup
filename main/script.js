// Get the input field and button
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Add an event listener for the button click
searchButton.addEventListener('click', handleSearch);

// Add an event listener for the Enter key
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        // Navigate to the next page with the search query
        window.location.href = `results.html?search=${encodeURIComponent(query)}`;
    } else {
        alert('Please enter a search term!');
    }
}