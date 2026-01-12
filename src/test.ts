/**
 * Test script to verify OTCS API connectivity
 * Run with: npm test
 */

// Allow self-signed certificates for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { OTCSClient } from './client/otcs-client.js';

const BASE_URL = 'https://vm-geliopou.eimdemo.com/otcs/cs.exe/api';
const USERNAME = 'Admin';
const PASSWORD = 'Opentext1';

async function runTests() {
  console.log('=== OTCS MCP Server Tests ===\n');

  const client = new OTCSClient({ baseUrl: BASE_URL });

  // Test 1: Authentication
  console.log('Test 1: Authentication');
  try {
    const ticket = await client.authenticate(USERNAME, PASSWORD);
    console.log(`  ✓ Authenticated successfully`);
    console.log(`  Ticket: ${ticket.substring(0, 30)}...`);
  } catch (error) {
    console.log(`  ✗ Authentication failed: ${error}`);
    return;
  }

  // Test 2: Session validation
  console.log('\nTest 2: Session Validation');
  try {
    const isValid = await client.validateSession();
    console.log(`  ✓ Session is valid: ${isValid}`);
  } catch (error) {
    console.log(`  ✗ Session validation failed: ${error}`);
  }

  // Test 3: Get Enterprise Workspace (ID 2000)
  console.log('\nTest 3: Get Enterprise Workspace');
  try {
    const node = await client.getNode(2000);
    console.log(`  ✓ Retrieved node:`);
    console.log(`    ID: ${node.id}`);
    console.log(`    Name: ${node.name}`);
    console.log(`    Type: ${node.type_name}`);
    console.log(`    Container: ${node.container}`);
  } catch (error) {
    console.log(`  ✗ Failed to get node: ${error}`);
  }

  // Test 4: Browse Enterprise Workspace
  console.log('\nTest 4: Browse Enterprise Workspace');
  try {
    const contents = await client.getSubnodes(2000, { limit: 10 });
    console.log(`  ✓ Retrieved folder contents:`);
    console.log(`    Folder: ${contents.folder.name}`);
    console.log(`    Items: ${contents.items.length}`);
    console.log(`    Total count: ${contents.paging.total_count}`);
    if (contents.items.length > 0) {
      console.log('    First items:');
      contents.items.slice(0, 5).forEach(item => {
        console.log(`      - ${item.name} (${item.type_name}, ID: ${item.id})`);
      });
    }
  } catch (error) {
    console.log(`  ✗ Failed to browse: ${error}`);
  }

  // Test 5: Create a test folder
  console.log('\nTest 5: Create Test Folder');
  let testFolderId: number | null = null;
  try {
    const testFolderName = `MCP_Test_${Date.now()}`;
    const result = await client.createFolder(2000, testFolderName, 'Created by MCP test script');
    testFolderId = result.id;
    console.log(`  ✓ Created folder:`);
    console.log(`    ID: ${result.id}`);
    console.log(`    Name: ${testFolderName}`);
  } catch (error) {
    console.log(`  ✗ Failed to create folder: ${error}`);
  }

  // Test 6: Create nested folder path
  if (testFolderId) {
    console.log('\nTest 6: Create Nested Folder Path');
    try {
      const result = await client.createFolderPath(testFolderId, '2024/Q1/Reports');
      console.log(`  ✓ Created folder path:`);
      console.log(`    Folders created: ${result.folders.length}`);
      console.log(`    Leaf folder ID: ${result.leafId}`);
      result.folders.forEach(f => {
        console.log(`      - ${f.name} (ID: ${f.id})`);
      });
    } catch (error) {
      console.log(`  ✗ Failed to create folder path: ${error}`);
    }
  }

  // Test 7: Upload a test document
  if (testFolderId) {
    console.log('\nTest 7: Upload Test Document');
    try {
      const testContent = 'Hello from OTCS MCP Server!\n\nThis is a test document.';
      const result = await client.uploadDocument(
        testFolderId,
        'test_document.txt',
        Buffer.from(testContent),
        'text/plain',
        'Test document created by MCP server'
      );
      console.log(`  ✓ Uploaded document:`);
      console.log(`    ID: ${result.id}`);
      console.log(`    Name: test_document.txt`);
    } catch (error) {
      console.log(`  ✗ Failed to upload document: ${error}`);
    }
  }

  // Test 8: Search for nodes
  console.log('\nTest 8: Search');
  try {
    const results = await client.searchNodes('MCP_Test', { limit: 10 });
    console.log(`  ✓ Search results:`);
    console.log(`    Total: ${results.total_count}`);
    results.results.forEach(item => {
      console.log(`      - ${item.name} (${item.type_name})`);
    });
  } catch (error) {
    console.log(`  ✗ Search failed: ${error}`);
  }

  // Cleanup: Delete test folder
  if (testFolderId) {
    console.log('\nCleanup: Delete Test Folder');
    try {
      await client.deleteNode(testFolderId);
      console.log(`  ✓ Deleted test folder ${testFolderId}`);
    } catch (error) {
      console.log(`  ✗ Failed to delete test folder: ${error}`);
    }
  }

  // Test 9: Logout
  console.log('\nTest 9: Logout');
  try {
    await client.logout();
    console.log(`  ✓ Logged out successfully`);
    console.log(`  Is authenticated: ${client.isAuthenticated()}`);
  } catch (error) {
    console.log(`  ✗ Logout failed: ${error}`);
  }

  console.log('\n=== Tests Complete ===');
}

runTests().catch(console.error);
