const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// GET /api/locations - Retrieve all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.getAll();
    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations',
      message: error.message
    });
  }
});

// GET /api/locations/recent - Retrieve recent locations (with optional limit)
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const locations = await Location.getRecent(limit);
    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching recent locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent locations',
      message: error.message
    });
  }
});

// GET /api/locations/:id - Retrieve a specific location
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const location = await Location.getById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location',
      message: error.message
    });
  }
});

// POST /api/locations - Create a new location
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    // Validate input data
    const validation = Location.validate({ latitude, longitude, address });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    const newLocation = await Location.create({
      latitude,
      longitude,
      address
    });

    //console.log('newLocation: ',newLocation)

    res.status(201).json({
      success: true,
      data: newLocation,
      message: 'Location saved successfully'
    });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save location',
      message: error.message
    });
  }
});

// DELETE /api/locations/:id - Delete a location
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const deleted = await Location.deleteById(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location',
      message: error.message
    });
  }
});

// Health check for locations route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Locations API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;