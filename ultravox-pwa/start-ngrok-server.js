/**
 * Helper script to run the ngrok-enabled server
 * This script provides clear instructions for exposing the server with ngrok
 */

const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (text) => text, blue: (text) => text, yellow: (text) => text };

console.log(chalk.green('\n==================================='));
console.log(chalk.green('  ULTRAVOX PWA NGROK SERVER LAUNCHER'));
console.log(chalk.green('===================================\n'));

console.log(chalk.blue('Starting ngrok-compatible server...\n'));

// Start the server process
const server = spawn('node', ['ngrok-server.js'], { stdio: 'inherit' });

// Handle server process events
server.on('error', (err) => {
  console.error(chalk.red('Failed to start server:'), err);
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down ngrok server...'));
  server.kill('SIGINT');
  process.exit(0);
});

// Display additional help information
console.log(chalk.blue('\nNOTE: This script only starts the server. To expose it with ngrok:'));
console.log('1. Open a new terminal window');
console.log('2. Run: ngrok http <PORT> (use the port shown in server logs)');
console.log('3. Copy the https URL provided by ngrok to access your API remotely');
console.log('\nPress Ctrl+C to stop the server.\n'); 