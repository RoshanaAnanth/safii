# Safii Backend API

A secure Node.js/Express backend API for the Safii application with authentication, rate limiting, and comprehensive error handling.

## Features

- 🔐 **Authentication**: JWT-based authentication with bcrypt password hashing
- 🛡️ **Security**: Helmet, CORS, rate limiting, and input validation
- 📝 **Validation**: Express-validator for request validation
- 🚦 **Rate Limiting**: Protection against brute force attacks
- 🔧 **Error Handling**: Comprehensive error handling middleware
- 📊 **Health Check**: Built-in health check endpoint
- 🔄 **Hot Reload**: Nodemon for development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/google` - Google OAuth (placeholder)

## Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes globally, 5 requests per 15 minutes for auth endpoints
- **Password Hashing**: bcrypt with salt rounds of 10
- **JWT Tokens**: 24-hour expiration
- **Input Validation**: Email format, password strength requirements
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Project Structure
```
backend/
├── src/
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── auth.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

See `.env.example` for all available environment variables.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper database connection
4. Set up proper logging
5. Use a process manager like PM2

## Next Steps

- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement Google OAuth
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add user profile management
- [ ] Add comprehensive testing
- [ ] Add API documentation with Swagger