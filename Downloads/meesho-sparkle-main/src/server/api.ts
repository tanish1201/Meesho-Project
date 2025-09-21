import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import Database from 'sqlite3';

const db = new Database.Database('./catalog.sqlite');

export async function runPythonAnalysis(payload: any): Promise<any> {
  const tempDir = './temp';
  const uploadsDir = './uploads';
  const outputsDir = './out';
  
  // Ensure directories exist
  await Promise.all([
    fs.mkdir(tempDir, { recursive: true }),
    fs.mkdir(uploadsDir, { recursive: true }),
    fs.mkdir(outputsDir, { recursive: true })
  ]);

  const tempFile = path.join(tempDir, `payload_${randomUUID()}.json`);
  
  try {
    // Write payload to temp file
    await fs.writeFile(tempFile, JSON.stringify(payload, null, 2));
    
    const pythonCmd = process.env.PY_CMD || 'python';
    const pythonEntry = process.env.PY_ENTRY || './main.py';
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonCmd, [pythonEntry, '--input', tempFile], {
        env: { 
          ...process.env, 
          GEMINI_API_KEY: process.env.GEMINI_API_KEY 
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Set timeout
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python process timed out after 30 seconds'));
      }, 30000);
      
      pythonProcess.on('close', async (code) => {
        clearTimeout(timeout);
        
        try {
          // Clean up temp file
          await fs.unlink(tempFile);
        } catch (e) {
          console.warn('Failed to clean up temp file:', e);
        }
        
        if (code !== 0) {
          console.error('Python stderr:', stderr);
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
          return;
        }
        
        try {
          // Parse the last JSON object from stdout
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          resolve(result);
        } catch (e) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error('Failed to parse Python output as JSON'));
        }
      });
      
      pythonProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

export function getHistoryFromDb(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT run_id, product_id, route, created_at, final_score FROM runs ORDER BY created_at DESC LIMIT 50',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

export function getHistoryDetailFromDb(runId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM runs WHERE run_id = ?',
      [runId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Run not found'));
        } else {
          try {
            // Parse JSON fields
            const result = {
              ...row,
              best: typeof row.best === 'string' ? JSON.parse(row.best) : row.best,
              candidates: typeof row.candidates === 'string' ? JSON.parse(row.candidates) : row.candidates,
              feedback: typeof row.feedback === 'string' ? JSON.parse(row.feedback) : row.feedback,
            };
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse stored data'));
          }
        }
      }
    );
  });
}