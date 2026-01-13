/**
 * Test script for new batch upload functionality
 * Tests: otcs_upload_folder, otcs_upload_batch, otcs_upload_with_metadata
 * Run with: npx tsx tests/test-uploads.ts
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { OTCSClient } from '../src/client/otcs-client.js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://vm-geliopou.eimdemo.com/otcs/cs.exe/api';
const USERNAME = 'Admin';
const PASSWORD = 'Opentext1';

// Test directory setup
const TEST_DIR = '/tmp/otcs-upload-test';
const TEST_FILES_COUNT = 20;

interface UploadResult {
  file: string;
  success: boolean;
  node_id?: number;
  error?: string;
  category_error?: string;
}

// Utility to generate test files
function setupTestFiles(count: number, extensions: string[] = ['.txt', '.pdf', '.docx']) {
  // Create test directory
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
  
  // Create subdirectory for recursive test
  const subDir = path.join(TEST_DIR, 'subfolder');
  fs.mkdirSync(subDir, { recursive: true });
  
  const files: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const ext = extensions[i % extensions.length];
    const fileName = `test_file_${i + 1}${ext}`;
    const filePath = i < count - 5 ? path.join(TEST_DIR, fileName) : path.join(subDir, fileName);
    
    // Create file with some content
    const content = `Test file ${i + 1}\nCreated: ${new Date().toISOString()}\nThis is test content for upload testing.\n${'Lorem ipsum '.repeat(50)}`;
    fs.writeFileSync(filePath, content);
    files.push(filePath);
  }
  
  console.log(`  Created ${count} test files in ${TEST_DIR}`);
  console.log(`  - Main folder: ${count - 5} files`);
  console.log(`  - Subfolder: 5 files`);
  
  return files;
}

// Cleanup test files
function cleanupTestFiles() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
}

// Helper function to get mime type
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Simulate the upload folder logic (mirrors index.ts implementation)
async function testUploadFolder(
  client: OTCSClient,
  parentId: number,
  folderPath: string,
  options: {
    extensions?: string[];
    recursive?: boolean;
    concurrency?: number;
    category_id?: number;
    category_values?: Record<string, unknown>;
  } = {}
): Promise<{
  success: boolean;
  uploaded: number;
  failed: number;
  total_files: number;
  elapsed_ms: number;
  files_per_second: string;
  results: UploadResult[];
  errors?: UploadResult[];
}> {
  const { extensions, recursive = false, concurrency = 5, category_id, category_values } = options;

  if (!fs.existsSync(folderPath)) throw new Error(`Folder not found: ${folderPath}`);
  if (!fs.statSync(folderPath).isDirectory()) throw new Error(`Path is not a directory: ${folderPath}`);

  // Collect all files to upload
  const filesToUpload: string[] = [];
  const collectFiles = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && recursive) {
        collectFiles(fullPath);
      } else if (entry.isFile()) {
        if (extensions && extensions.length > 0) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!extensions.map(e => e.toLowerCase()).includes(ext)) continue;
        }
        if (!entry.name.startsWith('.')) {
          filesToUpload.push(fullPath);
        }
      }
    }
  };
  collectFiles(folderPath);

  if (filesToUpload.length === 0) {
    return { success: true, uploaded: 0, failed: 0, total_files: 0, elapsed_ms: 0, files_per_second: '0', results: [] };
  }

  const maxConcurrency = Math.min(concurrency, 10);
  const results: UploadResult[] = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < filesToUpload.length; i += maxConcurrency) {
    const batch = filesToUpload.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(async (filePath) => {
      try {
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const mimeType = getMimeType(filePath);
        const result = await client.uploadDocument(parentId, fileName, buffer, mimeType);
        
        if (category_id && result.id) {
          try {
            await client.addCategory(result.id, category_id, category_values);
          } catch (catError) {
            return { file: fileName, success: true, node_id: result.id, category_error: String(catError) };
          }
        }
        
        return { file: fileName, success: true, node_id: result.id };
      } catch (error) {
        return { file: path.basename(filePath), success: false, error: String(error) };
      }
    });
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Progress indicator
    process.stdout.write(`\r    Progress: ${Math.min(i + maxConcurrency, filesToUpload.length)}/${filesToUpload.length} files`);
  }
  console.log(); // New line after progress

  const elapsed = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);

  return {
    success: true,
    uploaded: successful,
    failed: failed.length,
    total_files: filesToUpload.length,
    elapsed_ms: elapsed,
    files_per_second: (successful / (elapsed / 1000)).toFixed(2),
    results,
    errors: failed.length > 0 ? failed : undefined,
  };
}

// Simulate upload batch logic
async function testUploadBatch(
  client: OTCSClient,
  parentId: number,
  filePaths: string[],
  options: { concurrency?: number } = {}
): Promise<{
  success: boolean;
  uploaded: number;
  failed: number;
  elapsed_ms: number;
  files_per_second: string;
  results: UploadResult[];
}> {
  const { concurrency = 5 } = options;
  const maxConcurrency = Math.min(concurrency, 10);
  const results: UploadResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < filePaths.length; i += maxConcurrency) {
    const batch = filePaths.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(async (filePath) => {
      try {
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const mimeType = getMimeType(filePath);
        const result = await client.uploadDocument(parentId, fileName, buffer, mimeType);
        return { file: fileName, success: true, node_id: result.id };
      } catch (error) {
        return { file: path.basename(filePath), success: false, error: String(error) };
      }
    });
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  const elapsed = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;

  return {
    success: true,
    uploaded: successful,
    failed: results.filter(r => !r.success).length,
    elapsed_ms: elapsed,
    files_per_second: (successful / (elapsed / 1000)).toFixed(2),
    results,
  };
}

// Sequential upload for comparison
async function testSequentialUpload(
  client: OTCSClient,
  parentId: number,
  filePaths: string[]
): Promise<{ elapsed_ms: number; uploaded: number; files_per_second: string }> {
  const startTime = Date.now();
  let uploaded = 0;

  for (const filePath of filePaths) {
    try {
      const buffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = getMimeType(filePath);
      await client.uploadDocument(parentId, fileName, buffer, mimeType);
      uploaded++;
      process.stdout.write(`\r    Progress: ${uploaded}/${filePaths.length} files`);
    } catch (error) {
      // Continue on error
    }
  }
  console.log();

  const elapsed = Date.now() - startTime;
  return {
    elapsed_ms: elapsed,
    uploaded,
    files_per_second: (uploaded / (elapsed / 1000)).toFixed(2),
  };
}

async function runTests() {
  console.log('=== OTCS Batch Upload Tests ===\n');

  const client = new OTCSClient({ baseUrl: BASE_URL });

  // Authenticate
  console.log('Authenticating...');
  try {
    await client.authenticate(USERNAME, PASSWORD);
    console.log('  ✓ Authenticated successfully\n');
  } catch (error) {
    console.log(`  ✗ Authentication failed: ${error}`);
    return;
  }

  // Create test folder in OpenText
  console.log('Creating test folder in OpenText...');
  let testFolderId: number;
  let testFolderSequentialId: number;
  let testFolderBatchId: number;
  let testFolderParallelId: number;
  
  try {
    const mainFolder = await client.createFolder(2000, `Upload_Test_${Date.now()}`, 'Batch upload test');
    testFolderId = mainFolder.id;
    
    const seqFolder = await client.createFolder(testFolderId, 'Sequential_Upload', 'Sequential upload test');
    testFolderSequentialId = seqFolder.id;
    
    const batchFolder = await client.createFolder(testFolderId, 'Batch_Upload', 'Batch upload test');
    testFolderBatchId = batchFolder.id;
    
    const parallelFolder = await client.createFolder(testFolderId, 'Parallel_Upload', 'Parallel folder upload test');
    testFolderParallelId = parallelFolder.id;
    
    console.log(`  ✓ Created test folders under ID ${testFolderId}\n`);
  } catch (error) {
    console.log(`  ✗ Failed to create test folder: ${error}`);
    return;
  }

  // Setup test files
  console.log('Setting up test files...');
  const testFiles = setupTestFiles(TEST_FILES_COUNT, ['.txt', '.pdf', '.docx']);
  console.log();

  // ========== TEST 1: Sequential Upload (Baseline) ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: Sequential Upload (Baseline - 10 files)');
  console.log('═══════════════════════════════════════════════════════');
  const sequentialFiles = testFiles.slice(0, 10);
  try {
    const seqResult = await testSequentialUpload(client, testFolderSequentialId, sequentialFiles);
    console.log(`  ✓ Sequential upload complete:`);
    console.log(`    Files uploaded: ${seqResult.uploaded}`);
    console.log(`    Time: ${seqResult.elapsed_ms}ms (${(seqResult.elapsed_ms / 1000).toFixed(1)}s)`);
    console.log(`    Speed: ${seqResult.files_per_second} files/second`);
    console.log(`    Avg per file: ${(seqResult.elapsed_ms / seqResult.uploaded).toFixed(0)}ms`);
  } catch (error) {
    console.log(`  ✗ Sequential upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 2: Batch Upload (Same 10 files, parallel) ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 2: Batch Upload (10 files, concurrency=5)');
  console.log('═══════════════════════════════════════════════════════');
  try {
    const batchResult = await testUploadBatch(client, testFolderBatchId, sequentialFiles, { concurrency: 5 });
    console.log(`  ✓ Batch upload complete:`);
    console.log(`    Files uploaded: ${batchResult.uploaded}`);
    console.log(`    Time: ${batchResult.elapsed_ms}ms (${(batchResult.elapsed_ms / 1000).toFixed(1)}s)`);
    console.log(`    Speed: ${batchResult.files_per_second} files/second`);
    console.log(`    Avg per file: ${(batchResult.elapsed_ms / batchResult.uploaded).toFixed(0)}ms`);
    if (batchResult.failed > 0) {
      console.log(`    Failed: ${batchResult.failed}`);
    }
  } catch (error) {
    console.log(`  ✗ Batch upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 3: Folder Upload (all files) ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log(`TEST 3: Folder Upload (${TEST_FILES_COUNT} files, main folder only)`);
  console.log('═══════════════════════════════════════════════════════');
  try {
    const folderResult = await testUploadFolder(client, testFolderParallelId, TEST_DIR, {
      recursive: false,
      concurrency: 5,
    });
    console.log(`  ✓ Folder upload complete:`);
    console.log(`    Files found: ${folderResult.total_files}`);
    console.log(`    Files uploaded: ${folderResult.uploaded}`);
    console.log(`    Time: ${folderResult.elapsed_ms}ms (${(folderResult.elapsed_ms / 1000).toFixed(1)}s)`);
    console.log(`    Speed: ${folderResult.files_per_second} files/second`);
    if (folderResult.failed > 0) {
      console.log(`    Failed: ${folderResult.failed}`);
      folderResult.errors?.forEach(e => console.log(`      - ${e.file}: ${e.error}`));
    }
  } catch (error) {
    console.log(`  ✗ Folder upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 4: Folder Upload with Recursion ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 4: Folder Upload with Recursion (includes subfolder)');
  console.log('═══════════════════════════════════════════════════════');
  // Create a new folder for this test
  let recursiveTestFolderId: number;
  try {
    const recFolder = await client.createFolder(testFolderId, 'Recursive_Upload', 'Recursive folder upload test');
    recursiveTestFolderId = recFolder.id;
    
    const folderResult = await testUploadFolder(client, recursiveTestFolderId, TEST_DIR, {
      recursive: true,
      concurrency: 5,
    });
    console.log(`  ✓ Recursive folder upload complete:`);
    console.log(`    Files found: ${folderResult.total_files}`);
    console.log(`    Files uploaded: ${folderResult.uploaded}`);
    console.log(`    Time: ${folderResult.elapsed_ms}ms (${(folderResult.elapsed_ms / 1000).toFixed(1)}s)`);
    console.log(`    Speed: ${folderResult.files_per_second} files/second`);
  } catch (error) {
    console.log(`  ✗ Recursive folder upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 5: Extension Filtering ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 5: Folder Upload with Extension Filter (.txt only)');
  console.log('═══════════════════════════════════════════════════════');
  let filterTestFolderId: number;
  try {
    const filterFolder = await client.createFolder(testFolderId, 'Filtered_Upload', 'Filtered folder upload test');
    filterTestFolderId = filterFolder.id;
    
    const folderResult = await testUploadFolder(client, filterTestFolderId, TEST_DIR, {
      recursive: true,
      extensions: ['.txt'],
      concurrency: 5,
    });
    console.log(`  ✓ Filtered folder upload complete:`);
    console.log(`    Files found (txt only): ${folderResult.total_files}`);
    console.log(`    Files uploaded: ${folderResult.uploaded}`);
    console.log(`    Time: ${folderResult.elapsed_ms}ms (${(folderResult.elapsed_ms / 1000).toFixed(1)}s)`);
  } catch (error) {
    console.log(`  ✗ Filtered folder upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 6: High Concurrency ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 6: High Concurrency Test (concurrency=10)');
  console.log('═══════════════════════════════════════════════════════');
  let highConcurrencyFolderId: number;
  try {
    const hcFolder = await client.createFolder(testFolderId, 'High_Concurrency', 'High concurrency test');
    highConcurrencyFolderId = hcFolder.id;
    
    const folderResult = await testUploadFolder(client, highConcurrencyFolderId, TEST_DIR, {
      recursive: true,
      concurrency: 10,
    });
    console.log(`  ✓ High concurrency upload complete:`);
    console.log(`    Files uploaded: ${folderResult.uploaded}`);
    console.log(`    Time: ${folderResult.elapsed_ms}ms (${(folderResult.elapsed_ms / 1000).toFixed(1)}s)`);
    console.log(`    Speed: ${folderResult.files_per_second} files/second`);
  } catch (error) {
    console.log(`  ✗ High concurrency upload failed: ${error}`);
  }
  console.log();

  // ========== TEST 7: Upload with Metadata ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 7: Upload with Metadata (single file with category)');
  console.log('═══════════════════════════════════════════════════════');
  try {
    const testFilePath = testFiles[0];
    const buffer = fs.readFileSync(testFilePath);
    const fileName = path.basename(testFilePath);
    const mimeType = getMimeType(testFilePath);
    
    const startTime = Date.now();
    const uploadResult = await client.uploadDocument(testFolderId, `metadata_test_${fileName}`, buffer, mimeType, 'Test with metadata');
    const elapsed = Date.now() - startTime;
    
    console.log(`  ✓ Upload with metadata complete:`);
    console.log(`    Document ID: ${uploadResult.id}`);
    console.log(`    Time: ${elapsed}ms`);
    console.log(`    Note: Category application would follow (not tested without valid category ID)`);
  } catch (error) {
    console.log(`  ✗ Upload with metadata failed: ${error}`);
  }
  console.log();

  // ========== SUMMARY ==========
  console.log('═══════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Test folder ID: ${testFolderId}`);
  console.log(`  Location: Enterprise Workspace > Upload_Test_*`);
  console.log(`  All uploaded files are preserved for inspection.`);
  console.log();

  // Cleanup test files from local filesystem
  console.log('Cleaning up local test files...');
  cleanupTestFiles();
  console.log('  ✓ Local test files cleaned up');
  console.log();

  // Logout
  console.log('Logging out...');
  try {
    await client.logout();
    console.log('  ✓ Logged out successfully');
  } catch (error) {
    console.log(`  ✗ Logout failed: ${error}`);
  }

  console.log('\n=== Tests Complete ===');
}

runTests().catch(console.error);

