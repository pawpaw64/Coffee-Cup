# ☕ CoffeeBee — Coffee Shop Finder

> A location-aware web application that helps users discover nearby coffee shops with interactive maps, rich venue details, and smart filtering.

![Landing Page](https://github.com/user-attachments/assets/2dc7f674-62b4-4c39-b772-ad2439d84db0)
![Results Map View](https://github.com/user-attachments/assets/8b0e1fc7-61c3-4b46-bb15-2cb114b1df6f)
![Filter Panel](https://github.com/user-attachments/assets/759dfde7-a203-41f0-aa52-9b126fc3a130)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**CoffeeBee** is a client-side web application that allows users to search for coffee shops near any location in the world. By entering a city, neighbourhood, or address into the search bar, users are taken to a split-view results page that displays matching cafés as interactive cards on the left and pinpoints them on a live map on the right.

Each result is enriched with real-time data from the Foursquare Places API — including photos, star ratings, price tier, opening hours, customer tips, phone numbers, and website links. A collapsible filter panel lets users sort and narrow results by name, rating, price range, or distance, making it easy to find exactly the right café for any occasion.

The project was built as an open-source, zero-backend web app; all data is fetched directly from public APIs in the browser, requiring no server or database.

---

## Key Features

### User-Facing Features

- **Location Search** — Enter any city, street, or landmark to discover nearby coffee shops within a 1.5 km radius.
- **Interactive Map** — Full-screen Leaflet.js map with custom coffee-cup markers; click a marker to open a rich popup.
- **Café Cards** — Grid of result cards showing photo, name, address, star rating, price tier, and open/closed status.
- **Venue Popup** — Detailed popup on the map including photo gallery, hours by day, most recent customer review, phone, and website link.
- **Filter & Sort Panel** — Slide-out panel (toggle button in top-right corner) with:
  - Sort by: Name · Rating · Distance · Price (low→high or high→low)
  - Filter by price tier: `$` · `$$` · `$$$` · `$$$$`
  - Filter by minimum rating (slider, 0–10)
- **Hover Interaction** — Hovering a card highlights its map marker, and vice-versa.
- **No-Results State** — Friendly empty state with guidance when no cafés match the active filters.
- **Responsive Design** — Adapts to mobile screens by stacking the results list above the map in a 50/50 split.
- **URL State** — The search query is stored in the URL (`?search=...`) so results pages are bookmarkable and shareable.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Markup | **HTML5** | Page structure for the landing and results views |
| Styling | **CSS3** | Custom responsive styles; no CSS framework dependency |
| Scripting | **Vanilla JavaScript (ES2017+)** | DOM manipulation, async API calls, filtering logic |
| Map Rendering | **[Leaflet.js](https://leafletjs.com/) v1.9.4** | Lightweight, open-source interactive maps |
| Map Tiles | **[OpenStreetMap](https://www.openstreetmap.org/)** | Free, community-maintained tile layer |
| Geocoding | **[Nominatim API](https://nominatim.org/)** | Converts user text queries into latitude/longitude |
| POI Data | **[Overpass API](https://overpass-api.de/)** | Queries OSM database for `amenity=cafe` nodes near a coordinate |
| Venue Enrichment | **[Foursquare Places API](https://developer.foursquare.com/) v3** | Provides photos, ratings, price, hours, tips, and contact info |

**Why no framework?** The application logic is straightforward enough that adding React/Vue would introduce unnecessary build complexity. Vanilla JS with async/await keeps the project dependency-free and instantly runnable from a file system or static host.

---

## Project Structure

```
Coffee-Cup/
├── README.md                  # Project documentation (this file)
└── main/
    ├── index.html             # Landing page — coffee icon, title, and search bar
    ├── results.html           # Results page — split view (card list + map)
    ├── script.js              # Landing page logic: captures search input and
    │                          #   redirects to results.html?search=<query>
    ├── results.js             # Core application logic:
    │                          #   map initialisation, geocoding, Overpass query,
    │                          #   Foursquare enrichment, card rendering,
    │                          #   filter/sort panel, marker management
    ├── style.css              # All styles: landing page, results layout,
    │                          #   café cards, popups, filter panel, responsive rules
    ├── coffee-cup.png         # Custom Leaflet map-marker icon (circular)
    ├── coffee-cup2.png        # Large header icon displayed on the landing page
    ├── coffee-marker.svg      # SVG variant of the coffee marker asset
    └── api/                   # Reserved directory for future backend/proxy work
```

---

## Setup Instructions

CoffeeBee is a fully static web application with no build step required.

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A **Foursquare Developer** account with a Places API key  
  → Create one at <https://developer.foursquare.com/>
- A local static file server (recommended) **or** the ability to open HTML files directly

> **Note:** Some browsers block cross-origin requests when files are opened directly via `file://`. Use a local server to avoid this.

### 1. Clone the Repository

```bash
git clone https://github.com/pawpaw64/Coffee-Cup.git
cd Coffee-Cup/main
```

### 2. Add Your Foursquare API Key

Open `results.js` and replace the placeholder key on line 2 with your own:

```js
// results.js
const FOURSQUARE_API_KEY = 'YOUR_FOURSQUARE_API_KEY_HERE';
```

> ⚠️ **Security note:** Because this is a client-side app the key is visible in browser DevTools. For production use, route Foursquare requests through a server-side proxy so the key is never exposed to end users.

### 3. Serve the Application

**Option A — Python (built-in)**
```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

**Option B — Node.js (`http-server`)**
```bash
npx http-server -p 8080
# Then open http://localhost:8080 in your browser
```

**Option C — VS Code Live Server**  
Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html`, and choose **Open with Live Server**.

### 4. Use the App

1. Type a city or address into the search bar on the landing page and press **Search** or hit `Enter`.
2. Browse the café cards on the results page, or explore the map.
3. Click the coffee-cup icon button (top-right) to open the filter panel.
4. Click any card or map marker to see full venue details.

---

## API Overview

CoffeeBee consumes three external APIs, all called directly from the browser.

### Nominatim (Geocoding)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `https://nominatim.openstreetmap.org/search` | Converts a free-text location query into `lat`/`lon` |

**Key parameters:** `format=json`, `q=<user query>`

---

### Overpass API (Coffee Shop Discovery)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `https://overpass-api.de/api/interpreter` | Returns OSM nodes/ways tagged `amenity=cafe` within 1 500 m of a coordinate |

**Query structure:**
```
[out:json][timeout:15];
(
  node["amenity"="cafe"](around:1500,<lat>,<lon>);
  way["amenity"="cafe"](around:1500,<lat>,<lon>);
);
out body; >; out skel qt;
```

---

### Foursquare Places API v3 (Venue Enrichment)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v3/places/search` | Finds the Foursquare venue ID for a named place near a coordinate |
| `GET` | `/v3/places/{fsq_id}` | Returns full details: `description`, `rating`, `price`, `photos`, `hours`, `tips`, `tel`, `website` |

**Authentication:** Bearer token passed via `Authorization` request header.

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository on GitHub.
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — keep commits focused and descriptive.
4. **Test** your changes in at least one modern browser before submitting.
5. **Open a Pull Request** against the `main` branch with a clear description of what you changed and why.

### Guidelines

- Follow the existing code style (no linter is currently configured).
- Do not commit API keys or any secrets.
- For significant changes, open an issue first to discuss the approach.
- If you add new UI elements, ensure the responsive layout still works on mobile viewports.

---

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute it for any purpose.

---

## Acknowledgements

- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) for the map tiles and POI data
- [Leaflet.js](https://leafletjs.com/) for the excellent open-source mapping library
- [Foursquare](https://developer.foursquare.com/) for the Places API used for venue enrichment
- [Nominatim](https://nominatim.org/) for free geocoding powered by OSM data
