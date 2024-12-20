// Replace with your actual Foursquare API key
const FOURSQUARE_API_KEY = 'fsq3U7xy9EnPvBvSTlRv0g/wOb0Nn87rHqumNaQi6sWg0d0=';

let map;
let markers = [];

// Get DOM elements
const resultsSearchInput = document.getElementById('results-search-input');
const resultsSearchButton = document.getElementById('results-search-button');
const searchResultsList = document.getElementById('search-results-list');
// Add these variables at the top of results.js
let currentCafes = [];
let userLocation = null;
let activeShop = null;

// Add filter button and details panel to the HTML
function addUIElements() {
    // Add filter button
    const filterButton = document.createElement('button');
    filterButton.className = 'filter-toggle-button';
    filterButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="coffee-cup-icon" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
    `;
    document.querySelector('.results-container').appendChild(filterButton);

    // Add filter section
    const filterSection = document.createElement('div');
    filterSection.className = 'filter-section hidden';
    filterSection.innerHTML = `
        <div class="filter-controls">
            <select id="sort-filter" class="filter-select">
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
            </select>
            <div class="price-filter">
                <label>Price Range:</label>
                <div class="price-buttons">
                    <button class="price-button" data-price="1">$</button>
                    <button class="price-button" data-price="2">$$</button>
                    <button class="price-button" data-price="3">$$$</button>
                    <button class="price-button" data-price="4">$$$$</button>
                </div>
            </div>
            <div class="rating-filter">
                <label>Minimum Rating:</label>
                <input type="range" id="rating-slider" min="0" max="10" value="0" step="0.5">
                <span id="rating-value">Any</span>
            </div>
        </div>
    `;
    document.querySelector('.results-container').appendChild(filterSection);

    // // Add details panel
    // const detailsPanel = document.createElement('div');
    // detailsPanel.className = 'details-panel hidden';
    // detailsPanel.innerHTML = `
    //     <button class="close-details">×</button>
    //     <div class="details-content"></div>
    // `;
    // document.querySelector('.results-container').appendChild(detailsPanel);

    // Setup event listeners
    setupUIListeners();
    //setupFilterListeners();
}// Setup UI event listeners
function setupUIListeners() {
    const filterButton = document.querySelector('.filter-toggle-button');
    const filterSection = document.querySelector('.filter-section');
    const closeDetailsButton = document.querySelector('.close-details');
    
    filterButton.addEventListener('click', () => {
        filterSection.classList.toggle('hidden');
        filterButton.classList.toggle('active');
    });

    closeDetailsButton.addEventListener('click', () => {
        document.querySelector('.details-panel').classList.add('hidden');
    });

    // Setup filter listeners
    setupFilterListeners();
}
function setupFilterListeners() {
    const sortFilter = document.getElementById('sort-filter');
    const ratingSlider = document.getElementById('rating-slider');
    const ratingValue = document.getElementById('rating-value');
    const priceButtons = document.querySelectorAll('.price-button');
    
    let selectedPrices = new Set();

    // Sort filter
    sortFilter.addEventListener('change', () => applyFilters(selectedPrices));

    // Rating filter
    ratingSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        ratingValue.textContent = value === 0 ? 'Any' : value.toFixed(1);
        applyFilters(selectedPrices);
    });

    // Price filter
    priceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const price = parseInt(button.dataset.price);
            if (selectedPrices.has(price)) {
                selectedPrices.delete(price);
                button.classList.remove('active');
            } else {
                selectedPrices.add(price);
                button.classList.add('active');
            }
            applyFilters(selectedPrices);
        });
    });
}
function applyFilters(selectedPrices) {
    const sortFilter = document.getElementById('sort-filter');
    const ratingSlider = document.getElementById('rating-slider');
    
    let filteredCafes = [...currentCafes];
    
    // Apply price filter
    if (selectedPrices.size > 0) {
        filteredCafes = filteredCafes.filter(cafe => 
            cafe.venueDetails?.price && selectedPrices.has(cafe.venueDetails.price)
        );
    }
    
    // Apply rating filter
    const minRating = parseFloat(ratingSlider.value);
    if (minRating > 0) {
        filteredCafes = filteredCafes.filter(cafe => 
            cafe.venueDetails?.rating && cafe.venueDetails.rating >= minRating
        );
    }
    
    // Apply sorting
    switch (sortFilter.value) {
        case 'name':
            filteredCafes.sort((a, b) => 
                (a.tags.name || '').localeCompare(b.tags.name || '')
            );
            break;
        case 'rating':
            filteredCafes.sort((a, b) => 
                (b.venueDetails?.rating || 0) - (a.venueDetails?.rating || 0)
            );
            break;
        case 'price-low':
            filteredCafes.sort((a, b) => 
                (a.venueDetails?.price || 0) - (b.venueDetails?.price || 0)
            );
            break;
        case 'price-high':
            filteredCafes.sort((a, b) => 
                (b.venueDetails?.price || 0) - (a.venueDetails?.price || 0)
            );
            break;
    }
    
    updateDisplayedResults(filteredCafes);
}
// Custom coffee icon
const coffeeIcon = L.divIcon({
    html: `
        <div style="
            background-image: url('coffee-cup.png');
            background-size: cover;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);">
        </div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Initialize map
function initMap() {
    // Get search query from URL
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');

    // Initialize map with default view
    map = L.map('map').setView([40.7128, -74.0060], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // If there's a search query in URL, execute search
    if (searchQuery) {
        resultsSearchInput.value = searchQuery;
        searchLocation(searchQuery);
    }
}

// Format price range
function getPriceRange(price) {
    return price ? '$'.repeat(price) : 'Price not available';
}

// Format hours
function formatHours(hours) {
    if (!hours?.regular) return 'Hours not available';
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return daysOfWeek.map(day => {
        const dayHours = hours.regular.find(h => h.day === day);
        return `<div class="day-hours">
            <span style="font-weight: bold;">${day}:</span> 
            ${dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed'}
        </div>`;
    }).join('');
}

// Fetch venue details from Foursquare
async function getFoursquareVenueDetails(lat, lon, name) {
    try {
        const searchResponse = await fetch(
            `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(name)}&ll=${lat},${lon}&radius=1000&limit=1`,
            {
                headers: {
                    'Authorization': FOURSQUARE_API_KEY
                }
            }
        );

        if (!searchResponse.ok) throw new Error(`Foursquare API error: ${searchResponse.status}`);
        
        const searchData = await searchResponse.json();
        
        if (searchData.results?.[0]) {
            const venue = searchData.results[0];
            
            const detailsResponse = await fetch(
                `https://api.foursquare.com/v3/places/${venue.fsq_id}?fields=description,rating,price,photos,hours,menu,tips,tel,website,social_media`,
                {
                    headers: {
                        'Authorization': FOURSQUARE_API_KEY
                    }
                }
            );

            if (!detailsResponse.ok) throw new Error(`Foursquare API error: ${detailsResponse.status}`);
            
            return await detailsResponse.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching venue details:', error);
        return null;
    }
}

