const { client, connectToDatabase, createTables, insertData } = require('./db');
const express = require('express');
const app = express();

async function startApp() {
    await connectToDatabase(); // Connect to the database
    await createTables(); // Create tables into database
    await insertData(3, 3); // Insert data into the database
    // await client.end(); // Close the database connection
}

// API endpoint to get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM movies');
        const movies = result.rows.map(row => row.title);
        res.json({ movies });
    } catch (error) {
        console.error('Error querying database', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get all movies by category
app.get('/api/movies/category/:categoryName', async (req, res) => {
    const categoryName = req.params.categoryName;

    try {
        const result = await client.query(`
            SELECT m.title
            FROM movies m
            JOIN movie_categories mc ON m.id = mc.movie_id
            JOIN categories c ON mc.category_id = c.id
            WHERE c.name = $1
        `, [categoryName]);

        const movies = result.rows.map(row => row.title);
        res.json({ movies, categoryName });
    } catch (error) {
        console.error('Error fetching movies by category', error);
        res.status(500).json({ error: error });
    }
});

// API endpoint to get all movies by tag
app.get('/api/movies/tag/:tagName', async (req, res) => {
    const tagName = req.params.tagName;

    try {
        const result = await client.query(`
            SELECT m.title
            FROM movies m
            JOIN movie_tags mt ON m.id = mt.movie_id
            JOIN tags t ON mt.tag_id = t.id
            WHERE t.name = $1
        `, [tagName]);

        const movies = result.rows.map(row => row.title);
        res.json({ movies, tagName });
    } catch (error) {
        console.error('Error fetching movies by category', error);
        res.status(500).json({ error: error });
    }
});

// Serve the default first page
app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Welcome to my movie app APIs!</title>
        </head>
        <body>
          <h1>Welcome to my movie app APIs!</h1>
          <p>This is a simple movie app APIs.</p>
          <p><a href="/movies">View Movies</a></p>
        </body>
      </html>
    `);
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

startApp();
