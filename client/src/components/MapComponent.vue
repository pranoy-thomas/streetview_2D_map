<template>
  <div class="map-container">
    <div ref="map" class="map"></div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    
    <!-- Loading indicator for reverse geocoding -->
    <div v-if="reverseGeocodingLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="error-overlay">
      <div class="error-message">{{ error }}</div>
    </div>
    
    
    <!-- Selected location info -->
    <div v-if="selectedLocation" class="location-info-overlay">
      <div class="location-info">
        <h4>Selected Location</h4>
        <p><strong>Coordinates:</strong> {{ selectedLocation.latitude.toFixed(6) }}, {{ selectedLocation.longitude.toFixed(6) }}</p>
        <p><strong>Address:</strong> {{ selectedLocation.address }}</p>
        <button @click="clearSelection" class="btn-clear">Clear Selection</button>
      </div>
    </div>
    
    <!-- Map controls -->
    <div class="map-controls">
      <!-- <button @click="centerOnDefault" class="btn-control">Reset View</button> -->
      <button @click="refreshLocations" class="btn-control">Refresh Locations</button>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS
import { mapState, mapActions } from 'vuex';
import { toRaw } from 'vue';

// Fix for Leaflet default icons in Vue - properly handle Webpack asset loading
delete L.Icon.Default.prototype._getIconUrl;

// Most reliable approach: Use CDN URLs for the icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

