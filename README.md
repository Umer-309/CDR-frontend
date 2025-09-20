# CDR Analytics Frontend

A modern React-based frontend for Call Detail Records (CDR) analytics and telecommunications intelligence system. Built with Vite, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js (version 18 or higher)
- npm package manager

## Installation

1. Clone the frontend directory

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the `frontEnd` directory and set the following variables:

```env
VITE_API_URL=http://localhost:5000
```

## Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Features

- **File Upload**: Upload and process Excel (.xls, .xlsx) and CSV files containing CDR data
- **Analytics Dashboard**: Interactive charts and visualizations for call patterns and trends
- **Geographic Mapping**: Map view showing call locations with Leaflet integration
- **Data Filtering**: Advanced filtering and search capabilities
- **Device Correlation**: Analysis of device relationships and communication patterns

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client

## Production Build

To build the application for production:

```bash
npm run build
```

The built files will be generated in the `dist` directory and can be deployed to any static hosting service.

## Development Notes

- The application uses Vite for fast development and building
- Hot module replacement is enabled for instant updates during development
- TypeScript is configured for strict type checking
- ESLint is set up for code quality and consistency