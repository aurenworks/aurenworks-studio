// Test script to verify mock server is working

async function testMockServer() {
  try {
    console.log('Testing mock server...');

    // Test login
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev@auren.local', role: 'OWNER' }),
    });

    if (!loginRes.ok) {
      console.log('Login failed:', loginRes.status, loginRes.statusText);
      return;
    }

    const loginData = await loginRes.json();
    console.log('Login successful:', loginData);

    // Test project creation
    const projectRes = await fetch('http://localhost:3000/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({ name: 'E2E Project', ownerId: 'dev-owner' }),
    });

    if (!projectRes.ok) {
      console.log(
        'Project creation failed:',
        projectRes.status,
        projectRes.statusText
      );
      return;
    }

    const projectData = await projectRes.json();
    console.log('Project created:', projectData);

    // Test component creation
    const componentRes = await fetch('http://localhost:3000/components', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        projectId: projectData.id,
        name: 'Deals',
        fields: [
          { key: 'title', type: 'text', label: 'Title', required: true },
          { key: 'amount', type: 'number', label: 'Amount' },
        ],
      }),
    });

    if (!componentRes.ok) {
      console.log(
        'Component creation failed:',
        componentRes.status,
        componentRes.statusText
      );
      return;
    }

    const componentData = await componentRes.json();
    console.log('Component created:', componentData);

    // Test component retrieval
    const getComponentRes = await fetch(
      `http://localhost:3000/projects/${projectData.id}/components/${componentData.id}`,
      {
        headers: { Authorization: `Bearer ${loginData.token}` },
      }
    );

    if (!getComponentRes.ok) {
      console.log(
        'Component retrieval failed:',
        getComponentRes.status,
        getComponentRes.statusText
      );
      return;
    }

    const getComponentData = await getComponentRes.json();
    console.log('Component retrieved:', getComponentData);
  } catch (error) {
    console.error('Error testing mock server:', error);
  }
}

testMockServer();
