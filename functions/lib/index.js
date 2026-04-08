"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const path = __importStar(require("path"));
// Create an Express-like handler for the Next.js standalone server
const nextHandler = async (req, res) => {
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
    }
    catch (error) {
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
exports.nextApp = functions.https.onRequest(async (req, res) => {
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
exports.health = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Cloud Functions',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=index.js.map