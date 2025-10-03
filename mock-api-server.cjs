const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let projects = [];
let components = [];
let records = [];
let nextId = 1;

// Auth endpoint
app.post('/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (email === 'dev@auren.local') {
    res.json({ token: 'mock-jwt-token', role: role || 'OWNER' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Health endpoint
app.get('/healthz', (req, res) => {
  console.log('Health endpoint called');
  res.json({ status: 'ok', uptime: 0, commitSha: null });
});

// Projects endpoints
app.get('/projects', (req, res) => {
  res.json(projects);
});

app.post('/projects', (req, res) => {
  const project = {
    id: `project-${nextId++}`,
    name: req.body.name,
    ownerId: req.body.ownerId,
    createdAt: new Date().toISOString()
  };
  projects.push(project);
  res.json(project);
});

app.get('/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Components endpoints
app.get('/components', (req, res) => {
  res.json(components);
});

app.post('/components', (req, res) => {
  const component = {
    id: `component-${nextId++}`,
    projectId: req.body.projectId,
    name: req.body.name,
    description: req.body.description || '',
    type: req.body.type || 'api',
    status: req.body.status || 'active',
    config: req.body.config || {},
    metadata: req.body.metadata || {},
    fields: req.body.fields || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  components.push(component);
  res.json(component);
});

app.get('/components/:id', (req, res) => {
  const component = components.find(c => c.id === req.params.id);
  if (component) {
    // Add ETag header for optimistic concurrency
    const etag = `"${component.updatedAt}"`;
    res.set('ETag', etag);
    res.json(component);
  } else {
    res.status(404).json({ error: 'Component not found' });
  }
});

// Project-specific component endpoint
app.get('/projects/:projectId/components/:id', (req, res) => {
  const component = components.find(c => c.id === req.params.id && c.projectId === req.params.projectId);
  if (component) {
    // Add ETag header for optimistic concurrency
    const etag = `"${component.updatedAt}"`;
    res.set('ETag', etag);
    res.json(component);
  } else {
    res.status(404).json({ error: 'Component not found' });
  }
});

app.put('/components/:id', (req, res) => {
  const component = components.find(c => c.id === req.params.id);
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  // Check for optimistic concurrency conflict
  const ifMatch = req.headers['if-match'];
  if (ifMatch && ifMatch !== `"${component.updatedAt}"`) {
    return res.status(409).json({ error: 'Conflict: Component was modified by another user' });
  }

  // Update component
  component.name = req.body.name || component.name;
  component.description = req.body.description !== undefined ? req.body.description : component.description;
  component.type = req.body.type || component.type;
  component.status = req.body.status || component.status;
  component.config = req.body.config !== undefined ? req.body.config : component.config;
  component.metadata = req.body.metadata !== undefined ? req.body.metadata : component.metadata;
  component.fields = req.body.fields || component.fields;
  component.updatedAt = new Date().toISOString();

  const etag = `"${component.updatedAt}"`;
  res.set('ETag', etag);
  res.json(component);
});

// Project-specific component update endpoint
app.put('/projects/:projectId/components/:id', (req, res) => {
  const component = components.find(c => c.id === req.params.id && c.projectId === req.params.projectId);
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  // Check for optimistic concurrency conflict
  const ifMatch = req.headers['if-match'];
  if (ifMatch && ifMatch !== `"${component.updatedAt}"`) {
    return res.status(409).json({ error: 'Conflict: Component was modified by another user' });
  }

  // Update component
  component.name = req.body.name || component.name;
  component.description = req.body.description !== undefined ? req.body.description : component.description;
  component.type = req.body.type || component.type;
  component.status = req.body.status || component.status;
  component.config = req.body.config !== undefined ? req.body.config : component.config;
  component.metadata = req.body.metadata !== undefined ? req.body.metadata : component.metadata;
  component.fields = req.body.fields || component.fields;
  component.updatedAt = new Date().toISOString();

  const etag = `"${component.updatedAt}"`;
  res.set('ETag', etag);
  res.json(component);
});

// Records endpoints
app.get('/records', (req, res) => {
  res.json(records);
});

app.post('/records', (req, res) => {
  const record = {
    id: `record-${nextId++}`,
    componentId: req.body.componentId,
    data: req.body.data || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  records.push(record);
  res.json(record);
});

app.get('/records/:id', (req, res) => {
  const record = records.find(r => r.id === req.params.id);
  if (record) {
    res.json(record);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- POST /auth/login');
  console.log('- GET /healthz');
  console.log('- GET /projects');
  console.log('- POST /projects');
  console.log('- GET /components');
  console.log('- POST /components');
  console.log('- GET /components/:id');
  console.log('- PUT /components/:id');
  console.log('- GET /records');
  console.log('- POST /records');
  console.log('- GET /records/:id');
});
