# Safii - Full-Stack Application

A modern, secure, and responsive full-stack application with React frontend and Node.js backend.

## 🚀 Features

### Frontend
- 📱 **Mobile-First Responsive Design** - Works perfectly on all devices
- 🎨 **SCSS Modules** - Clean, maintainable styling with proper CSS properties
- ⚡ **Vite** - Fast development and build tool
- 🔧 **TypeScript** - Type-safe development
- 🎯 **Modern React** - Latest React 18 with hooks

### Backend
- 🔐 **JWT Authentication** - Secure user authentication
- 🛡️ **Security Features** - Helmet, CORS, rate limiting
- 📝 **Input Validation** - Express-validator for request validation
- 🚦 **Rate Limiting** - Protection against brute force attacks
- 🔧 **Error Handling** - Comprehensive error handling middleware

## 📁 Project Structure

```
safii-fullstack/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/ui/    # Reusable UI components
│   │   ├── screens/         # Screen components with SCSS modules
│   │   ├── lib/            # Utility functions
│   │   └── index.tsx       # Application entry point
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
└── package.json            # Root package.json for scripts
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up backend environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start both frontend and backend:**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Individual Development

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

## 📱 Responsive Design

The application uses a mobile-first approach with these breakpoints:

- **Mobile**: < 768px (base styles)
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Large Desktop**: ≥ 1440px

## 🔐 Authentication

The app includes a complete authentication system:

- **Login/Register** with email and password
- **JWT tokens** with 24-hour expiration
- **Password hashing** with bcrypt
- **Rate limiting** for security
- **Input validation** for all requests

### Test Credentials
- Email: `user@example.com`
- Password: `password`

## 🎨 Styling

- **SCSS Modules** for component-specific styles
- **Mobile-first** responsive design
- **Proper CSS properties** (no utility classes)
- **Smooth transitions** and hover effects
- **Consistent spacing** and typography

## 🚀 Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend
1. Set environment variables for production
2. Use a process manager like PM2
3. Set up a reverse proxy (nginx)
4. Configure SSL certificates

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### Health Check
- `GET /health` - API health status

## 🔧 Development Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.