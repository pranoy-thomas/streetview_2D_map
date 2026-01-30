# StreetView 2D Map Application

A web application that displays a 2D street view map, allows users to select locations, captures addresses into a database, and enables viewing of previously selected locations.

## Prerequisites

- Node.js (version 20 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd streetview_2D_map
```

### 2. Install dependencies

```bash
cd streetview_2D_map
npm run install-all 
```

### 3. Set up the database

The application will automatically create the SQLite database file and required tables on first run.

## Configuration

### Environment Variables

#### Server (.env file in server directory):
```
PORT=3000
NODE_ENV=development
```

#### Client (.env file in client directory):
```
VUE_APP_API_URL=/api
NODE_ENV=development
```

## Running the Application
```bash
cd streetview_2D_map
npm run dev
```

3. Access the application at `http://localhost:8080`

## API Endpoints

- `GET /api/locations` - Retrieve all saved locations
- `GET /api/locations/recent` - Retrieve recent locations (with optional limit)
- `GET /api/locations/:id` - Retrieve a specific location
- `POST /api/locations` - Save a new location
- `DELETE /api/locations/:id` - Delete a location
- `GET /health` - Health check endpoint

## Database Schema

The application uses SQLite with the following table structure:

```sql
CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

1. **Select a location**: Click anywhere on the map to select a location
2. **View address**: The application will automatically reverse-geocode the coordinates to get an address
3. **Save location**: Click "Save Location" to store the location in the database
4. **View history**: All saved locations appear in the sidebar for review
5. **Navigate**: Click on locations in the history to center the map on them

## Project Structure

```
streetview_2D_map/
├── client/                 # Vue.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   └── App.vue
│   └── package.json
├── server/                 # Express.js backend
│   ├── app.js
│   ├── routes/
│   ├── models/
│   ├── config/
│   └── package.json
├── database/
│   └── locations.db        # SQLite database file
└── README.md
```