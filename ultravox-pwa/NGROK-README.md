# Ultravox PWA - Ngrok Server Guide

This guide explains how to expose your Ultravox PWA server to the internet using ngrok, allowing for testing with external services or sharing your application with others without deploying it to a production environment.

## What is ngrok?

[ngrok](https://ngrok.com/) is a service that creates secure tunnels from public URLs to your local machine. This is particularly useful for:

- Testing webhooks that need to reach your local server
- Sharing your work-in-progress with clients or team members
- Testing your application on different devices without deploying

## Prerequisites

1. Node.js and npm installed on your machine
2. ngrok installed (see installation instructions below)
3. All required environment variables set (.env file configured)

## Installing ngrok

### Option 1: Using npm (recommended)
```bash
# This is already added as a devDependency in package.json
npm install
```

### Option 2: Standalone installation
Download and install ngrok from the [official website](https://ngrok.com/download).

## Environment Variables

Make sure your `.env` file is properly configured:

```
PORT=3001                    # Regular server port
NGROK_PORT=3002              # Port for ngrok server
ULTRAVOX_API_URL=<your_url>  # Your Ultravox API URL
ULTRAVOX_API_KEY=<your_key>  # Your Ultravox API key
```

## Starting the ngrok Server

We've provided two methods to start the ngrok-compatible server:

### Method 1: Using the helper script (recommended)

```bash
npm run ngrok-start
```

This script will:
1. Start the ngrok-compatible server on the port specified in your .env file
2. Provide clear instructions on how to expose it with ngrok

### Method 2: Starting the server directly

```bash
npm run ngrok-server
```

## Exposing Your Server with ngrok

After starting the server, open a new terminal window and run:

```bash
# If installed via npm
npx ngrok http 3002  # Replace 3002 with your NGROK_PORT if different

# If installed standalone
ngrok http 3002  # Replace 3002 with your NGROK_PORT if different
```

Once ngrok is running, it will display a URL (like `https://a1b2c3d4.ngrok.io`) that you can use to access your server from anywhere.

## Testing Your Exposed Server

You can verify your server is working by accessing the health check endpoint:

```
https://your-ngrok-url.ngrok.io/api/health
```

## Important Notes

1. The free ngrok plan provides:
   - Randomized URLs that change each time you start ngrok
   - 40 connections per minute
   - Only one tunnel at a time

2. For production use, consider:
   - A proper deployment solution (AWS, Heroku, Vercel, etc.)
   - Using ngrok's paid plans for persistent URLs and more features

3. Security considerations:
   - Your local server is exposed to the internet while ngrok is running
   - Only share the ngrok URL with trusted parties
   - Consider adding authentication if sensitive data is involved

## Troubleshooting

- If you see "address already in use" errors, make sure no other service is using your specified ports
- If ngrok connects but requests fail, verify your server is running and listening on the correct address (0.0.0.0)
- Check the logs in both your server terminal and ngrok terminal for error messages

## Related Commands

```bash
# Start the regular server (not ngrok-compatible)
npm run server

# Start the ngrok-compatible server
npm run ngrok-server

# Start using the helper script (recommended)
npm run ngrok-start
``` 