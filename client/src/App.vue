<template>
  <div id="app">
    <header class="app-header">
      <h1>StreetView 2D Map</h1>
      <p>Select locations on the map and save their addresses</p>
    </header>
    
    <main class="app-main">
      <div class="app-container">
        <div class="map-section">
          <MapComponent />
        </div>
        
        <div class="sidebar">
          <AddressCapture />
          <LocationHistory />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import MapComponent from './components/MapComponent.vue';
import AddressCapture from './components/AddressCapture.vue';
import LocationHistory from './components/LocationHistory.vue';

export default {
  name: 'App',
  components: {
    MapComponent,
    AddressCapture,
    LocationHistory
  },
  mounted() {
    // Fetch existing locations when app loads
    this.$store.dispatch('fetchLocations').catch(error => {
      console.error('Failed to fetch locations:', error);
    });
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.app-header p {
  opacity: 0.8;
  font-size: 1rem;
}

.app-main {
  flex: 1;
  padding: 1rem;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  height: calc(100vh - 120px);
}

.map-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .app-container {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.4rem;
  }
}
</style>