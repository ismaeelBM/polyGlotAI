# Ultravox Mobile Chat - Documentation

## Overview

Ultravox Mobile Chat is a simple React Native application that provides a clean interface for interacting with the Ultravox voice AI platform. This minimalist app allows users to start a conversation with an AI assistant, speak naturally, and receive voice responses.

## Architecture

The application follows a streamlined architecture with the following components:

### Core Libraries

- **types.js**: Defines basic data structures and enums
- **demo-config.js**: Contains the minimal configuration for the chat assistant
- **callFunctions.js**: Handles the core functionality for managing voice conversations

### UI Components

- **MicToggleButton.js**: Button for toggling microphone mute state during conversations

### Screens

- **HomeScreen.js**: The main screen with a clean conversational interface

## Conversation Flow

1. **Start**: User presses "Start Conversation" button
2. **Interaction**: User speaks and hears AI responses
3. **End**: User presses "End Conversation" button

## User Interface

The app features a minimal, conversation-focused interface:

1. **Header**: Shows the app title and current status
2. **Conversation Area**: Displays the ongoing conversation with message bubbles
3. **Controls**: 
   - Start Conversation button (when inactive)
   - Mic Toggle and End Conversation buttons (when active)

## Implementation Details

### Backend Connection

The app connects to a backend server that proxies requests to the Ultravox API:

```javascript
// Backend server URL
const BACKEND_SERVER_URL = 'http://localhost:3000';
```

### AI Configuration

The chat assistant configuration is separated into two parts:

1. **API Parameters** - These are sent to the Ultravox API during call creation:

```javascript
// API call parameters (must be valid for the Ultravox API)
callConfig: {
  systemPrompt: getSystemPrompt(),
  model: "fixie-ai/ultravox-70B",
  languageHint: "en",
  selectedTools: [],
  voice: "terrence",
  temperature: 0.4
}
```

2. **Client-Side Configuration** - These control the behavior of the Ultravox session in the browser:

```javascript
// Client-side UI and session configuration (not sent to API)
clientConfig: {
  preventRedirect: true,
  inlineProcessing: true,
  disablePageReplacement: true,
  embeddedMode: true,
  containInParent: true,
  preventDOMManipulation: true,
  keepButtonsVisible: true
}
```

### Preventing UI Replacement

To prevent the Ultravox session from replacing your UI with a white screen:

1. Create a hidden container for the Ultravox session:
```javascript
const ultravoxContainer = document.createElement('div');
ultravoxContainer.id = 'ultravox-container';
ultravoxContainer.style.display = 'none';
ultravoxContainer.style.position = 'absolute';
ultravoxContainer.style.top = '-9999px';
document.body.appendChild(ultravoxContainer);
```

2. Use the container when initializing the session:
```javascript
uvSession = new UltravoxSession({ 
  preventRedirect: true,
  disablePageReplacement: true,
  embeddedMode: true,
  containerElement: ultravoxContainer,
  preventUIReplacement: true
});
```

3. Pass the same options when joining the call:
```javascript
await uvSession.joinCall(joinUrl, { 
  preventNavigation: true,
  disablePageReplacement: true,
  embeddedMode: true,
  keepExistingUI: true
});
```

### Error Handling

The application includes several error handling mechanisms:

1. Safety timeout that resets if starting a conversation takes too long
2. Error display in the UI
3. Emergency reset button that appears when there's an error
4. Proper cleanup when ending conversations

## Development Notes

### Testing

To test the application:

1. Start the backend server with `node server.js`
2. Start the app with `npm start`
3. Use the Expo client on your device or simulator
4. Press "Start Conversation" to begin
5. Speak to the AI assistant
6. Test the microphone mute functionality
7. End the conversation when finished

### Important API Notes

When working with the Ultravox API:

1. **Valid API Parameters**: Only send parameters that are explicitly supported by the API:
   - `systemPrompt`, `temperature`, `model`, `voice`, `languageHint`, `initialMessages`, 
   - `joinTimeout`, `maxDuration`, `timeExceededMessage`, `inactivityMessages`, 
   - `selectedTools`, `medium`, `recordingEnabled`, `firstSpeaker`, 
   - `transcriptOptional`, `initialOutputMedium`, `vadSettings`, 
   - `firstSpeakerSettings`, `experimentalSettings`

2. **Client-Side Only Options**: These options should only be used when creating the UltravoxSession or joining a call, not when creating the call via API:
   - `preventRedirect`, `disablePageReplacement`, `embeddedMode`, 
   - `preventUIReplacement`, `containerElement`, etc.

### Future Enhancements

Potential improvements for this simple application:

1. Add conversation history persistence
2. Implement user preferences for AI voice
3. Add theme options for the interface
4. Support for text input as an alternative to voice
5. Accessibility improvements 