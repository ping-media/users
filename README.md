# Users CRUD API with SQLite Database

A robust REST API for user management with SQLite database storage, featuring advanced filtering, search, and statistics capabilities.

## 🚀 Features

- **SQLite Database**: Fast, reliable, and lightweight database storage
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Advanced Filtering**: Filter users by city, gender, and search terms
- **Pagination**: Built-in pagination support for large datasets
- **Search**: Full-text search across name and email fields
- **Statistics**: Comprehensive database statistics and analytics
- **Data Validation**: Robust input validation and error handling
- **Health Checks**: Built-in health monitoring endpoints
- **Docker Support**: Containerized deployment with Docker
- **Migration Tools**: Easy migration from JSON to SQLite

## 📋 Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd users
npm install
```

### 2. Initialize Database

```bash
npm run db:init
```

This will:

- Create the SQLite database file (`data/users.db`)
- Set up the users table with proper schema
- Create indexes for optimal performance
- Set up triggers for automatic timestamp updates

### 3. Migrate Existing Data (Optional)

If you have existing JSON data, migrate it to SQLite:

```bash
npm run db:migrate
```

This will:

- Read existing `data/data.json` file
- Migrate all users to SQLite database
- Create a backup of the original JSON file
- Skip duplicate users (based on email)

### 4. Start the Server

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
  -v $(pwd)/data:/app/data \
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

### Database Configuration

The SQLite database is automatically configured and stored in `data/users.db`. The database includes:

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
  "database": "SQLite"
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
├── database/
│   ├── config.js          # Database configuration
│   ├── database.js        # Database service layer
│   ├── init.js           # Database initialization
│   ├── migrate.js        # JSON to SQLite migration
│   └── userRepository.js # User data access layer
├── controllers/
│   └── userController.js # Business logic and validation
├── routes/
│   └── users.js         # API route definitions
├── data/
│   └── users.db         # SQLite database file
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies and scripts
├── server.js           # Main application entry point
└── README.md           # This file
```

## 🛠️ Development

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with auto-reload
- `npm run db:init`: Initialize the database
- `npm run db:migrate`: Migrate JSON data to SQLite

### Database Management

The SQLite database is stored in `data/users.db`. You can:

- **Backup**: Copy the `.db` file
- **Reset**: Delete the `.db` file and run `npm run db:init`
- **Inspect**: Use SQLite tools like `sqlite3` or DB Browser for SQLite

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

---

**Happy Coding! 🚀**
