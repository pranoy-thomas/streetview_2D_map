const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//console.log('process.env.DB_PATH: ', process.env.DB_PATH);
//console.log('__dirname: ', __dirname);

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../database');
console.log('dbDir: ', dbDir);
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
//const DB_PATH = process.env.DB_PATH || path.join(dbDir, 'locationaddress.db');
const DB_PATH = path.join(dbDir, 'locationaddress.db');
//console.log('process.env.DB_PATH: ', process.env.DB_PATH);
//console.log('Database path: ', DB_PATH);

// Create database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    //console.log('Connected to SQLite database at:', DB_PATH);
    //console.log('database.js db.filename: ', db.filename);
    // Create locations table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Locations table ready');
      }
    });
  }
});

module.exports = db;