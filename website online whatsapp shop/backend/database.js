const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
// The database file will be created in the backend folder
const dbPath = path.resolve(__dirname, 'shop_database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    // Create shops table
    db.run(`
        CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_name TEXT NOT NULL UNIQUE,
            whatsapp_number TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER,
            product_name TEXT NOT NULL,
            price TEXT NOT NULL,
            image_url TEXT,
            FOREIGN KEY (shop_id) REFERENCES shops (id)
        )
    `);
});

module.exports = db;
