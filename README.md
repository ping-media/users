# Users CRUD REST API

A simple CRUD REST API built with Node.js and Express, storing data in a local JSON file (`data.json`).

## Features

- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ Data persistence using local JSON file
- ✅ Input validation and error handling
- ✅ UUID-based user identification
- ✅ Modular code structure
- ✅ Comprehensive documentation
- ✅ CORS support
- ✅ Request logging

## Project Structure

```
users/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── data.json             # Data storage file
├── README.md             # This file
├── routes/
│   └── users.js          # User routes
├── controllers/
│   └── userController.js # Business logic and validation
└── helpers/
    └── fileUtils.js      # File operations utilities
```

## Installation

1. Navigate to the users directory:

   ```bash
   cd users
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

   Or for development with auto-restart:

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL

```
http://localhost:3000
```

### User Schema

```json
{
  "id": "UUID (auto-generated)",
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "phone": "string (required)",
  "city": "string (required)",
  "gender": "string (required: male, female, or other)",
  "age": "number (required, 0-150)"
}
```

### Endpoints

#### 1. Create User

- **POST** `/users`
- **Description**: Create a new user
- **Body**: User object (without id)
- **Response**: Created user with generated UUID

**Example Request:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "city": "New York",
    "gender": "male",
    "age": 30
  }'
```

#### 2. Get All Users

- **GET** `/users`
- **Description**: Retrieve all users
- **Response**: Array of all users

**Example Request:**

```bash
curl http://localhost:3000/users
```

#### 3. Get User by ID

- **GET** `/users/:id`
- **Description**: Retrieve a specific user by ID
- **Parameters**: `id` (UUID)
- **Response**: User object or 404 if not found

**Example Request:**

```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

#### 4. Update User

- **POST** `/users/:id`
- **Description**: Update an existing user
- **Parameters**: `id` (UUID)
- **Body**: Updated user data
- **Response**: Updated user object

**Example Request:**

```bash
curl -X POST http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "+1-555-999-8888",
    "city": "Boston",
    "gender": "male",
    "age": 31
  }'
```

#### 5. Delete User

- **DELETE** `/users/:id`
- **Description**: Delete a user by ID
- **Parameters**: `id` (UUID)
- **Response**: Success message (no data returned)

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

- **name**: Required, non-empty string
- **email**: Required, valid email format
- **phone**: Required, non-empty string
- **city**: Required, non-empty string
- **gender**: Required, must be "male", "female", or "other"
- **age**: Required, number between 0 and 150

## Testing the API

### Using curl

1. **Get all users:**

   ```bash
   curl http://localhost:3000/users
   ```

2. **Create a new user:**

   ```bash
   curl -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+1-555-000-0000",
       "city": "Test City",
       "gender": "other",
       "age": 25
     }'
   ```

3. **Get API documentation:**
   ```bash
   curl http://localhost:3000/
   ```

### Using Postman or similar tools

Import the following collection or create requests manually using the endpoints described above.

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Returns 400 with specific field errors
- **Not Found**: Returns 404 for non-existent resources
- **Server Errors**: Returns 500 with error details
- **Invalid Routes**: Returns 404 with available routes

## Data Persistence

- Data is stored in `data.json` file
- File is automatically created if it doesn't exist
- All operations are atomic (read-modify-write)
- Data persists between server restarts

## Development

### File Structure Benefits

- **Modularity**: Separated concerns (routes, controllers, helpers)
- **Maintainability**: Easy to modify and extend
- **Testability**: Each module can be tested independently
- **Scalability**: Easy to add new features and endpoints

### Adding New Features

1. Add new routes in `routes/users.js`
2. Implement business logic in `controllers/userController.js`
3. Add file operations in `helpers/fileUtils.js` if needed
4. Update validation rules as required

## License

MIT License - feel free to use this code for your projects!
