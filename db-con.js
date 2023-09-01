import mysql from 'mysql2/promise';

// Create a function that establishes a database connection
const getConnection = async () => {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Godude1006',
    });

    return connection;
};

// Export the getConnection function
export default getConnection;