// Define the default icon options globally
const defaultIconOptions = {
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
};

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      rawMap: null, // Store raw map reference
      markers: {},
      selectedLocationMarker: null, // Track the currently selected location marker
      reverseGeocodingLoading: false,
      isDestroying: false,
      reverseGeocodeUrl: 'https://nominatim.openstreetmap.org/reverse'
    };
  },
  computed: {
    ...mapState(['loading', 'error', 'mapCenter', 'mapZoom', 'isMapReady', 'selectedLocation', 'locations'])
  },
  methods: {
    ...mapActions([
      'setMapReady', 
      'selectLocation', 
      'clearSelectedLocation', 
      'setMapCenter', 
      'setMapZoom', 
      'fetchLocations'
    ]),
    
    async initMap() {
      try {
        // Double-check that the map element exists
        if (!this.$refs.map) {
          console.error('Map element not found in DOM');
          return;
        }
        
        // Create map instance with Sydney as default location
        this.map = L.map(this.$refs.map, {
          zoomAnimation: false, // Disable zoom animations to prevent the error
          fadeAnimation: false  // Disable fade animations
        }).setView(this.mapCenter, this.mapZoom);
        
        // Store raw map reference to avoid proxy issues
        this.rawMap = toRaw(this.map);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(this.rawMap);
        
        // Add click event listener to map
        this.rawMap.on('click', this.handleMapClick);
        
        // Add zoom event listener to update map state when zoom changes
        this.rawMap.on('zoomend', this.onZoomEnd);
        
        // Add existing location markers
        this.addExistingLocationMarkers();
        
        // Update map state
        this.setMapReady();
        
        // Add location marker for any pre-existing selected location after map is ready
        this.$nextTick(() => {
          setTimeout(() => {
            this.addLocationMarker();
          }, 0);
        });
        
        // Watch for location changes
        this.$watch(
          () => this.locations,
          () => {
            this.updateLocationMarkers();
          },
          { deep: true }
        );
        
        // Watch for selected location changes to update the marker
        this.$watch(
          () => this.selectedLocation,
          () => {
            // Add marker after a brief delay to ensure map is ready
            this.$nextTick(() => {
              setTimeout(() => {
                this.addLocationMarker();
              }, 0);
            });
          },
          { immediate: true }
        );
        
      } catch (error) {
        console.error('Error initializing map:', error);
        this.clearSelectedLocation();
      }
    },
    
    destroyMap() {
      if (this.rawMap) {
        // Remove all event listeners
        this.rawMap.off('click', this.handleMapClick);
        this.rawMap.off('zoomend', this.onZoomEnd);
        
        // Stop any ongoing animations
        this.rawMap.stop();
        
        // Remove the map instance safely
        this.rawMap.remove();
        
        // Nullify the map reference
        this.map = null;
        this.rawMap = null;
      }
    },
    
    onZoomEnd() {
      // This method is called when zoom ends
      // Check if component is being destroyed or map still exists after zoom completes
      if (this.isDestroying || !this.rawMap || !this.rawMap.getContainer()) {
        return;
      }
      
      // Update map state after zoom
      if (this.rawMap) {
        const center = this.rawMap.getCenter();
        const zoom = this.rawMap.getZoom();
        this.setMapCenter([center.lat, center.lng]);
        this.setMapZoom(zoom);
      }
    },
    
    async handleMapClick(e) {
      // Check if map exists and component is not being destroyed before accessing it
      if (!this.rawMap || this.isDestroying || !this.rawMap.getContainer()) return;
      
      const { lat, lng } = e.latlng;
      
      // Set loading state to show spinner
      this.reverseGeocodingLoading = true;
      
      try {
        // Perform reverse geocoding to get address
        const address = await this.reverseGeocode(lat, lng);
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: address,
          temporary: true // Mark as temporary until user confirms
        };
        
        this.selectLocation(locationData);
        // Ensure map still exists and component is not being destroyed before adding marker
        if (this.rawMap && !this.isDestroying && this.rawMap.getContainer()) {
          this.addLocationMarker();
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        
        // Provide fallback address
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: `(${lat.toFixed(6)}, ${lng.toFixed(6)})`,
          temporary: true
        };
        
        this.selectLocation(locationData);
        // Ensure map still exists and component is not being destroyed before adding marker
        if (this.rawMap && !this.isDestroying && this.rawMap.getContainer()) {
          this.addLocationMarker();
        }
      } finally {
        // Hide loading spinner regardless of success or failure
        this.reverseGeocodingLoading = false;
      }
    },
    
    async reverseGeocode(lat, lng) {
      try {
        const response = await fetch(
          `${this.reverseGeocodeUrl}?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          return data.display_name;
        }
        
        throw new Error('No address found');
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        throw error;
      }
    },
    
    addLocationMarker() {
      // Check if map exists and component is not being destroyed before accessing it
      if (!this.rawMap || this.isDestroying || !this.rawMap.getContainer()) {
        return;
      }
      
      // Remove existing selected location marker
      if (this.selectedLocationMarker) {
        try {
          if (this.rawMap.hasLayer(this.selectedLocationMarker)) {
            this.rawMap.removeLayer(this.selectedLocationMarker);
          }
        } catch (e) {
          console.warn('Error removing selected location marker:', e);
        }
        this.selectedLocationMarker = null;
      }
      
      // Add marker for selected location
      if (this.selectedLocation) {
        try {
          // Create a custom icon to ensure it displays properly
          const customIcon = L.icon(defaultIconOptions);
          
          const marker = L.marker([this.selectedLocation.latitude, this.selectedLocation.longitude], {icon: customIcon})
            .addTo(this.rawMap)
            .bindPopup(`<b>Selected Location</b><br>${this.selectedLocation.address}`)
            .openPopup();
          
          this.selectedLocationMarker = marker;
          
          // Check if map still exists and component is not being destroyed before setting view
          if (this.rawMap && !this.isDestroying && this.rawMap.getContainer()) {
            this.rawMap.setView([this.selectedLocation.latitude, this.selectedLocation.longitude], 15);
          }
        } catch (e) {
          console.error('Error adding selected location marker:', e);
        }
      }
    },
    
    addExistingLocationMarkers() {
      // Check if map exists and component is not being destroyed before accessing it
      if (!this.rawMap || this.isDestroying || !this.rawMap.getContainer()) return;
      
      // Remove existing permanent markers
      Object.keys(this.markers).forEach(key => {
        if (key !== 'temporary' && this.markers[key]) {
          try {
            if (this.rawMap.hasLayer(this.markers[key])) {
              this.rawMap.removeLayer(this.markers[key]);
            }
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      
      // Clear markers object except for temporary marker
      const tempMarker = this.markers.temporary;
      this.markers = {};
      if (tempMarker) {
        this.markers.temporary = tempMarker;
      }
      
      // Add markers for all existing locations
      this.locations.forEach(location => {
        if (location.id && !this.markers[`location_${location.id}`]) {
          try {
            // Create a custom icon to ensure it displays properly
            const customIcon = L.icon(defaultIconOptions);
            
            const marker = L.marker([location.latitude, location.longitude], {icon: customIcon})
              .addTo(this.rawMap)
              .bindPopup(`<b>Saved Location</b><br>${location.address}<br><small>ID: ${location.id}</small>`)
              .on('click', () => {
                this.selectLocation(location);
              });
            
            this.markers[`location_${location.id}`] = marker;
          } catch (e) {
            console.warn('Error adding location marker:', e);
          }
        }
      });
    },
    
    updateLocationMarkers() {
      this.addExistingLocationMarkers();
    },
    
    centerOnDefault() {
      // Check if map exists and component is not being destroyed before accessing it
      if (!this.rawMap || this.isDestroying || !this.rawMap.getContainer()) return;
      this.rawMap.setView(this.mapCenter, this.mapZoom);
    },
    
    refreshLocations() {
      this.fetchLocations().catch(error => {
        console.error('Failed to refresh locations:', error);
      });
    },
    
    clearSelection() {
      this.clearSelectedLocation();
      
      // Check if map exists and component is not being destroyed before accessing it
      if (!this.rawMap || this.isDestroying || !this.rawMap.getContainer()) return;
      
      // Remove selected location marker
      if (this.selectedLocationMarker) {
        try {
          if (this.rawMap.hasLayer(this.selectedLocationMarker)) {
            this.rawMap.removeLayer(this.selectedLocationMarker);
          }
        } catch (e) {
          console.warn('Error removing selected location marker:', e);
        }
        this.selectedLocationMarker = null;
      }
    }
  },
  
  mounted() {
    // Ensure the map element exists before initializing
    if (this.$refs.map) {
      this.initMap();
    } else {
      console.error('Map element not found in DOM');
    }
  },
  
  beforeUnmount() {
    // Set flag to indicate component is being destroyed
    this.isDestroying = true;
    
    // No zoom timeouts to clear anymore since we removed zoom animations
    
    // Ensure rawMap exists before attempting to destroy it
    if (this.rawMap) {
      try {
        // Stop any ongoing animations immediately
        this.rawMap.stop();
        
        // Since we disabled zoom animations, no need to cancel them
        
        // Remove all event listeners after stopping animations
        this.rawMap.off('click', this.handleMapClick);
        this.rawMap.off('zoomend', this.onZoomEnd);
        
        // Remove all layers to clean up properly
        this.rawMap.eachLayer((layer) => {
          this.rawMap.removeLayer(layer);
        });
        
        // Clean up our tracked markers
        if (this.selectedLocationMarker) {
          try {
            if (this.rawMap.hasLayer(this.selectedLocationMarker)) {
              this.rawMap.removeLayer(this.selectedLocationMarker);
            }
          } catch (e) {
            console.warn('Error removing selected location marker during cleanup:', e);
          }
          this.selectedLocationMarker = null;
        }
        
        // Check if map container still exists before removal
        const mapContainer = this.rawMap.getContainer();
        if (mapContainer && mapContainer.parentNode) {
          // Remove the map instance safely
          this.rawMap.remove();
        }
      } catch (error) {
        console.warn('Error during map cleanup:', error);
      } finally {
        // Always nullify references
        this.map = null;
        this.rawMap = null;
      }
    }
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  z-index: 1000;
  max-width: 300px;
}

.location-info-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
  max-width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.location-info h4 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.location-info p {
  margin-bottom: 8px;
  font-size: 0.9rem;
  word-break: break-word;
}

.btn-clear {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 10px;
}

.btn-clear:hover {
  background: #c0392b;
}

.map-controls {
  position: absolute;
  top: 10px; /* Align with the top of the zoom controls */
  left: 50px; /* Move to the right to align horizontally with zoom controls */
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.btn-control {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-control:hover {
  background: rgba(245, 245, 255, 0.9);
}

/* Handle Leaflet icon issue */
.leaflet-pane img {
  max-width: none !important;
}

.leaflet-marker-icon {
  z-index: 500 !important;
}

/* Make sure markers are visible */
.leaflet-marker-pane {
  z-index: 400 !important;
}

.leaflet-tile-container,
.leaflet-overlay-pane,
.leaflet-shadow-pane,
.leaflet-marker-pane,
.leaflet-tooltip-pane,
.leaflet-popup-pane {
  z-index: auto !important;
}

/* Ensure proper spacing for Leaflet controls */
.leaflet-control-zoom {
  margin: 10px;
}
</style>