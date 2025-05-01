# MongoDB Docker Project

This project sets up a MongoDB database using Docker. It includes scripts for backing up and restoring the database, as well as initialization scripts for setting up the database on startup.

## Project Structure

- **docker/**: Contains Docker-related files.
  - **docker-compose.yml**: Defines the services, networks, and volumes for the Docker containers.
  - **mongodb/**: Contains MongoDB initialization scripts.
    - **init-mongo.js**: JavaScript code to initialize the database with collections and documents.

- **scripts/**: Contains backup and restore scripts.
  - **backup.sh**: Script to create a backup of the MongoDB database.
  - **restore.sh**: Script to restore the MongoDB database from a backup.

- **.env**: Environment variables for database credentials and configuration settings.

- **.gitignore**: Specifies files and directories to be ignored by Git.

- **Dockerfile**: Instructions for building a Docker image for the application.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mongodb-docker
   ```

2. Create a `.env` file with your database configuration:
   ```env
   MONGO_INITDB_ROOT_USERNAME=your_username
   MONGO_INITDB_ROOT_PASSWORD=your_password
   ```

3. Start the MongoDB service using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. To create a backup of the database, run:
   ```bash
   ./scripts/backup.sh
   ```

5. To restore the database from a backup, run:
   ```bash
   ./scripts/restore.sh
   ```

## Usage

Access the MongoDB instance at `localhost:27017`. Use the credentials specified in the `.env` file to connect to the database.

## License

This project is licensed under the MIT License.