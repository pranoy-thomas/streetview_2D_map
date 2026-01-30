import { createStore } from 'vuex';
import axios from 'axios';

// Base URL for API calls (adjust based on your setup)
const API_BASE_URL = process.env.VUE_APP_API_URL || '/api';

export default createStore({
  state: {
    locations: [],
    selectedLocation: null,
    loading: false,
    error: null,
    mapCenter: [-33.8688, 151.2093], // Sydney coordinates as default
    mapZoom: 13,
    isMapReady: false
  },

  mutations: {
    SET_LOCATIONS(state, locations) {
      state.locations = locations;
    },

    ADD_LOCATION(state, location) {
      state.locations.unshift(location); // Add to beginning of array
    },

    REMOVE_LOCATION(state, locationId) {
      state.locations = state.locations.filter(loc => loc.id !== locationId);
    },

    SET_SELECTED_LOCATION(state, location) {
      state.selectedLocation = location;
    },

    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },

    SET_ERROR(state, error) {
      state.error = error;
    },

    SET_MAP_CENTER(state, center) {
      state.mapCenter = center;
    },

    SET_MAP_ZOOM(state, zoom) {
      state.mapZoom = zoom;
    },

    SET_MAP_READY(state, isReady) {
      state.isMapReady = isReady;
    },

    CLEAR_ERROR(state) {
      state.error = null;
    }
  },

  actions: {
    // Fetch all locations from API
    async fetchLocations({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await axios.get(`${API_BASE_URL}/locations`);
        commit('SET_LOCATIONS', response.data.data);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Add a new location
    async addLocation({ commit }, locationData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await axios.post(`${API_BASE_URL}/locations`, locationData);
        commit('ADD_LOCATION', response.data.data);
        commit('SET_SELECTED_LOCATION', response.data.data);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Delete a location
    async deleteLocation({ commit }, locationId) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        await axios.delete(`${API_BASE_URL}/locations/${locationId}`);
        commit('REMOVE_LOCATION', locationId);
        return { success: true, message: 'Location deleted successfully' };
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Select a location
    selectLocation({ commit }, location) {
      commit('SET_SELECTED_LOCATION', location);
    },

    // Clear selected location
    clearSelectedLocation({ commit }) {
      commit('SET_SELECTED_LOCATION', null);
    },

    // Set map center
    setMapCenter({ commit }, center) {
      commit('SET_MAP_CENTER', center);
    },

    // Set map zoom
    setMapZoom({ commit }, zoom) {
      commit('SET_MAP_ZOOM', zoom);
    },

    // Mark map as ready
    setMapReady({ commit }) {
      commit('SET_MAP_READY', true);
    }
  },

  getters: {
    allLocations: state => state.locations,
    selectedLocation: state => state.selectedLocation,
    loading: state => state.loading,
    error: state => state.error,
    mapCenter: state => state.mapCenter,
    mapZoom: state => state.mapZoom,
    isMapReady: state => state.isMapReady,
    locationCount: state => state.locations.length,
    recentLocations: state => state.locations.slice(0, 10), // Get last 10 locations
    getLocationById: (state) => (id) => {
      return state.locations.find(location => location.id === id);
    }
  }
});