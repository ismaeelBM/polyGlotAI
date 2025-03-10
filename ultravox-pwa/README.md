# Ultravox Language Learning PWA

A Progressive Web App for practicing languages with AI tutors in realistic conversation scenarios.

## Features

- Choose from multiple language tutors with different specialties
- Select conversation scenarios to practice
- Set difficulty levels based on your proficiency
- Have voice or text conversations with AI tutors
- Track vocabulary acquisition and language proficiency
- Works offline and can be installed on mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/ultravox-pwa.git
cd ultravox-pwa
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Build for production
```
npm run build
```

## Backend Integration

This PWA connects to the Ultravox backend API for voice conversations. The backend server proxies requests to the Ultravox API.

To set up the backend:

1. Navigate to the backend directory
```
cd ../ultravox-mobile-backend
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file with your Ultravox API key
```
ULTRAVOX_API_URL=https://api.ultravox.ai
ULTRAVOX_API_KEY=your_api_key_here
```

4. Start the backend server
```
node server.js
```

## Project Structure

- `/public` - Static assets and PWA manifest
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/contexts` - React context providers for state management
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/services` - API and utility services
  - `/utils` - Helper functions

## Technologies Used

- React
- React Router
- Tailwind CSS
- Workbox (for PWA capabilities)
- Ultravox API (for voice conversations)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ultravox API for providing the voice conversation capabilities
- The React and PWA communities for excellent documentation and examples 