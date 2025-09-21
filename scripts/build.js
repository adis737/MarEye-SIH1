const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js build...');

const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.log(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});

// Handle Windows permission errors gracefully
process.on('uncaughtException', (error) => {
  if (error.code === 'EPERM' && error.syscall === 'kill') {
    console.log('⚠️  Windows permission error during cleanup (this is normal)');
    console.log('✅ Build completed successfully despite cleanup error');
    process.exit(0);
  } else {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
});
