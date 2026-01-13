/**
 * Upload misc folder from Desktop to OpenText MCP folder
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { OTCSClient } from '../src/client/otcs-client.js';
import * as fs from 'fs';
import * as path from 'path';

const MISC_FOLDER = '/Users/geliopou/Desktop/misc';
const TARGET_FOLDER_ID = 174718; // MCP folder

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.txt': 'text/plain'
  };
  return types[ext] || 'application/octet-stream';
};

async function uploadMisc() {
  const client = new OTCSClient({ baseUrl: 'https://vm-geliopou.eimdemo.com/otcs/cs.exe/api' });
  await client.authenticate('Admin', 'Opentext1');
  console.log('✓ Authenticated\n');

  // Get files in misc folder (non-recursive, skip directories)
  const entries = fs.readdirSync(MISC_FOLDER, { withFileTypes: true });
  const allFiles = entries
    .filter(e => e.isFile() && !e.name.startsWith('.'))
    .map(e => ({
      name: e.name,
      path: path.join(MISC_FOLDER, e.name),
      size: fs.statSync(path.join(MISC_FOLDER, e.name)).size
    }));

  // Separate into small and large files
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const smallFiles = allFiles.filter(f => f.size < MAX_SIZE);
  const largeFiles = allFiles.filter(f => f.size >= MAX_SIZE);

  console.log(`Files to upload: ${smallFiles.length} (under 50MB)`);
  console.log(`Skipping ${largeFiles.length} large files for speed:`);
  largeFiles.forEach(f => console.log(`  - ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`));
  console.log();

  const results: { file: string; success: boolean; id?: number; error?: string }[] = [];
  const concurrency = 5;
  const startTime = Date.now();

  for (let i = 0; i < smallFiles.length; i += concurrency) {
    const batch = smallFiles.slice(i, i + concurrency);
    const promises = batch.map(async (f) => {
      try {
        const buffer = fs.readFileSync(f.path);
        const result = await client.uploadDocument(TARGET_FOLDER_ID, f.name, buffer, getMimeType(f.path));
        console.log(`✓ ${f.name} (ID: ${result.id}, ${(f.size / 1024).toFixed(0)} KB)`);
        return { file: f.name, success: true, id: result.id };
      } catch (err: any) {
        console.log(`✗ ${f.name} - ${err.message}`);
        return { file: f.name, success: false, error: err.message };
      }
    });
    results.push(...await Promise.all(promises));
  }

  const elapsed = Date.now() - startTime;
  const success = results.filter(r => r.success).length;
  
  console.log();
  console.log('═══════════════════════════════════════════════════════');
  console.log('UPLOAD COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Uploaded: ${success} of ${smallFiles.length} files`);
  console.log(`  Time: ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`  Speed: ${(success / (elapsed / 1000)).toFixed(2)} files/second`);
  console.log(`  Target folder ID: ${TARGET_FOLDER_ID}`);
  console.log();

  await client.logout();
  console.log('✓ Logged out');
}

uploadMisc().catch(console.error);

