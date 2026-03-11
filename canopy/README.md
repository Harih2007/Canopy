# CANOPY Zoo Animal Management System

CANOPY is a full-stack web application for zoo animal management. It features a Node.js/Express backend, an HTML/JS/CSS frontend, and a MySQL database.

## Prerequisites

- Node.js (v14 or higher recommended)
- MySQL Server

## Project Structure

- `backend/`: Node.js Express server providing RESTful APIs and serving the frontend.
- `frontend/`: Static web assets (HTML, JS, CSS) for the user interface.
- `database/`: Contains `schema.sql` for initializing the database structure.

## Setup Instructions

1. **Database Setup**
   Ensure MySQL is running. Create a database named `canopy_zoo` and run the `database/schema.sql` script to initialize the tables.

   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Backend Setup**
   Navigate to the `backend` directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables**
   By default, the backend connects to MySQL using user `root` with no password and database `canopy_zoo` on `localhost`. 
   If your MySQL setup differs, create a `.env` file in the `backend` directory with the following variables:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=canopy_zoo
   PORT=3000
   ```

4. **Start the Application**
   From the `backend` directory, start the server:

   ```bash
   npm start
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`. The backend automatically serves the static files from the `frontend` directory.
