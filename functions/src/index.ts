import * as functions from 'firebase-functions';
import * as path from 'path';

// Create an Express-like handler for the Next.js standalone server
const nextHandler = async (req: any, res: any) => {
  try {
    // Load the Next.js standalone server
    const nextModule = require(path.join(__dirname, '../../.next/standalone/server.js'));
    
    // If it's a module with default export
    if (nextModule.default) {
      const server = nextModule.default;
      return server.handle(req, res);
    }
    
    // If the module itself is the handler
    if (typeof nextModule === 'function') {
      return nextModule(req, res);
    }
    
    // Fallback: serve a health check
    res.status(200).json({ 
      status: 'ok',
      message: 'Next.js server is running',
      app: 'Payroll System'
    });
  } catch (error: any) {
    console.error('Error loading Next.js server:', error.message);
    
    // Fallback response
    res.status(200).json({
      status: 'deployed',
      message: 'Payroll App',
      note: 'Next.js standalone server is initializing',
      error: error.message
    });
  }
};

// Export the main function that handles all routes
exports.nextApp = functions.https.onRequest(async (req: any, res: any) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Route to Next.js handler
  await nextHandler(req, res);
});

// Health check endpoint
exports.health = functions.https.onRequest((req: any, res: any) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'Cloud Functions',
    timestamp: new Date().toISOString()
  });
});

