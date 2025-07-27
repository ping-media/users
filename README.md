# Users CRUD API with MariaDB Database

A robust REST API for user management with MariaDB database storage, featuring advanced filtering, search, and statistics capabilities.

## 🚀 Features

- **MariaDB Database**: Fast, reliable, and scalable database storage
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Advanced Filtering**: Filter users by city, gender, and search terms
- **Pagination**: Built-in pagination support for large datasets
- **Search**: Full-text search across name and email fields
- **Statistics**: Comprehensive database statistics and analytics
- **Data Validation**: Robust input validation and error handling
- **Health Checks**: Built-in health monitoring endpoints
- **Docker Support**: Containerized deployment with Docker
- **Migration Tools**: Easy migration from JSON to MariaDB
- **Modular Architecture**: Clean separation of concerns with controllers, routes, and repositories

## 📋 Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager
- MariaDB/MySQL database server
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd users
npm install
```

### 2. Database Configuration

Configure your MariaDB connection in `database/config.js`:

```javascript
const DB_CONFIG = {
  host: process.env.MARIADB_HOST || "localhost",
  user: process.env.MARIADB_USER || "your_username",
  password: process.env.MARIADB_PASSWORD || "your_password",
  database: process.env.MARIADB_DATABASE || "users_db",
  port: process.env.MARIADB_PORT || 3306,
};
```

### 3. Initialize Database

```bash
npm run db:init
```

This will:

- Connect to MariaDB database
- Create the users table with proper schema
- Set up indexes for optimal performance
- Configure automatic timestamp updates

### 4. Migrate Existing Data (Optional)

If you have existing JSON data, migrate it to MariaDB:

```bash
npm run db:migrate
```

This will:

- Read existing `data/data.json` file
- Migrate all users to MariaDB database
- Create a backup of the original JSON file
- Skip duplicate users (based on email)

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t users-api .

# Run the container
docker run -d \
  --name users-api \
  -p 3000:3000 \
  -e MARIADB_HOST=your_db_host \
  -e MARIADB_USER=your_db_user \
  -e MARIADB_PASSWORD=your_db_password \
  -e MARIADB_DATABASE=users_db \
  users-api
```

### Using Docker Compose

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Endpoints

### Core CRUD Operations

| Method   | Endpoint     | Description                                 |
| -------- | ------------ | ------------------------------------------- |
| `POST`   | `/users`     | Create a new user                           |
| `GET`    | `/users`     | Get all users (with filtering & pagination) |
| `GET`    | `/users/:id` | Get user by ID                              |
| `POST`   | `/users/:id` | Update user by ID                           |
| `DELETE` | `/users/:id` | Delete user by ID                           |

### Advanced Features

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| `GET`  | `/users/search?q=term`  | Search users by name or email |
| `GET`  | `/users/stats`          | Get database statistics       |
| `GET`  | `/users/city/:city`     | Get users by city             |
| `GET`  | `/users/gender/:gender` | Get users by gender           |
| `GET`  | `/health`               | Health check endpoint         |

### Query Parameters

- `limit`: Number of users to return (pagination)
- `offset`: Number of users to skip (pagination)
- `city`: Filter users by city
- `gender`: Filter users by gender (male, female, other)
- `search`: Search in name and email fields

## 📊 User Schema

```json
{
  "id": "UUID (auto-generated)",
  "name": "string (required)",
  "email": "string (required, valid email format, unique)",
  "phone": "string (required)",
  "city": "string (required)",
  "gender": "string (required: male, female, or other)",
  "age": "number (required, 0-150)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MARIADB_HOST`: MariaDB host (default: localhost)
- `MARIADB_USER`: MariaDB username
- `MARIADB_PASSWORD`: MariaDB password
- `MARIADB_DATABASE`: MariaDB database name
- `MARIADB_PORT`: MariaDB port (default: 3306)

### Database Configuration

The MariaDB database is configured in `database/config.js` and includes:

- **Connection Pooling**: Optimized database connections
- **Indexes**: Optimized queries for email, city, gender, and timestamps
- **Constraints**: Data validation at the database level
- **Triggers**: Automatic timestamp updates
- **Foreign Keys**: Enabled for future extensibility

## 📈 Database Statistics

The `/users/stats` endpoint provides comprehensive statistics:

```json
{
  "userCount": 150,
  "dbSize": 245760,
  "dbName": "users_db",
  "cityStats": [
    { "city": "New York", "count": 25 },
    { "city": "London", "count": 20 }
  ],
  "genderStats": [
    { "gender": "male", "count": 80 },
    { "gender": "female", "count": 70 }
  ],
  "ageStats": {
    "avgAge": 32.5,
    "minAge": 18,
    "maxAge": 65
  }
}
```

## 🧪 Testing the API

### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "city": "New York",
    "gender": "male",
    "age": 30
  }'
```

### Get All Users with Filtering

```bash
# Get first 10 users
curl "http://localhost:3000/users?limit=10"

# Filter by city
curl "http://localhost:3000/users?city=New%20York"

# Search users
curl "http://localhost:3000/users/search?q=john"
```

### Get Statistics

```bash
curl http://localhost:3000/users/stats
```

## 🔍 Health Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Users CRUD API",
  "database": "MariaDB"
}
```

## 🚨 Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Validation errors
- **404 Not Found**: User not found
- **409 Conflict**: Email already exists
- **500 Internal Server Error**: Server errors

All errors include detailed messages and suggestions for resolution.

## 🔒 Security Features

- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Non-root User**: Docker container runs as non-root user
- **CORS Support**: Configurable cross-origin requests
- **Error Sanitization**: Sensitive information is not exposed in errors

## 📁 Project Structure

```
users/
├── controllers/
│   └── userController.js    # Business logic and validation
├── database/
│   ├── config.js           # Database configuration
│   ├── database.js         # Database service layer
│   ├── init.js            # Database initialization
│   ├── migrate.js         # JSON to MariaDB migration
│   └── userRepository.js  # User data access layer
├── helpers/
│   └── fileUtils.js       # File utility functions
├── routes/
│   └── users.js          # API route definitions
├── data/
│   ├── data.json         # JSON data file (for migration)
│   ├── data.json.backup  # Backup of original JSON data
│   └── users.db          # SQLite database (legacy)
├── Dockerfile            # Docker configuration
├── .dockerignore         # Docker ignore file
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── server.js           # Main application entry point
└── README.md           # This file
```

## 🛠️ Development

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with auto-reload
- `npm run db:init`: Initialize the MariaDB database
- `npm run db:migrate`: Migrate JSON data to MariaDB

### Database Management

The MariaDB database is configured through environment variables. You can:

- **Backup**: Use MariaDB backup tools
- **Reset**: Drop and recreate the database
- **Inspect**: Use MariaDB tools or phpMyAdmin

### Architecture Overview

The application follows a clean architecture pattern:

- **Controllers** (`controllers/`): Handle HTTP requests and business logic
- **Routes** (`routes/`): Define API endpoints and routing
- **Repository** (`database/userRepository.js`): Data access layer
- **Database** (`database/`): Database configuration and utilities
- **Helpers** (`helpers/`): Utility functions for file operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `http://localhost:3000`
2. Review the health check at `http://localhost:3000/health`
3. Check server logs for detailed error messages
4. Verify database connectivity and permissions
5. Ensure MariaDB server is running and accessible

## 🔄 Migration from SQLite

This project has been migrated from SQLite to MariaDB for better scalability and performance. The migration tools are included to help transition existing data.

---

**Happy Coding! 🚀**
