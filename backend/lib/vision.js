// backend/lib/vision.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImageAnnotatorClient } from '@google-cloud/vision';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the client so we don’t recreate it
let _client = null;

/**
 * Resolve GOOGLE_APPLICATION_CREDENTIALS to an absolute path and verify it exists.
 * Throw a friendly error if not found.
 */
function getCredsPath() {
  let p = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  p = p.trim();
  if (!p) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS is not set. Put your service-account JSON at e.g. backend/keys/vision-key.json and set the env var to its ABSOLUTE path.'
    );
  }

  // If relative, resolve from project root (two levels up from this file)
  const projectRoot = path.resolve(__dirname, '..'); // backend/
  const abs = path.isAbsolute(p) ? p : path.resolve(projectRoot, p);

  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw new Error(`Vision key not found at: ${abs}`);
  }
  return abs;
}

/**
 * Returns a ready-to-use Vision client. Creates it lazily and once.
 */
export function getVisionClient() {
  if (_client) return _client;
  const credsPath = getCredsPath();

  // Make sure the env var is the absolute path the library expects.
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;

  _client = new ImageAnnotatorClient(); // will read GOOGLE_APPLICATION_CREDENTIALS
  return _client;
}