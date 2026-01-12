#!/usr/bin/env tsx

// Debug script to inspect actual API responses

const baseUrl = process.env.OTCS_BASE_URL || 'https://vm-geliopou.eimdemo.com/otcs/cs.exe/api';

async function debug() {
  // Authenticate
  const authRes = await fetch(`${baseUrl}/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: process.env.OTCS_USERNAME || 'Admin',
      password: process.env.OTCS_PASSWORD || 'Opentext1',
    }),
  });

  const authData = await authRes.json();
  const ticket = authData.ticket;
  console.log('Authenticated, ticket:', ticket.substring(0, 20) + '...');

  // Get workspace types with templates
  console.log('\n--- GET /v2/businessworkspacetypes?expand_templates=true ---');
  const typesRes = await fetch(`${baseUrl}/v2/businessworkspacetypes?expand_templates=true`, {
    headers: { 'OTCSTicket': ticket },
  });
  const typesData = await typesRes.json();

  // Show just first few types with full detail
  console.log('\n--- First 3 workspace types ---');
  for (let i = 0; i < 3 && i < typesData.results.length; i++) {
    console.log(JSON.stringify(typesData.results[i], null, 2));
  }

  // Try to get form for workspace type 13 (Customer)
  console.log('\n--- GET /v2/forms/businessworkspaces/create?wksp_type_id=13 ---');
  const formRes = await fetch(`${baseUrl}/v2/forms/businessworkspaces/create?wksp_type_id=13`, {
    headers: { 'OTCSTicket': ticket },
  });
  const formData = await formRes.json();
  console.log('Form response:', JSON.stringify(formData, null, 2).substring(0, 3000));

  // Try POST to create a workspace
  console.log('\n--- POST /v2/businessworkspaces ---');
  const createRes = await fetch(`${baseUrl}/v2/businessworkspaces`, {
    method: 'POST',
    headers: {
      'OTCSTicket': ticket,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      wksp_type_id: '13',
      name: 'Debug Test Workspace',
    }),
  });
  const createData = await createRes.json();
  console.log('Create response:', JSON.stringify(createData, null, 2).substring(0, 2000));
}

debug().catch(console.error);
