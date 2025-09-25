// Test the Windsurf extension WebSocket client connection
const { WindsurfBridge } = require('./windsurf-extension/out/websocket-client.js');

console.log('🧪 Testing Windsurf Extension connection to DoneDep...');

async function testExtensionConnection() {
  const bridge = new WindsurfBridge();
  
  try {
    // Connect to DoneDep server
    console.log('🔌 Connecting to DoneDep server...');
    await bridge.connect('http://localhost:3001');
    
    console.log('✅ Extension connected successfully!');
    
    // Send handshake
    console.log('🤝 Sending handshake...');
    await bridge.sendHandshake({
      extensionVersion: '1.0.0',
      workspaceFolder: '/Users/macbook/CascadeProjects/DoneDep',
      vsCodeVersion: '1.85.0'
    });
    
    // Set up message handler
    bridge.onMessage((message) => {
      console.log('📨 Extension received message:', message);
    });
    
    // Send a test error
    console.log('🐛 Sending test error...');
    await bridge.sendError({
      type: 'javascript',
      level: 'error',
      message: 'Test error from Windsurf extension',
      stack: 'Error: Test error\n    at extension.js:1:1',
      source: {
        file: 'extension.js',
        line: 1,
        column: 1
      },
      context: {
        workspaceFolder: '/Users/macbook/CascadeProjects/DoneDep',
        vsCodeVersion: '1.85.0'
      }
    });
    
    // Send deployment status
    console.log('🚀 Sending deployment status...');
    await bridge.sendDeploymentStatus({
      status: 'building',
      progress: 50,
      message: 'Building application...',
      timestamp: Date.now()
    });
    
    // Test connection state
    console.log('🔍 Connection state:', bridge.getConnectionState());
    console.log('🔗 Is connected:', bridge.isConnected());
    
    // Wait a bit for any responses
    setTimeout(() => {
      console.log('🔌 Disconnecting...');
      bridge.disconnect();
      console.log('✅ Test completed successfully!');
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Extension connection test failed:', error);
    process.exit(1);
  }
}

testExtensionConnection();
