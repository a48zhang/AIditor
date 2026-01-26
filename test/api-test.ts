// Simple API test examples
// To run these tests, you need a deployed or local dev instance

export const testMaterialsAPI = async (baseUrl: string) => {
  console.log('\n=== Testing Materials API ===\n');

  // Test 1: Create material
  console.log('1. Creating a new material...');
  const createResponse = await fetch(`${baseUrl}/api/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Article Title',
      body: 'This is a test article body with some content.',
      source: 'https://example.com/article',
      tags: 'test,api,demo',
      status: 'pending',
    }),
  });
  const created = await createResponse.json();
  console.log('Created:', created);
  const materialId = created.data?.id;

  // Test 2: List materials
  console.log('\n2. Listing materials...');
  const listResponse = await fetch(`${baseUrl}/api/materials?limit=5`);
  const list = await listResponse.json();
  console.log('Materials list:', list);

  // Test 3: Get specific material
  if (materialId) {
    console.log('\n3. Getting material by ID...');
    const getResponse = await fetch(`${baseUrl}/api/materials/${materialId}`);
    const material = await getResponse.json();
    console.log('Material:', material);

    // Test 4: Update material
    console.log('\n4. Updating material status...');
    const updateResponse = await fetch(`${baseUrl}/api/materials/${materialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'processed',
      }),
    });
    const updated = await updateResponse.json();
    console.log('Updated:', updated);
  }

  // Test 5: List with filters
  console.log('\n5. Listing materials with status filter...');
  const filteredResponse = await fetch(`${baseUrl}/api/materials?status=processed`);
  const filtered = await filteredResponse.json();
  console.log('Filtered materials:', filtered);
};

export const testToPublishAPI = async (baseUrl: string) => {
  console.log('\n=== Testing To-Publish API ===\n');

  // Test 1: Create to-publish record
  console.log('1. Creating a new to-publish record...');
  const createResponse = await fetch(`${baseUrl}/api/to-publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      final_title: 'Final Article Title',
      final_body: 'This is the final processed article ready for publication.',
      platform: 'wechat',
      review_status: 'pending',
    }),
  });
  const created = await createResponse.json();
  console.log('Created:', created);
  const recordId = created.data?.id;

  // Test 2: List to-publish records
  console.log('\n2. Listing to-publish records...');
  const listResponse = await fetch(`${baseUrl}/api/to-publish?limit=5`);
  const list = await listResponse.json();
  console.log('To-publish list:', list);

  // Test 3: Get specific record
  if (recordId) {
    console.log('\n3. Getting to-publish record by ID...');
    const getResponse = await fetch(`${baseUrl}/api/to-publish/${recordId}`);
    const record = await getResponse.json();
    console.log('Record:', record);

    // Test 4: Update review status
    console.log('\n4. Updating review status to approved...');
    const updateResponse = await fetch(`${baseUrl}/api/to-publish/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review_status: 'approved',
      }),
    });
    const updated = await updateResponse.json();
    console.log('Updated:', updated);
  }

  // Test 5: List with filters
  console.log('\n5. Listing to-publish records with platform filter...');
  const filteredResponse = await fetch(`${baseUrl}/api/to-publish?platform=wechat`);
  const filtered = await filteredResponse.json();
  console.log('Filtered records:', filtered);
};

// Example usage:
// const baseUrl = 'http://localhost:8787'; // for local dev
// testMaterialsAPI(baseUrl).then(() => testToPublishAPI(baseUrl));
