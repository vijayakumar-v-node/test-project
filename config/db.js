const mysql = require('mysql2/promise');

const sqlConnection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test_project',
    connectionLimit: 10,
});

module.exports = sqlConnection;