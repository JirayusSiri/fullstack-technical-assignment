const { Client } = require('pg');
const { generateMovie, generateUser, generateWebsiteTheme, generateGenre, generateTag, generateCategory } = require('./faker')


// const client = new Client({
//     user: 'your_username',
//     host: 'your_host',
//     database: 'your_database',
//     password: 'your_password',
//     port: 'your_port',
// });

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'movies_app',
    password: 'password',
    port: '5432',
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
}

async function createTables() {
    try {
        // Themes table
        await client.query(`
          CREATE TABLE IF NOT EXISTS website_themes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
          );
        `);

        // Users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            phone_number VARCHAR(20),
            website_theme INTEGER REFERENCES website_themes(id)
          );
        `);

        // Movies table
        await client.query(`
          CREATE TABLE IF NOT EXISTS movies (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            length INTEGER,
            date_released DATE,
            date_available_until DATE
          );
        `);

        // Genres table
        await client.query(`
          CREATE TABLE IF NOT EXISTS genres (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
          );
        `);

        // Tags table
        await client.query(`
          CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
          );
        `);

        // Categories table
        await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
          );
        `);

        // Metadatas table
        await client.query(`
          CREATE TABLE IF NOT EXISTS metadatas (
            id SERIAL PRIMARY KEY,
            picture_url TEXT[],
            metadata_title VARCHAR(255),
            metadata_description TEXT,
            movie_id INTEGER REFERENCES movies(id) NOT NULL
          );
        `);

        // MovieGenres table (many-to-many relationship)
        await client.query(`
          CREATE TABLE IF NOT EXISTS movie_genres (
            movie_id INTEGER REFERENCES movies(id) NOT NULL,
            genre_id INTEGER REFERENCES genres(id) NOT NULL,
            PRIMARY KEY (movie_id, genre_id)
          );
        `);

        // MovieTags table (many-to-many relationship)
        await client.query(`
          CREATE TABLE IF NOT EXISTS movie_tags (
            movie_id INTEGER REFERENCES movies(id) NOT NULL,
            tag_id INTEGER REFERENCES tags(id) NOT NULL,
            PRIMARY KEY (movie_id, tag_id)
          );
        `);

        // MovieCategories table (many-to-many relationship)
        await client.query(`
          CREATE TABLE IF NOT EXISTS movie_categories (
            movie_id INTEGER REFERENCES movies(id) NOT NULL,
            category_id INTEGER REFERENCES categories(id) NOT NULL,
            PRIMARY KEY (movie_id, category_id)
          );
        `);

        // UserFavoriteMovies table (many-to-many relationship)
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_favorite_movies (
            user_id INTEGER REFERENCES users(id) NOT NULL,
            movie_id INTEGER REFERENCES movies(id) NOT NULL,
            PRIMARY KEY (user_id, movie_id)
          );
        `);

        // UserFavoriteCategories table (many-to-many relationship)
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_favorite_categories (
            user_id INTEGER REFERENCES users(id) NOT NULL,
            category_id INTEGER REFERENCES categories(id) NOT NULL,
            PRIMARY KEY (user_id, category_id)
          );
        `);

        console.log('Tables created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

async function truncateTables() {
    try {
        await client.query('TRUNCATE TABLE website_themes RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE movies RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE genres RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE tags RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
    } catch (err) {
        console.error('Error trucate tables:', err);
    }
}

// Function to insert fake data into the database
async function insertData(numMovies, numUsers, numThemes, numGenre, numTag, numCategory) {
    try {
        truncateTables();

        for (let i = 0; i < numMovies; i++) {
            const movie = generateMovie();
            const query = 'INSERT INTO movies (title, description, length, date_released, date_available_until) VALUES ($1, $2, $3, $4, $5)';
            const values = [movie.title, movie.description, movie.length, movie.dateReleased, movie.dateAvailableUntil];
            await client.query(query, values);
        }

        for (let i = 0; i < numUsers; i++) {
            const user = generateUser();
            const query = 'INSERT INTO users (username, email, password, phone_number) VALUES ($1, $2, $3, $4)';
            const values = [user.username, user.email, user.password, user.phoneNumber];
            await client.query(query, values);
        }

        for (let i = 0; i < numThemes; i++) {
            const theme = generateWebsiteTheme();
            const query = 'INSERT INTO website_themes (name) VALUES ($1)';
            const values = [theme.name];
            await client.query(query, values);
        }

        for (let i = 0; i < numGenre; i++) {
            const genre = generateGenre();
            const query = 'INSERT INTO genres (name) VALUES ($1)';
            const values = [genre.name];
            await client.query(query, values);
        }

        for (let i = 0; i < numTag; i++) {
            const tag = generateTag();
            const query = 'INSERT INTO tags (name) VALUES ($1)';
            const values = [tag.name];
            await client.query(query, values);
        }

        for (let i = 0; i < numCategory; i++) {
            const category = generateCategory();
            const query = 'INSERT INTO categories (name) VALUES ($1)';
            const values = [category.name];
            await client.query(query, values);
        }

        console.log(`${numMovies} movies inserted successfully!`);
        console.log(`${numUsers} users inserted successfully!`);
        console.log(`${numGenre} genres inserted successfully!`);
        console.log(`${numTag} tags inserted successfully!`);
        console.log(`${numCategory} categories inserted successfully!`);
    } catch (err) {
        console.error('Error inserting data:', err);
    }
}

module.exports = { client, connectToDatabase, createTables, insertData };