// Search location and find coffee shops
async function searchLocation(query) {
    try {
        showLoading(true);
        
        // Geocode the search query
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data?.[0]) {
            const { lat, lon } = data[0];
            map.setView([lat, lon], 15);

            // Search for coffee shops using Overpass API
            const overpassQuery = `
                [out:json][timeout:15];
                (
                    node["amenity"="cafe"](around:1500,${lat},${lon});
                    way["amenity"="cafe"](around:1500,${lat},${lon});
                );
                out body;
                >;
                out skel qt;
            `;

            const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });
            
            const overpassData = await overpassResponse.json();
            await displayResults(overpassData.elements);
        } else {
            showError('Location not found. Please try a different search.');
        }
    } catch (error) {
        console.error('Search error:', error);
       //showError('An error occurred while searching. Please try again.');
    } finally {
        showLoading(false);
    }
}
async function displayResults(places) {
    // Filter out places without names
    const validPlaces = places.filter(place => place.tags && place.tags.name);
    
    // Store current cafes
    currentCafes = validPlaces;
    
    // Get venue details for each place
    const placesWithDetails = await Promise.all(
        validPlaces.map(async (place) => {
            const venueDetails = await getFoursquareVenueDetails(
                place.lat,
                place.lon,
                place.tags.name
            );
            return { ...place, venueDetails };
        })
    );

    // Update the display with the places that have details
    updateDisplayedResults(placesWithDetails);
}

// Create popup content
function createPopupContent(place, venueDetails) {
    const name = place.tags.name || 'Unnamed Coffee Shop';
    const address = place.tags['addr:street'] ? 
        `${place.tags['addr:street']} ${place.tags['addr:housenumber'] || ''}` : 
        'Address not available';

    let content = `
        <div class="popup-content">
            <h3>${name}</h3>
    `;

    if (venueDetails) {
        // Add venue photos
        if (venueDetails.photos?.length > 0) {
            content += `
                <div class="image-gallery">
                    ${venueDetails.photos.slice(0, 3).map(photo => 
                        `<img src="${photo.prefix}300x200${photo.suffix}" alt="${name}">`
                    ).join('')}
                </div>
            `;
        }

        // Add rating and price
        content += `
            <div class="venue-info">
                ${venueDetails.rating ? 
                    `<span class="rating">★ ${venueDetails.rating.toFixed(1)}</span>` : ''}
                ${venueDetails.price ? 
                    `<span class="price">${getPriceRange(venueDetails.price)}</span>` : ''}
            </div>
        `;

        // Add hours
        if (venueDetails.hours) {
            content += `
                <div class="hours-container">
                    <strong>Hours:</strong>
                    ${formatHours(venueDetails.hours)}
                </div>
            `;
        }

        // Add reviews/tips
        if (venueDetails.tips?.length > 0) {
            content += `
                <div class="tips-container">
                    <strong>Recent Review:</strong>
                    <p>"${venueDetails.tips[0].text}"</p>
                </div>
            `;
        }

        // Add contact information
        content += `
            <div class="contact-info">
                <p>📍 ${address}</p>
                ${venueDetails.tel ? `<p>📞 ${venueDetails.tel}</p>` : ''}
                ${venueDetails.website ? 
                    `<p>🌐 <a href="${venueDetails.website}" target="_blank">Visit Website</a></p>` : ''}
            </div>
        `;
    }

    content += '</div>';
    return content;
}

