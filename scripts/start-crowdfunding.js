const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Web3 Crowdfunding Server...');

// Change to web3-crowdfunding directory
const crowdfundingDir = path.join(__dirname, '..', 'web3-crowdfunding');

// Start the crowdfunding server on port 3000
const crowdfundingProcess = spawn('npm', ['run', 'dev:fast'], {
  cwd: crowdfundingDir,
  stdio: 'inherit',
  shell: true
});

crowdfundingProcess.on('error', (error) => {
  console.error('❌ Error starting crowdfunding server:', error);
});

crowdfundingProcess.on('close', (code) => {
  console.log(`🛑 Crowdfunding server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down crowdfunding server...');
  crowdfundingProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down crowdfunding server...');
  crowdfundingProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Crowdfunding server started on http://localhost:3000');
console.log('📝 Press Ctrl+C to stop the server');


