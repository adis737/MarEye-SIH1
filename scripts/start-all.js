const { spawn } = require('child_process');
const path = require('path');

console.log('🌊 Starting Oceanova with Web3 Crowdfunding Integration and Flask API...');

// Start the main Oceanova server
const oceanovaProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start the crowdfunding server
const crowdfundingDir = path.join(__dirname, '..', 'web3-crowdfunding');
const crowdfundingProcess = spawn('npm', ['run', 'dev:fast'], {
  cwd: crowdfundingDir,
  stdio: 'inherit',
  shell: true
});

// Start the Flask API server
const flaskDir = path.join(__dirname, '..', 'public', 'Ocean_details');
const flaskProcess = spawn('python', ['app.py'], {
  cwd: flaskDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FLASK_PORT: '5000' }
});

// Handle Oceanova process
oceanovaProcess.on('error', (error) => {
  console.error('❌ Error starting Oceanova server:', error);
});

oceanovaProcess.on('close', (code) => {
  console.log(`🛑 Oceanova server exited with code ${code}`);
});

// Handle Crowdfunding process
crowdfundingProcess.on('error', (error) => {
  console.error('❌ Error starting crowdfunding server:', error);
});

crowdfundingProcess.on('close', (code) => {
  console.log(`🛑 Crowdfunding server exited with code ${code}`);
});

// Handle Flask process
flaskProcess.on('error', (error) => {
  console.error('❌ Error starting Flask API server:', error);
});

flaskProcess.on('close', (code) => {
  console.log(`🛑 Flask API server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all servers...');
  oceanovaProcess.kill('SIGINT');
  crowdfundingProcess.kill('SIGINT');
  flaskProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down all servers...');
  oceanovaProcess.kill('SIGTERM');
  crowdfundingProcess.kill('SIGTERM');
  flaskProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Oceanova server started on http://localhost:3000');
console.log('✅ Crowdfunding server started on http://localhost:3002');
console.log('✅ Flask API server started on http://localhost:5000');
console.log('📝 Press Ctrl+C to stop all servers');
