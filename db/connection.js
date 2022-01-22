const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_KEY,
    database: process.env.DB_DATABASE
  },
  console.log('Connected to the database.')
);

module.exports = db;