# Safii Frontend

A modern, mobile-first responsive React application for Safii with SCSS modules and clean architecture.

## Features

- 📱 **Mobile-First Design**: Responsive design that works perfectly on all devices
- 🎨 **SCSS Modules**: Organized styling with proper CSS properties
- ⚡ **Vite**: Fast development and build tool
- 🔧 **TypeScript**: Type-safe development
- 🎯 **Modern React**: Latest React 18 with hooks
- 🌐 **API Integration**: Axios for backend communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   ├── screens/
│   │   └── LoginScreen/  # Screen components with SCSS modules
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   └── index.tsx         # Application entry point
├── public/               # Static assets
├── index.html           # HTML template
└── package.json
```

## Responsive Design

The application uses a mobile-first approach with breakpoints:

- **Mobile**: < 768px (base styles)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: ≥ 1440px

## SCSS Modules

Each component has its own SCSS module file with:
- Proper CSS properties (no Tailwind classes)
- Mobile-first responsive design
- Hover states and transitions
- Clean, maintainable code structure

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend is configured to work with the backend API running on `http://localhost:5000`. Update the API base URL in your environment configuration as needed.

## Styling Guidelines

- Use SCSS modules for component-specific styles
- Follow mobile-first responsive design principles
- Use proper CSS properties instead of utility classes
- Implement smooth transitions and hover effects
- Maintain consistent spacing and typography