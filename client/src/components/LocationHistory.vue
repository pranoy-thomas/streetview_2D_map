<template>
  <div class="location-history">
    <div class="history-header">
      <h3>Previously Selected Locations</h3>
      <div class="history-stats">
        <span>Total: {{ locations.length }}</span>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <p>Loading locations...</p>
    </div>
    
    <div v-else-if="locations.length === 0" class="no-locations">
      <p>No locations saved yet.</p>
      <p>Select locations on the map to see them here.</p>
    </div>
    
    <div v-else class="locations-list">
      <div 
        v-for="location in locations" 
        :key="location.id"
        class="location-item"
        :class="{ 'selected-location': isSelected(location) }"
      >
        <div class="location-content" @click="viewLocation(location)">
          <div class="location-coords">
            <span class="coords">{{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}</span>
          </div>
          <div class="location-address">
            <p class="address">{{ location.address }}</p>
            <small class="timestamp">{{ formatDate(location.created_at) }}</small>
          </div>
        </div>
        
        <div class="location-actions">
          <!-- <button 
            @click.stop="selectForEditing(location)"
            class="btn-edit"
            title="Edit location"
          >
            ✏️
          </button> -->
          <button 
            @click.stop="deleteLocation(location.id)"
            class="btn-delete"
            title="Delete location"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit modal -->
    <div v-if="editingLocation" class="modal-overlay">
      <div class="edit-modal">
        <h4>Edit Location</h4>
        
        <div class="edit-form">
          <label>Address:</label>
          <textarea 
            v-model="editAddress" 
            class="edit-address-input"
            placeholder="Enter address details..."
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="saveEditedLocation" class="btn-save">Save</button>
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Success/Error messages -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'LocationHistory',
  data() {
    return {
      editingLocation: null,
      editAddress: '',
      successMessage: ''
    };
  },
  computed: {
    ...mapState(['locations', 'loading', 'error', 'selectedLocation'])
  },
  methods: {
    ...mapActions(['deleteLocation', 'selectLocation', 'setMapCenter', 'setMapZoom', 'fetchLocations']),
    
    isSelected(location) {
      return this.selectedLocation && this.selectedLocation.id === location.id;
    },
    
    viewLocation(location) {
      this.selectLocation(location);
      this.setMapCenter([location.latitude, location.longitude]);
      this.setMapZoom(15);
    },
    
    selectForEditing(location) {
      this.editingLocation = location;
      this.editAddress = location.address;
    },
    
    async saveEditedLocation() {
      // In a real application, you would have an update endpoint
      // For now, we'll just show a message and refresh the list
      this.successMessage = 'Location updated successfully!';
      this.editingLocation = null;
      this.editAddress = '';
      
      // Refresh the locations list
      await this.fetchLocations();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    
    cancelEdit() {
      this.editingLocation = null;
      this.editAddress = '';
    },
    
    async deleteLocation(id) {
      if (confirm('Are you sure you want to delete this location?')) {
        try {
          await this.$store.dispatch('deleteLocation', id);
          this.successMessage = 'Location deleted successfully!';
          
          // Clear selection if the deleted location was selected
          if (this.selectedLocation && this.selectedLocation.id === id) {
            this.selectLocation(null);
          }
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Just now';
      
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.location-history {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: fit-content;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.history-header h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin: 0;
}

.history-stats {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.no-locations {
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
}

.no-locations p:last-child {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.locations-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.location-item:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.location-item.selected-location {
  border-color: #3498db;
  background-color: #e3f2fd;
}

.location-content {
  flex: 1;
  display: flex;
  gap: 0.75rem;
}

.location-coords {
  flex-shrink: 0;
}

.coords {
  font-family: monospace;
  font-size: 0.8rem;
  color: #7f8c8d;
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.location-address {
  flex: 1;
}

.address {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
}

.timestamp {
  color: #95a5a6;
  font-size: 0.8rem;
}

.location-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: 1px solid #ddd;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #f0f0f0;
  border-color: #3498db;
}

.btn-delete:hover {
  background: #fff5f5;
  border-color: #e74c3c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.edit-form {
  margin: 1rem 0;
}

.edit-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.edit-address-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: 0.9rem;
}

.edit-address-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-save, .btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover {
  background: #219653;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  font-size: 0.9rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .location-history {
    padding: 1rem;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .location-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .location-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .location-actions {
    align-self: flex-end;
  }
}
</style>