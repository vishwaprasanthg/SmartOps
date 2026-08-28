/**
 * Chronos-2 Forecasting Service
 * Feature 01: Volume Forecasting
 * 
 * Manages local execution of the Chronos-2 transformer model for Inbound, Outbound,
 * and Inventory volume predictions.
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

let pythonProcess = null;
let rl = null;
let pendingQueue = [];
let isStarting = false;

const PYTHON_SCRIPT_PATH = path.join(__dirname, '../ml/chronos_runner.py');

/**
 * Initializes or retrieves the persistent Chronos-2 Python worker.
 */
function getWorkerProcess() {
  if (pythonProcess && !pythonProcess.killed) {
    return pythonProcess;
  }

  if (isStarting) {
    return null;
  }

  isStarting = true;

  console.log('[Chronos-2 Service] Initializing local Chronos-2 model worker...');

  pythonProcess = spawn('python', [PYTHON_SCRIPT_PATH], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  rl = readline.createInterface({
    input: pythonProcess.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    // Ignore any non-JSON log lines from HuggingFace/transformers
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('{')) {
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (pendingQueue.length > 0) {
        const { resolve, reject } = pendingQueue.shift();
        if (parsed.success) {
          resolve(parsed);
        } else {
          reject(new Error(parsed.error || 'Chronos-2 forecasting failed. Please verify the historical data and try again.'));
        }
      }
    } catch (e) {
      console.error('[Chronos-2 Service] Error parsing response:', e.message);
      if (pendingQueue.length > 0) {
        const { reject } = pendingQueue.shift();
        reject(new Error('Failed to parse Chronos-2 model response.'));
      }
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    // Only log if it contains critical errors
    if (msg.includes('Traceback') || msg.includes('Error:')) {
      console.error('[Chronos-2 Service Error]', msg);
    }
  });

  pythonProcess.on('exit', (code) => {
    console.log(`[Chronos-2 Service] Python worker exited with code ${code}`);
    pythonProcess = null;
    isStarting = false;
    // Reject any remaining pending items
    while (pendingQueue.length > 0) {
      const { reject } = pendingQueue.shift();
      reject(new Error('Chronos-2 forecasting model is unavailable.'));
    }
  });

  isStarting = false;
  return pythonProcess;
}

/**
 * Performs Chronos-2 inference for a requested horizon and historical series.
 * 
 * @param {object} params
 * @param {number} params.horizon Number of days to forecast
 * @param {Array<number>} params.inbound Inbound historical series
 * @param {Array<number>} params.outbound Outbound historical series
 * @param {Array<number>} params.inventory Inventory historical series
 * @returns {Promise<object>} Predictions object { inbound: [...], outbound: [...], inventory: [...] }
 */
async function forecastWithChronos({ horizon, inbound, outbound, inventory }) {
  return new Promise((resolve, reject) => {
    try {
      const worker = getWorkerProcess();
      if (!worker) {
        return reject(new Error('Chronos-2 forecasting model is unavailable.'));
      }

      const payload = {
        horizon: Number(horizon),
        series: {
          inbound: inbound.map(Number),
          outbound: outbound.map(Number),
          inventory: inventory.map(Number)
        }
      };

      pendingQueue.push({ resolve, reject });
      worker.stdin.write(JSON.stringify(payload) + '\n');
    } catch (err) {
      reject(new Error(`Chronos-2 forecasting failed: ${err.message}`));
    }
  });
}

module.exports = {
  forecastWithChronos,
  getWorkerProcess
};
