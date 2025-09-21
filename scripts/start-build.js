const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js build...');

// Use npx to run next build
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.log(`❌ Build failed with code ${code}`);
  }
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});
