# Ultravox Language Learning PWA

## LATEST RUN COMMANDS

Run each of the following in seperate terminals
`npm run ngrok-start`
`node .\server.js`

Run the following command based on the port `node .\server.js` is running:
`.\ngrok.exe http [PORT]` 
e.g.
`.\ngrok.exe http 6996`

Copy the server link from the above command and replace the value in REACT_APP_BACKEND_URL in .env and save

Run the following command in a different terminal:
`vercel --prod`

Now open the your website link. If an existing window already there make sure you do a full refresh of the page, e.g. Ctrl+Shift+R

To run things locally run `npm start`

Note: Run all commands above under the ultravox-pwa directory


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

## Recent Optimizations

The codebase has been optimized with the following improvements:

1. **Removed Unused Files**:
   - Deleted empty ConversationPage.js
   - Removed unused pages: ScenarioSelectionPage.js, TutorSelectionPage.js, DifficultySelectionPage.js
   - Removed unused components: ScenarioCard.js, TutorCard.js, UserProgress.js, ProgressStats.js, BackButton.js

2. **Simplified Context Management**:
   - Streamlined LanguageContext.js by removing unused state and functions related to scenarios and difficulty levels
   - Dramatically simplified ProgressContext.js by removing complex vocabulary and proficiency tracking
   - Improved local storage handling

3. **Optimized Service Layer**:
   - Simplified callService.js to focus on core functionality
   - Improved error handling throughout the application
   - Removed unused API endpoints from api.js

4. **Enhanced Server Configuration**:
   - Added static file serving for production builds
   - Improved error handling in server.js

5. **Performance Improvements**:
   - Added null checks to prevent potential errors
   - Improved cleanup of resources
   - Enabled proper usage of reportWebVitals for performance monitoring

6. **Reduced Package Size**:
   - Removed unused testing dependencies
   - Removed unused test scripts

These changes have resulted in a cleaner, more maintainable codebase with a smaller bundle size while preserving all core functionality 