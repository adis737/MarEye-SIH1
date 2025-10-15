const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all MarEye services...');

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start Flask backend (if available)
let flaskProcess = null;
try {
  flaskProcess = spawn('python', ['-m', 'flask', 'run'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
} catch (err) {
  console.log('⚠️  Flask backend not available, continuing with Next.js only');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  nextDev.kill('SIGINT');
  if (flaskProcess) {
    flaskProcess.kill('SIGINT');
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down all services...');
  nextDev.kill('SIGTERM');
  if (flaskProcess) {
    flaskProcess.kill('SIGTERM');
  }
});

nextDev.on('error', (err) => {
  console.error('❌ Failed to start Next.js server:', err);
  process.exit(1);
});

if (flaskProcess) {
  flaskProcess.on('error', (err) => {
    console.error('❌ Failed to start Flask server:', err);
  });
}