// Display results on map and in list
function createResultItem(place, marker, venueDetails) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'cafe-card';
    
    const imageUrl = venueDetails?.photos?.[0] ? 
        `${venueDetails.photos[0].prefix}300x200${venueDetails.photos[0].suffix}` : 
        'default-cafe.jpg';

    const rating = venueDetails?.rating ? 
        `<div class="cafe-rating">★ ${venueDetails.rating.toFixed(1)}</div>` : '';
    
    const price = venueDetails?.price ? 
        `<div class="cafe-price">${'$'.repeat(venueDetails.price)}</div>` : '';

    const address = place.tags['addr:street'] ? 
        `${place.tags['addr:street']} ${place.tags['addr:housenumber'] || ''}` : 
        'Address not available';

    const status = venueDetails?.hours?.status || 'Hours not available';
    const statusClass = status.toLowerCase().includes('open') ? 'status-open' : 'status-closed';

    resultDiv.innerHTML = `
        <div class="cafe-image" style="background-image: url('${imageUrl}')">
            <div class="cafe-overlay">
                ${rating}
                ${price}
            </div>
        </div>
        <div class="cafe-info">
            <h3 class="cafe-name">${place.tags.name}</h3>
            <div class="cafe-details">
                <div class="cafe-address">
                    <i class="location-icon">📍</i>
                    ${address}
                </div>
                <div class="cafe-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${status}
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    resultDiv.addEventListener('click', () => {
        map.setView([place.lat, place.lon], 17);
        marker.openPopup();
        //showDetailsPanel(place, venueDetails);
    });

    resultDiv.addEventListener('mouseenter', () => {
        marker.setZIndexOffset(1000);
        resultDiv.classList.add('cafe-card-hover');
    });

    resultDiv.addEventListener('mouseleave', () => {
        marker.setZIndexOffset(0);
        resultDiv.classList.remove('cafe-card-hover');
    });

    return resultDiv;
}

// Modify updateDisplayedResults function
function updateDisplayedResults(filteredCafes) {
    clearMarkers();
    searchResultsList.innerHTML = '';

    // Create results grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'cafe-grid';
    searchResultsList.appendChild(gridContainer);

    filteredCafes.forEach(place => {
        const marker = L.marker([place.lat, place.lon], { icon: coffeeIcon }).addTo(map);
        markers.push(marker);
        
        const popupContent = createPopupContent(place, place.venueDetails);
        marker.bindPopup(popupContent);
        
        const resultItem = createResultItem(place, marker, place.venueDetails);
        gridContainer.appendChild(resultItem);
    });

    if (filteredCafes.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div class="no-results-content">
                <img src="coffee-empty.png" alt="No results" class="no-results-icon">
                <h3>No coffee shops found</h3>
                <p>Try adjusting your filters or search in a different area</p>
            </div>
        `;
        searchResultsList.appendChild(noResults);
    }
}
// Clear markers from map
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Show/hide loading indicator
function showLoading(show) {
    const existingLoader = document.querySelector('.loading');
    if (show && !existingLoader) {
        const loader = document.createElement('div');
        loader.className = 'loading';
        loader.textContent = 'Searching for coffee shops...';
        document.querySelector('.map-section').appendChild(loader);
    } else if (!show && existingLoader) {
        existingLoader.remove();
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    searchResultsList.prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Event listeners
resultsSearchButton.addEventListener('click', () => {
    const query = resultsSearchInput.value.trim();
    if (query) {
        window.history.pushState({}, '', `?search=${encodeURIComponent(query)}`);
        searchLocation(query);
    }
});

resultsSearchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const query = resultsSearchInput.value.trim();
        if (query) {
            window.history.pushState({}, '', `?search=${encodeURIComponent(query)}`);
            searchLocation(query);
        }
    }
});

// Initialize map when the page loads
window.addEventListener('load', ()=>{
    initMap();
    addUIElements();
    
});