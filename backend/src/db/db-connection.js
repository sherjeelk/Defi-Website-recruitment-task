const dotenv = require('dotenv');
dotenv.config();
const mysql2 = require('mysql2');

class DBConnection {
    constructor() {
        this.db = mysql2.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        this.checkConnection();
    }

    checkConnection() {
        this.db.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err.message);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.');
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.');
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.');
                }
                return;
            }
            if (connection) {
                console.log('Database connection successful.');
                connection.release();
            }
        });
    }

    query = async (sql, values) => {
        console.log('Executing query:', sql, 'with values:', values);

        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    console.error('Query execution error:', error.message);
                    reject(error);
                    return;
                }
                console.log('Query result:', result);
                resolve(result);
            }
            // Execute the query
            this.db.execute(sql, values, callback);
        }).catch(err => {
            console.error('Promise rejection error:', err.message);
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            // Convert MySQL errors to HTTP status codes
            err.status = mysqlErrorList.includes(err.code) ? HttpStatusCodes[err.code] : err.status;

            throw err;
        });
    }
}

// Enum for HTTP status codes
const HttpStatusCodes = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409
});

module.exports = new DBConnection().query;
