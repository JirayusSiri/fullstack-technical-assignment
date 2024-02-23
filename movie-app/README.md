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

5. Run application

   ```bash
   node app.js
    ```

6. The server should now be running at http://localhost:3000.