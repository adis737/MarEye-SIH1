const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🌊 Starting Oceanova with Web3 Crowdfunding Integration and Flask API...');

// Platform detection
const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';
const isMac = os.platform() === 'darwin';

console.log(`🖥️ Platform detected: ${os.platform()}`);

// Platform-specific paths
function getVenvPaths(dir) {
  if (isWindows) {
    return {
      python: path.join(dir, 'venv', 'Scripts', 'python.exe'),
      pip: path.join(dir, 'venv', 'Scripts', 'pip.exe')
    };
  } else {
    // Linux and macOS
    return {
      python: path.join(dir, 'venv', 'bin', 'python'),
      pip: path.join(dir, 'venv', 'bin', 'pip')
    };
  }
}

// Function to check if directory has node_modules
function hasNodeModules(dir) {
  return fs.existsSync(path.join(dir, 'node_modules'));
}

// Function to check if Python requirements are installed
function checkPythonRequirements(dir) {
  const requirementsPath = path.join(dir, 'requirements.txt');
  return fs.existsSync(requirementsPath);
}

// Function to install npm dependencies
function installNpmDependencies(dir) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Installing dependencies in ${dir}...`);
    const installProcess = spawn('npm', ['install'], {
      cwd: dir,
      stdio: 'inherit',
      shell: true
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Dependencies installed in ${dir}`);
        resolve();
      } else {
        reject(new Error(`Failed to install dependencies in ${dir}`));
      }
    });
  });
}

// Function to check if virtual environment exists
function hasVirtualEnv(dir) {
  return fs.existsSync(path.join(dir, 'venv'));
}

// Function to get Python command based on platform
function getPythonCommand() {
  if (isWindows) {
    return 'python'; // Windows typically uses 'python'
  } else {
    return 'python3'; // Linux/macOS typically uses 'python3'
  }
}

// Function to create virtual environment
function createVirtualEnv(dir) {
  return new Promise((resolve, reject) => {
    console.log(`🐍 Creating Python virtual environment in ${dir}...`);
    const pythonCmd = getPythonCommand();
    
    const venvProcess = spawn(pythonCmd, ['-m', 'venv', 'venv'], {
      cwd: dir,
      stdio: 'inherit',
      shell: true
    });
    
    venvProcess.on('error', (error) => {
      console.error(`❌ Error creating virtual environment: ${error.message}`);
      reject(new Error(`Failed to create virtual environment. Please ensure Python is installed and accessible. Error: ${error.message}`));
    });
    
    venvProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Virtual environment created in ${dir}`);
        resolve();
      } else {
        reject(new Error(`Failed to create virtual environment in ${dir}. Exit code: ${code}. Make sure Python is installed and accessible.`));
      }
    });
  });
}

// Function to install Python requirements in virtual environment
function installPythonRequirements(dir) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Installing Python requirements in virtual environment...`);
    const venvPaths = getVenvPaths(dir);
    
    // Check if pip exists
    if (!fs.existsSync(venvPaths.pip)) {
      console.log(`⚠️ Pip not found at ${venvPaths.pip}, trying alternative approach...`);
      // Try using python -m pip instead
      const pythonCmd = isWindows ? venvPaths.python : venvPaths.python;
      const installProcess = spawn(pythonCmd, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
        cwd: dir,
        stdio: 'inherit',
        shell: true
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Python requirements installed in ${dir}`);
          resolve();
        } else {
          reject(new Error(`Failed to install Python requirements in ${dir}. Please check if Python and pip are properly installed.`));
        }
      });
      return;
    }
    
    // Windows-specific pip installation with additional flags
    const pipArgs = isWindows 
      ? ['install', '-r', 'requirements.txt', '--no-warn-script-location', '--disable-pip-version-check']
      : ['install', '-r', 'requirements.txt'];
    
    const installProcess = spawn(venvPaths.pip, pipArgs, {
      cwd: dir,
      stdio: 'inherit',
      shell: true
    });
    
    installProcess.on('error', (error) => {
      console.error(`❌ Error running pip: ${error.message}`);
      // Fallback to python -m pip
      console.log(`🔄 Trying fallback method: python -m pip...`);
      const fallbackProcess = spawn(venvPaths.python, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
        cwd: dir,
        stdio: 'inherit',
        shell: true
      });
      
      fallbackProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Python requirements installed in ${dir} (using fallback method)`);
          resolve();
        } else {
          reject(new Error(`Failed to install Python requirements in ${dir}. Please ensure Python and pip are properly installed and accessible.`));
        }
      });
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Python requirements installed in ${dir}`);
        resolve();
      } else {
        reject(new Error(`Failed to install Python requirements in ${dir}. Exit code: ${code}`));
      }
    });
  });
}

// Setup function
async function setupDependencies() {
  try {
    // Check and install web3-crowdfunding dependencies
    const crowdfundingDir = path.join(__dirname, '..', 'web3-crowdfunding');
    if (!hasNodeModules(crowdfundingDir)) {
      await installNpmDependencies(crowdfundingDir);
    } else {
      console.log('✅ Web3-crowdfunding dependencies already installed');
    }

    // Check and setup Flask dependencies with virtual environment
    const flaskDir = path.join(__dirname, '..', 'public', 'Ocean_details');
    if (checkPythonRequirements(flaskDir)) {
      if (!hasVirtualEnv(flaskDir)) {
        await createVirtualEnv(flaskDir);
      } else {
        console.log('✅ Virtual environment already exists');
      }
      await installPythonRequirements(flaskDir);
    } else {
      console.log('⚠️ No requirements.txt found in Flask directory');
    }

    console.log('🚀 All dependencies ready! Starting servers...');
    startServers();
  } catch (error) {
    console.error('❌ Error setting up dependencies:', error);
    process.exit(1);
  }
}

// Function to start all servers
function startServers() {
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

  // Start the Flask API server using virtual environment
  const flaskDir = path.join(__dirname, '..', 'public', 'Ocean_details');
  const venvPaths = getVenvPaths(flaskDir);
  const flaskProcess = spawn(venvPaths.python, ['app.py'], {
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
}

// Start the setup process
setupDependencies();
