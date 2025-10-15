const { spawn } = require('child_process');
const path = require('path');

console.log('🐍 Starting Flask backend server...');

// Check if Flask app exists
const fs = require('fs');
const flaskAppPath = path.join(process.cwd(), 'app.py');

if (!fs.existsSync(flaskAppPath)) {
  console.log('⚠️  No Flask app found. Creating a basic Flask server...');
  
  // Create a basic Flask app
  const basicFlaskApp = `from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "MarEye Flask Backend is running!"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "service": "MarEye Flask Backend"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
`;

  fs.writeFileSync(flaskAppPath, basicFlaskApp);
  console.log('✅ Created basic Flask app at app.py');
}

// Start Flask server
const flaskProcess = spawn('python', ['app.py'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

flaskProcess.on('error', (err) => {
  console.error('❌ Failed to start Flask server:', err);
  console.log('💡 Make sure Python and Flask are installed: pip install flask flask-cors');
  process.exit(1);
});

flaskProcess.on('close', (code) => {
  console.log(`Flask server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Flask server...');
  flaskProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Flask server...');
  flaskProcess.kill('SIGTERM');
});

