import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Vue
import L from 'leaflet';

// Import the images
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Define the default icon to fix the missing marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Create Vue app instance
const app = createApp(App);

// Use Vuex store
app.use(store);

// Mount the app
app.mount('#app');

console.log('StreetView 2D Map application initialized');