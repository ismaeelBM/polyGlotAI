# Ultravox Client Tools - Mobile Documentation

## Overview

The Ultravox Mobile Client is a React Native application that provides a mobile interface for interacting with the Ultravox voice AI platform. This documentation covers the key components, architecture, and usage of the mobile client.

## Architecture

The application follows a modular architecture with the following key components:

### Core Libraries

- **types.js**: Defines the data structures and enums used throughout the application
- **demo-config.js**: Contains the configuration for the demo, including system prompt and tool definitions
- **callFunctions.js**: Handles the core functionality for managing calls with the Ultravox API
- **clientTools.js**: Implements client-side tools that can be called by the AI agent

### UI Components

- **Toggle.js**: A reusable toggle switch component
- **MicToggleButton.js**: Button for toggling microphone mute state
- **CallStatus.js**: Displays the current status of the call
- **DebugMessages.js**: Shows debug messages during development
- **OrderDetails.js**: Displays order information updated by the AI agent

### Screens

- **HomeScreen.js**: The main screen of the application, integrating all components

## Call Flow

1. **Initialization**: The app initializes with the HomeScreen component
2. **Start Call**: User presses "Start Call" button, which:
   - Creates a call configuration
   - Sends a request to the Ultravox API
   - Initializes a UltravoxSession
   - Registers tool implementations
3. **During Call**:
   - Audio is streamed to/from the Ultravox service
   - Transcripts are displayed in real-time
   - The AI agent can call tools like "updateOrder"
   - Order details are updated and displayed
4. **End Call**: User presses "End Call" button, which:
   - Terminates the UltravoxSession
   - Resets the UI state

## Tool Implementation

The app demonstrates how to implement client-side tools that can be called by the AI agent:

```javascript
// Example from clientTools.js
export const updateOrderTool = (parameters) => {
  const { ...orderData } = parameters;
  console.log("Received order details update:", orderData.orderDetailsData);

  // In React Native, we use a callback approach for state management
  if (typeof global.orderUpdateCallback === 'function') {
    global.orderUpdateCallback(orderData.orderDetailsData);
  }

  return "Updated the order details.";
};
```

## Demo Configuration

The demo is configured as a "Dr. Donut" drive-thru ordering system with:

- A detailed system prompt that defines the agent's behavior
- Menu items with prices
- Tool definitions for updating orders
- Voice configuration

## Development Notes

### Mock Implementation

The current implementation uses mock functionality for the Ultravox client. In a production environment, you would:

1. Import and use the actual Ultravox client library
2. Implement proper authentication
3. Handle audio permissions and recording
4. Add error handling and retry logic

### Testing

To test the application:

1. Start the app with `npm start`
2. Use the Expo client on your device or simulator
3. Press "Start Call" to begin a simulated conversation
4. Speak to the AI agent (simulated in the mock implementation)
5. Test the microphone mute functionality
6. End the call when finished

## Customization

To customize the app for your own use case:

1. Modify the system prompt in `demo-config.js`
2. Update the tool definitions to match your requirements
3. Customize the UI components as needed
4. Replace the mock implementation with the actual Ultravox client

## Troubleshooting

Common issues:

1. **Audio permissions**: Ensure your app has the necessary permissions for microphone access
2. **Network connectivity**: Check that your device can reach the Ultravox API
3. **Tool implementation**: Verify that your tool implementations match the expected schema

## Future Enhancements

Potential improvements for the application:

1. Add authentication and user management
2. Implement persistent conversation history
3. Add support for multiple AI agents/personas
4. Enhance the UI with animations and transitions
5. Add offline mode capabilities 