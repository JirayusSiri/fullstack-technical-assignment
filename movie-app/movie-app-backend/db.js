const { Client } = require('pg');
const { generateMovie, generateUser, generateWebsiteTheme, generateGenre, generateTag, generateCategory, generateMetadata } = require('./faker')


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
            name TEXT UNIQUE NOT NULL
          );
        `);

        // Users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT,
            phone_number TEXT,
            website_theme INTEGER REFERENCES website_themes(id)
          );
        `);

        // Movies table
        await client.query(`
          CREATE TABLE IF NOT EXISTS movies (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
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
            name TEXT UNIQUE NOT NULL
          );
        `);

        // Tags table
        await client.query(`
          CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
          );
        `);

        // Categories table
        await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
          );
        `);

        // Metadatas table
        await client.query(`
          CREATE TABLE IF NOT EXISTS metadatas (
            id SERIAL PRIMARY KEY,
            picture_url TEXT[],
            metadata_title TEXT,
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
        await client.query('TRUNCATE TABLE movie_genres RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE movie_tags RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE metadatas RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE movie_categories RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE user_favorite_movies RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE user_favorite_categories RESTART IDENTITY CASCADE');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback the transaction if an error occurs
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

        const movieIds = await getMovieIds();
        const userIds = await getUserIds();
        const genreIds = await getGenreIds();
        const tagIds = await getTagIds();
        const categoryIds = await getCategoryIds();
        await insertMovieGenres(movieIds, genreIds);
        await insertMovieTags(movieIds, tagIds);
        await insertMovieCategories(movieIds, categoryIds);
        await insertUserFavoriteMovie(userIds, movieIds);
        await insertUserFavoriteCategories(userIds, categoryIds);
        await insertMetadata(movieIds);

        console.log(`${numMovies} movies inserted successfully!`);
        console.log(`${numUsers} users inserted successfully!`);
        console.log(`${numGenre} genres inserted successfully!`);
        console.log(`${numTag} tags inserted successfully!`);
        console.log(`${numCategory} categories inserted successfully!`);
        console.log(`${movieIds.length} movie genres inserted successfully!`);
        console.log(`${movieIds.length} movie tags inserted successfully!`);
        console.log(`${movieIds.length} movie categories inserted successfully!`);
        console.log(`${userIds.length} user favorite movies inserted successfully!`);
        console.log(`${userIds.length} user favorite categories inserted successfully!`);
        console.log(`${movieIds.length} metadata inserted successfully!`);
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback the transaction if an error occurs
        console.error('Error inserting data:', err);
    }
}

// Function to query movie IDs from the movies table
async function getMovieIds() {
    try {
        const result = await client.query('SELECT id FROM movies');
        return result.rows.map(row => row.id);
    } catch (err) {
        console.error('Error query movies:', err);
    }
}

// Function to query user IDs from the users table
async function getUserIds() {
    try {
        const result = await client.query('SELECT id FROM users');
        return result.rows.map(row => row.id);
    } catch (err) {
        console.error('Error query users:', err);
    }
}

// Function to query genre IDs from the genres table
async function getGenreIds() {
    try {
        const result = await client.query('SELECT id FROM genres');
        return result.rows.map(row => row.id);
    } catch (err) {
        console.error('Error query genres:', err);
    }
}

// Function to query tag IDs from the tags table
async function getTagIds() {
    try {
        const result = await client.query('SELECT id FROM tags');
        return result.rows.map(row => row.id);
    } catch (err) {
        console.error('Error query tags:', err);
    }
}

// Function to query category IDs from the categories table
async function getCategoryIds() {
    try {
        const result = await client.query('SELECT id FROM categories');
        return result.rows.map(row => row.id);
    } catch (err) {
        console.error('Error query categories:', err);
    }
}

