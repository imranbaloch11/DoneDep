// Simple WebSocket test to verify DoneDep <-> Windsurf Extension communication
const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection to DoneDep server...');

// Connect to the Windsurf WebSocket endpoint
const ws = new WebSocket('ws://localhost:3001/windsurf');

ws.on('open', function open() {
  console.log('✅ Connected to DoneDep WebSocket server');
  
  // Send handshake message (simulating Windsurf extension)
  const handshakeMessage = {
    extensionVersion: '1.0.0',
    workspaceFolder: '/Users/macbook/CascadeProjects/DoneDep',
    vsCodeVersion: '1.85.0'
  };
  
  console.log('📤 Sending handshake message...');
  ws.send(JSON.stringify(handshakeMessage));
});

ws.on('message', function message(data) {
  console.log('📨 Received message from server:', data.toString());
  
  try {
    const parsedMessage = JSON.parse(data.toString());
    console.log('📋 Parsed message:', parsedMessage);
    
    if (parsedMessage.type === 'handshake-ack') {
      console.log('🤝 Handshake acknowledged by server');
      
      // Test sending an error capture message
      const errorMessage = {
        id: `test-${Date.now()}`,
        type: 'command',
        action: 'error.captured',
        payload: {
          error: {
            type: 'javascript',
            level: 'error',
            message: 'Test error from WebSocket client',
            stack: 'Error: Test error\n    at test.js:1:1',
            source: {
              file: 'test.js',
              line: 1,
              column: 1
            },
            context: {
              url: 'http://localhost:3000/deployagent',
              userAgent: 'Test WebSocket Client'
            }
          }
        },
        timestamp: Date.now()
      };
      
      console.log('📤 Sending test error message...');
      ws.send(JSON.stringify(errorMessage));
      
      // Close connection after 2 seconds
      setTimeout(() => {
        console.log('🔌 Closing connection...');
        ws.close();
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
  process.exit(0);
});

// Handle connection timeout
setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    console.error('❌ Connection timeout - is the DoneDep server running on port 3001?');
    ws.close();
    process.exit(1);
  }
}, 5000);
