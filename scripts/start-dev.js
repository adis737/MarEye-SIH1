const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js development server...');

// Use the direct path to next binary or npm script
const devProcess = spawn('npm', ['run', 'dev:direct'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

devProcess.on('close', (code) => {
  console.log(`Development server stopped with code ${code}`);
  process.exit(code);
});

devProcess.on('error', (error) => {
  console.error('Development server error:', error);
  process.exit(1);
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping development server...');
  devProcess.kill('SIGTERM');
});