// Function to insert random movie-genre combinations into the movie_genres table
async function insertMovieGenres(movieIds, genreIds) {
    try {
        for (const movieId of movieIds) {
            const numGenres = Math.floor(Math.random() * genreIds.length) + 1; // Random number of genres for each movie
            const selectedGenres = new Set();
            while (selectedGenres.size < numGenres) {
                selectedGenres.add(genreIds[Math.floor(Math.random() * genreIds.length)]);
            }
            for (const genreId of selectedGenres) {
                await client.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)', [movieId, genreId]);
            }
        }
    } catch (err) {
        console.error('Error inserting movie-genre combinations:', err);
    }
}

// Function to insert random movie-tag combinations into the movie_tags table
async function insertMovieTags(movieIds, tagIds) {
    try {
        for (const movieId of movieIds) {
            const numTags = Math.floor(Math.random() * tagIds.length) + 1; // Random number of tags for each movie
            const selectedTags = new Set();
            while (selectedTags.size < numTags) {
                selectedTags.add(tagIds[Math.floor(Math.random() * tagIds.length)]);
            }
            for (const tagId of selectedTags) {
                await client.query('INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2)', [movieId, tagId]);
            }
        }
    } catch (err) {
        console.error('Error inserting movie-tag combinations:', err);
    }
}

// Function to insert random movie-category combinations into the movie_categories table
async function insertMovieCategories(movieIds, categoryIds) {
    try {
        for (const movieId of movieIds) {
            const numCategories = Math.floor(Math.random() * categoryIds.length) + 1; // Random number of categories for each movie
            const selectedCategories = new Set();
            while (selectedCategories.size < numCategories) {
                selectedCategories.add(categoryIds[Math.floor(Math.random() * categoryIds.length)]);
            }
            for (const categoryId of selectedCategories) {
                await client.query('INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2)', [movieId, categoryId]);
            }
        }
    } catch (err) {
        console.error('Error inserting movie-category combinations:', err);
    }
}

// Function to insert random user-movie combinations into the user_favorite_movies table
async function insertUserFavoriteMovie(userIds, movieIds) {
    try {
        for (const userId of userIds) {
            const numMovies = Math.floor(Math.random() * movieIds.length) + 1; // Random number of movies for each user
            const selectedMovies = new Set();
            while (selectedMovies.size < numMovies) {
                selectedMovies.add(movieIds[Math.floor(Math.random() * movieIds.length)]);
            }
            for (const movieId of selectedMovies) {
                await client.query('INSERT INTO user_favorite_movies (user_id, movie_id) VALUES ($1, $2)', [userId, movieId]);
            }
        }
    } catch (err) {
        console.error('Error inserting user-movie combinations:', err);
    }
}

// Function to insert random user-category combinations into the user_favorite_categories table
async function insertUserFavoriteCategories(userIds, categoryIds) {
    try {
        for (const userId of userIds) {
            const numCategories = Math.floor(Math.random() * categoryIds.length) + 1; // Random number of movies for each user
            const selectedCategories = new Set();
            while (selectedCategories.size < numCategories) {
                selectedCategories.add(categoryIds[Math.floor(Math.random() * categoryIds.length)]);
            }
            for (const categoryId of selectedCategories) {
                await client.query('INSERT INTO user_favorite_categories (user_id, category_id) VALUES ($1, $2)', [userId, categoryId]);
            }
        }
    } catch (err) {
        console.error('Error inserting user-category combinations:', err);
    }
}

// Function to insert metadata for a each movie
async function insertMetadata(movieIds) {
    try {
        for (const movieId of movieIds) {
            const metadata = generateMetadata();
            const query = 'INSERT INTO metadatas (picture_url, metadata_title, metadata_description, movie_id) VALUES ($1, $2, $3, $4)';
            const values = [metadata.picture_url, metadata.metadata_title, metadata.metadata_description, movieId];
            await client.query(query, values);
        }
    } catch (err) {
        console.error('Error inserting metadata:', err);
    }
}

module.exports = { client, connectToDatabase, createTables, insertData };
