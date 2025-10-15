const { spawn } = require('child_process');
const path = require('path');

console.log('🔨 Building MarEye application...');

// Start Next.js build process
const nextBuild = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextBuild.on('error', (err) => {
  console.error('❌ Failed to build application:', err);
  process.exit(1);
});

nextBuild.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.log(`❌ Build failed with code ${code}`);
  }
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping build process...');
  nextBuild.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping build process...');
  nextBuild.kill('SIGTERM');
});

