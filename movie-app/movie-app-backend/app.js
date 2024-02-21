const { client, connectToDatabase, createTables, insertData } = require('./db');

async function startApp() {
    await connectToDatabase(); // Connect to the database
    await createTables(); // Create tables into database
    await insertData(5, 3, 3, 4, 2, 5); // Insert data into the database
    await client.end(); // Close the database connection
}

startApp();
