const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MarEye development server...');

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextDev.on('error', (err) => {
  console.error('❌ Failed to start development server:', err);
  process.exit(1);
});

nextDev.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  nextDev.kill('SIGTERM');
});

