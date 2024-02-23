# Movie App APIs

This is the backend server for the Movie App project. It provides APIs for retrieving movies, users and related data.

## Technologies Used

- Node.js
- PostgreSQL

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js installed on your local machine
- PostgreSQL installed and running locally

## Setup

To run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/JirayusSiri/fullstack-technical-assignment.git
    ```
    
2. Navigate to the project directory:

   ```bash
   cd movie-app-backend
    ```

3. Install dependencies:

   ```bash
   npm install
    ```
    
4. Create a .env file in the root directory and add your PostgreSQL database connection details:

   ```bash
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=your_database_name
    ```

5. Change [config.json](./movie-app-backend/config.json) to your preferences.

6. Run application

   ```bash
   node app.js
    ```

7. The server should now be running at http://localhost:3000.

## APIs usage

1. To retrieve all movies:

```bash
http://localhost:3000/api/movies
```

2. To retrieve all users:
```bash
http://localhost:3000/api/users
```

3. To retrieve one single user's detail:
```bash
http://localhost:3000/api/users/userId
```
**Note**: Please change *userId* according to user's id in your database.

4. To retrieve movies in a category:
```bash
http://localhost:3000/api/movies/category/categoryName
```
**Note**: Please change *categoryName* according to your [config.json](./movie-app-backend/config.json) file.

5. To retrieve movies with specific tag:
```bash
http://localhost:3000/api/movies/tag/tagName
```
**Note**: Please change *tagName* according to your [config.json](./movie-app-backend/config.json) file.