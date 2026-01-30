const db = require('../config/database');
const { promisify } = require('util');

// Helper function to promisify database run operations (which use 'this' context)
function runAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper functions to promisify database all and get operations
const allAsync = promisify(db.all).bind(db);
const getAsync = promisify(db.get).bind(db);

class Location {
  constructor(latitude, longitude, address) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
  }

  // Create a new location
  static async create(locationData) {
    const { latitude, longitude, address } = locationData;
    
    if (!latitude || !longitude || !address) {
      throw new Error('Latitude, longitude, and address are required');
    }

    const query = 'INSERT INTO locations (latitude, longitude, address) VALUES (?, ?, ?)';
    //console.log('location.js 1 db.filename: ', db.filename);
    try {
      const result = await runAsync(query, [latitude, longitude, address]);
      return { id: result.lastID, ...locationData };
    } catch (err) {
      console.error('create error', err);
      throw err;
    }
  }

  // Get all locations
  static async getAll() {
    const query = 'SELECT * FROM locations ORDER BY created_at DESC';
    try {
      const rows = await allAsync(query, []);
      return rows;
    } catch (err) {
      console.error('getAll error ', err);
      throw err;
    }
  }

  // Get location by ID
  static async getById(id) {
    const query = 'SELECT * FROM locations WHERE id = ?';
    try {
      const row = await getAsync(query, [id]);
      //console.log('getById success', row);
      return row;
    } catch (err) {
      console.error('getById error ', err);
      throw err;
    }
  }

  // Delete location by ID
  static async deleteById(id) {
    const query = 'DELETE FROM locations WHERE id = ?';
    try {
      const result = await runAsync(query, [id]);
      const success = result.changes > 0;
      //console.log('deleteById success', success);
      return success;
    } catch (err) {
      console.error('deleteById error ', err);
      throw err;
    }
  }

  // Get recent locations (limit by count)
  static async getRecent(limit = 10) {
    const query = 'SELECT * FROM locations ORDER BY created_at DESC LIMIT ?';
    try {
      const rows = await allAsync(query, [limit]);
      console.log('getRecent success');
      return rows;
    } catch (err) {
      console.error('getRecent error ', err);
      throw err;
    }
  }

  // Validate location data
  static validate(data) {
    const errors = [];
    
    if (!data.latitude || typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
      errors.push('Invalid latitude (must be between -90 and 90)');
    }
    
    if (!data.longitude || typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
      errors.push('Invalid longitude (must be between -180 and 180)');
    }
    
    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
      errors.push('Address is required and must be a non-empty string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Location;