# ☕ CoffeeCup — Coffee Shop Finder

> 📍 A location-aware web application to discover nearby cafés with interactive maps, rich details, and smart filtering.

---

## 📸 Preview

<!-- <p align="center">
  <img src="https://github.com/user-attachments/assets/2dc7f674-62b4-4c39-b772-ad2439d84db0" width="60%" height=80% />
</p> -->

<p align="center">
  <img src="https://github.com/user-attachments/assets/2dc7f674-62b4-4c39-b772-ad2439d84db0" width="50%" />
  <img src="https://github.com/user-attachments/assets/8b0e1fc7-61c3-4b46-bb15-2cb114b1df6f" width="50%" />
  <img src="https://github.com/user-attachments/assets/759dfde7-a203-41f0-aa52-9b126fc3a130" width="50%" />
</p>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Project Overview

**CoffeeCup** is a client-side web application that helps users find coffee shops anywhere in the world 🌍. Users can search by location and view results in a split layout with café cards and an interactive map.

Each café includes enriched data like ratings, photos, hours, and reviews from external APIs.

Built as a **zero-backend application**, all data is fetched directly from public APIs in the browser.

---

## ✨ Key Features

- **Location Search** — Find cafés within a 1.5 km radius  
- **Interactive Map** — Real-time map with custom markers  
- **Café Cards** — Display ratings, price, and status  
- **Rich Popups** — Photos, reviews, hours, contact info  
- **Filter & Sort** — Customize results easily  
- **Responsive Design** — Optimized for all devices  
- **Shareable URLs** — Search state stored in URL  

---

## 🛠️ Technology Stack

| Layer | Technology |
|------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Maps | Leaflet.js, OpenStreetMap |
| Geocoding | Nominatim API |
| Data | Overpass API, Foursquare API |

---


## ⚙️ Setup Instructions

### Prerequisites

- Modern browser 
- Foursquare API key  

---

### Run Locally

```bash
git clone https://github.com/pawpaw64/Coffee-Cup.git
cd Coffee-Cup/main
