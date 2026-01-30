<template>
  <div class="address-capture">
    <h3>Capture Location</h3>
    
    <div v-if="selectedLocation" class="selected-location">
      <div class="location-details">
        <p><strong>Coordinates:</strong></p>
        <p>{{ selectedLocation.latitude.toFixed(6) }}, {{ selectedLocation.longitude.toFixed(6) }}</p>
        
        <p><strong>Address:</strong></p>
        <textarea
          v-model="addressInput"
          placeholder="Enter address details..."
          :disabled="loading"
          class="address-input"
        ></textarea>
      </div>
      
      <div class="capture-actions">
        <button 
          @click="saveLocation" 
          :disabled="loading || !addressInput.trim()"
          class="btn-save"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Save Location</span>
        </button>
        
        <button 
          @click="clearSelection" 
          :disabled="loading"
          class="btn-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <div v-else class="no-selection">
      <p>Select a location on the map to capture its address</p>
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
  name: 'AddressCapture',
  data() {
    return {
      addressInput: '',
      successMessage: ''
    };
  },
  computed: {
    ...mapState(['selectedLocation', 'loading', 'error'])
  },
  watch: {
    selectedLocation: {
      immediate: true,
      handler(newLocation) {
        if (newLocation) {
          this.addressInput = newLocation.address || '';
        } else {
          this.addressInput = '';
          this.successMessage = '';
        }
      }
    }
  },
  methods: {
    ...mapActions(['addLocation', 'clearSelectedLocation']),
    
    async saveLocation() {
      if (!this.addressInput.trim()) {
        this.successMessage = '';
        return;
      }
      
      try {
        const locationData = {
          latitude: this.selectedLocation.latitude,
          longitude: this.selectedLocation.longitude,
          address: this.addressInput.trim()
        };
        
        await this.addLocation(locationData);
        this.successMessage = 'Location saved successfully!';
        
        // Clear the form after successful save
        setTimeout(() => {
          this.clearSelection();
        }, 2000);
        
      } catch (error) {
        console.error('Error saving location:', error);
        this.successMessage = '';
      }
    },
    
    clearSelection() {
      this.clearSelectedLocation();
      this.addressInput = '';
      this.successMessage = '';
    }
  }
};
</script>

<style scoped>
.address-capture {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: fit-content;
}

.address-capture h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.selected-location {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-details p:first-child {
  margin-bottom: 0.25rem;
  font-weight: bold;
  color: #34495e;
}

.address-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  font-size: 0.9rem;
}

.address-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.capture-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-save {
  flex: 1;
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #219653;
}

.btn-save:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #7f8c8d;
}

.no-selection {
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
}

.no-selection p {
  margin: 0;
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
  .address-capture {
    padding: 1rem;
  }
  
  .capture-actions {
    flex-direction: column;
  }
  
  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
</style>