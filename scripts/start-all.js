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

// Function to check if virtual environment exists (and is usable)
function hasVirtualEnv(dir) {
  const venvDir = path.join(dir, 'venv');
  const venvPaths = getVenvPaths(dir);
  return fs.existsSync(venvDir) && fs.existsSync(venvPaths.python);
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
    console.log(`🔎 venv python: ${venvPaths.python}`);
    console.log(`🔎 venv pip: ${venvPaths.pip}`);
    // If venv python is missing, recreate the venv first
    if (!fs.existsSync(venvPaths.python)) {
      console.log(`⚠️ Virtual environment seems incomplete (missing python). Recreating venv...`);
      createVirtualEnv(dir)
        .then(() => {
          console.log(`✅ Virtual environment (re)created. Proceeding to install requirements...`);
          // Re-enter the normal flow after recreating
          return installPythonRequirements(dir).then(resolve).catch(reject);
        })
        .catch((e) => reject(e));
      return;
    }

    // If pip.exe not found, try python -m pip first
    const recreateThenRetry = () => {
      console.log(`🔁 Recreating virtual environment due to missing executables...`);
      createVirtualEnv(dir)
        .then(() => installPythonRequirements(dir).then(resolve).catch(reject))
        .catch(reject);
    };

    const tryPipModule = () => new Promise((res, rej) => {
      const p = spawn(venvPaths.python, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
        cwd: dir,
        stdio: 'inherit',
        shell: false
      });
      p.on('error', (err) => {
        console.error(`❌ Error spawning python for pip module: ${err.message}`);
        if (err.code === 'ENOENT') {
          return recreateThenRetry();
        }
        rej(err);
      });
      p.on('close', (code) => {
        if (code === 0) return res();
        console.warn(`⚠️ python -m pip failed. Trying pip._internal entrypoint...`);
        const script = "import sys; from pip._internal.cli.main import main as _main; sys.exit(_main(['install','-r','requirements.txt']))";
        const p2 = spawn(venvPaths.python, ['-c', script], {
          cwd: dir,
          stdio: 'inherit',
          shell: false
        });
        p2.on('error', (err) => {
          console.error(`❌ Error invoking pip._internal: ${err.message}`);
          if (err.code === 'ENOENT') {
            return recreateThenRetry();
          }
          rej(err);
        });
        p2.on('close', (code2) => code2 === 0 ? res() : rej(new Error('pip -m failed')));
      });
    });

    const bootstrapEnsurePip = () => new Promise((res, rej) => {
      const p = spawn(venvPaths.python, ['-m', 'ensurepip', '--upgrade'], {
        cwd: dir,
        stdio: 'inherit',
        shell: false
      });
      p.on('error', (err) => {
        console.error(`❌ Error spawning python for ensurepip: ${err.message}`);
        if (err.code === 'ENOENT') {
          return recreateThenRetry();
        }
        rej(err);
      });
      p.on('close', (code) => code === 0 ? res() : rej(new Error('ensurepip failed')));
    });

    const runPipExe = () => new Promise((res, rej) => {
      const pipArgs = isWindows
        ? ['install', '-r', 'requirements.txt', '--no-warn-script-location', '--disable-pip-version-check']
        : ['install', '-r', 'requirements.txt'];
      const p = spawn(venvPaths.pip, pipArgs, {
        cwd: dir,
        stdio: 'inherit',
        shell: false
      });
      p.on('error', (err) => {
        console.error(`❌ Error spawning pip executable: ${err.message}`);
        if (err.code === 'ENOENT') {
          // Fall back to python -m pip
          return tryPipModule().then(res).catch(rej);
        }
        rej(err);
      });
      p.on('close', (code) => code === 0 ? res() : rej(new Error('pip exe failed')));
    });

    const doInstall = async () => {
      try {
        if (fs.existsSync(venvPaths.pip)) {
          await runPipExe();
          console.log(`✅ Python requirements installed in ${dir}`);
          resolve();
          return;
        }

        console.log(`⚠️ Pip not found at ${venvPaths.pip}, trying python -m pip...`);
        await tryPipModule();
        console.log(`✅ Python requirements installed in ${dir}`);
        resolve();
      } catch (_) {
        try {
          console.log(`🔧 Bootstrapping pip with ensurepip...`);
          await bootstrapEnsurePip();
          console.log(`✅ ensurepip completed. Retrying installation...`);
          await tryPipModule();
          console.log(`✅ Python requirements installed in ${dir}`);
          resolve();
        } catch (e2) {
          console.log(`🔄 Virtual environment appears corrupted. Deleting and recreating...`);
          // Delete the corrupted venv and recreate
          const venvDir = path.join(dir, 'venv');
          if (fs.existsSync(venvDir)) {
            fs.rmSync(venvDir, { recursive: true, force: true });
            console.log(`🗑️ Deleted corrupted venv at ${venvDir}`);
          }
          
          try {
            await createVirtualEnv(dir);
            console.log(`✅ Fresh virtual environment created. Retrying installation...`);
            await installPythonRequirements(dir);
            resolve();
          } catch (e3) {
            reject(new Error(`Failed to recreate venv and install requirements: ${e3.message}`));
          }
        }
      }
    };

    doInstall();
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
    shell: false,
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
