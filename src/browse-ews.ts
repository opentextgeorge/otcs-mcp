/**
 * Browse Enterprise Workspace
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { OTCSClient } from './client/otcs-client.js';

const client = new OTCSClient({ baseUrl: 'https://vm-geliopou.eimdemo.com/otcs/cs.exe/api' });

async function main() {
  await client.authenticate('Admin', 'Opentext1');
  const contents = await client.getSubnodes(12727, { limit: 100 }); // Sales Contracts folder

  console.log('Enterprise Workspace: ' + contents.folder.name);
  console.log('Total items: ' + contents.paging.total_count);
  console.log('\nItems:');
  console.log('─'.repeat(90));

  contents.items.forEach((item, i) => {
    const typeIcon = item.container ? '📁' : '📄';
    const size = item.container_size ? `(${item.container_size} items)` : '';
    console.log(
      `${(i+1).toString().padStart(2)}. ${typeIcon} ${item.name.padEnd(35)} ${item.type_name.padEnd(22)} ID: ${item.id.toString().padEnd(8)} ${size}`
    );
  });
}

main().catch(console.error);
