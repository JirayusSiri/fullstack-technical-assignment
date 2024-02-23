const { Client } = require('pg');
const fs = require('fs');
const { generateMovie, generateUser, generateWebsiteTheme, generateGenre, generateTag, generateCategory, generateMetadata } = require('./faker')

const configPath = './config.json';
const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);

const client = new Client({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
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
            website_theme_id INTEGER REFERENCES website_themes(id)
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
    } catch (error) {
        console.error('Error creating tables:', error);
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
    } catch (error) {
        console.error('Error truncate tables:', error);
    }
}

async function dropTables() {
    try {
        await client.query('DROP TABLE IF EXISTS user_favorite_movies');
        await client.query('DROP TABLE IF EXISTS user_favorite_categories');
        await client.query('DROP TABLE IF EXISTS users');
        await client.query('DROP TABLE IF EXISTS website_themes');
        await client.query('DROP TABLE IF EXISTS movie_genres');
        await client.query('DROP TABLE IF EXISTS movie_tags');
        await client.query('DROP TABLE IF EXISTS movie_categories');
        await client.query('DROP TABLE IF EXISTS metadatas');
        await client.query('DROP TABLE IF EXISTS movies');
        await client.query('DROP TABLE IF EXISTS genres');
        await client.query('DROP TABLE IF EXISTS tags');
        await client.query('DROP TABLE IF EXISTS categories');
    } catch (error) {
        console.error('Error dropping table:', error);
    }
}

// Function to insert fake data into the database
async function insertData(numUsers, numThemes) {
    try {
        // truncateTables();

        for (const movie of config.movies) {
            const generatedMovie = generateMovie();
            const query = 'INSERT INTO movies (title, description, length, date_released, date_available_until) VALUES ($1, $2, $3, $4, $5)';
            const values = [movie.title, generatedMovie.description, generatedMovie.length, generatedMovie.dateReleased, generatedMovie.dateAvailableUntil];
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

        for (const genre of config.genres) {
            const query = 'INSERT INTO genres (name) VALUES ($1)';
            const values = [genre.toLowerCase()];
            await client.query(query, values);
        }

        for (const category of config.categories) {
            const query = 'INSERT INTO categories (name) VALUES ($1)';
            const values = [category.toLowerCase()];
            await client.query(query, values);
        }

        for (const tag of config.tags) {
            const query = 'INSERT INTO tags (name) VALUES ($1)';
            const values = [tag.toLowerCase()];
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
        await insertUserWebsiteTheme(userIds);

        console.log(`${config.movies.length} movies inserted successfully!`);
        console.log(`${numUsers} users inserted successfully!`);
        console.log(`${numThemes} users inserted successfully!`);
        console.log(`${config.genres.length} genres inserted successfully!`);
        console.log(`${config.tags.length} tags inserted successfully!`);
        console.log(`${config.categories.length} categories inserted successfully!`);
        console.log(`${movieIds.length} movie genres inserted successfully!`);
        console.log(`${movieIds.length} movie tags inserted successfully!`);
        console.log(`${movieIds.length} movie categories inserted successfully!`);
        console.log(`${userIds.length} user favorite movies inserted successfully!`);
        console.log(`${userIds.length} user favorite categories inserted successfully!`);
        console.log(`${movieIds.length} metadata inserted successfully!`);

    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

// Function to query movie IDs from the movies table
async function getMovieIds() {
    try {
        const result = await client.query('SELECT id FROM movies');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query movies:', error);
    }
}

// Function to query user IDs from the users table
async function getUserIds() {
    try {
        const result = await client.query('SELECT id FROM users');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query users:', error);
    }
}

// Function to query genre IDs from the genres table
async function getGenreIds() {
    try {
        const result = await client.query('SELECT id FROM genres');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query genres:', error);
    }
}

// Function to query tag IDs from the tags table
async function getTagIds() {
    try {
        const result = await client.query('SELECT id FROM tags');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query tags:', error);
    }
}

// Function to query category IDs from the categories table
async function getCategoryIds() {
    try {
        const result = await client.query('SELECT id FROM categories');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query categories:', error);
    }
}

// Function to query website theme IDs from the website_themes table
async function getWebsiteThemeIds() {
    try {
        const result = await client.query('SELECT id FROM website_themes');
        return result.rows.map(row => row.id);
    } catch (error) {
        console.error('Error query categories:', error);
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
    } catch (error) {
        console.error('Error inserting movie-genre combinations:', error);
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
    } catch (error) {
        console.error('Error inserting movie-tag combinations:', error);
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
    } catch (error) {
        console.error('Error inserting movie-category combinations:', error);
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
    } catch (error) {
        console.error('Error inserting user-movie combinations:', error);
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
    } catch (error) {
        console.error('Error inserting user-category combinations:', error);
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
    } catch (error) {
        console.error('Error inserting metadata:', error);
    }
}

// Function to insert website theme for a each user
async function insertUserWebsiteTheme(userIds) {
    try {
        const websiteThemeIds = await getWebsiteThemeIds();
        for (const userId of userIds) {
            const randomThemeId = websiteThemeIds[Math.floor(Math.random() * websiteThemeIds.length)];
            await client.query('UPDATE users SET website_theme_id = $1 WHERE id = $2', [randomThemeId, userId]);
        }
    } catch (error) {
        console.error('Error inserting user website theme:', error);
    }
}

module.exports = { client, connectToDatabase, createTables, insertData, dropTables };
