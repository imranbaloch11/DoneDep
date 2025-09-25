// Socket.IO client test to verify DoneDep <-> Windsurf Extension communication
const { io } = require('socket.io-client');

console.log('🔌 Testing Socket.IO connection to DoneDep server...');

// Connect to the Windsurf Socket.IO endpoint
const socket = io('http://localhost:3001', {
  path: '/windsurf'
});

socket.on('connect', () => {
  console.log('✅ Connected to DoneDep Socket.IO server');
  console.log('🆔 Socket ID:', socket.id);
  
  // Send handshake message (simulating Windsurf extension)
  const handshakeData = {
    extensionVersion: '1.0.0',
    workspaceFolder: '/Users/macbook/CascadeProjects/DoneDep',
    vsCodeVersion: '1.85.0'
  };
  
  console.log('📤 Sending handshake...');
  socket.emit('handshake', handshakeData);
});

socket.on('handshake-ack', (data) => {
  console.log('🤝 Handshake acknowledged:', data);
  
  // Test sending an error capture message
  const errorData = {
    error: {
      type: 'javascript',
      level: 'error',
      message: 'Test error from Socket.IO client',
      stack: 'Error: Test error\n    at test.js:1:1',
      source: {
        file: 'test.js',
        line: 1,
        column: 1
      },
      context: {
        url: 'http://localhost:3000/deployagent',
        userAgent: 'Test Socket.IO Client'
      }
    }
  };
  
  console.log('📤 Sending test error capture...');
  socket.emit('error.captured', errorData);
  
  // Test sending a message
  const testMessage = {
    id: `test-${Date.now()}`,
    type: 'command',
    action: 'ping',
    payload: { message: 'Hello from test client' },
    timestamp: Date.now()
  };
  
  console.log('📤 Sending test message...');
  socket.emit('message', testMessage);
  
  // Close connection after 3 seconds
  setTimeout(() => {
    console.log('🔌 Closing connection...');
    socket.disconnect();
  }, 3000);
});

socket.on('message', (data) => {
  console.log('📨 Received message from server:', data);
});

socket.on('deployment.status', (data) => {
  console.log('🚀 Deployment status:', data);
});

socket.on('error.analysis', (data) => {
  console.log('🔍 Error analysis:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
  process.exit(0);
});

// Handle connection timeout
setTimeout(() => {
  if (!socket.connected) {
    console.error('❌ Connection timeout - is the DoneDep server running on port 3001?');
    socket.disconnect();
    process.exit(1);
  }
}, 5000);
