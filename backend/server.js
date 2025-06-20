import express from 'express';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
let genAI;
let model;
let systemPrompt = '';

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // Load system prompt
  try {
    systemPrompt = fs.readFileSync(path.join(__dirname, '..', 'sys_main.txt'), 'utf8');
    console.log('✅ System prompt loaded successfully');
  } catch (error) {
    console.warn('⚠️  Could not load sys_main.txt, using default prompt');
    systemPrompt = 'You are a helpful AI assistant.';
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not found. AI chat will not work.');
}

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!model) {
      return res.status(500).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY.' 
      });
    }

    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    let conversationContext = systemPrompt + '\n\n';
    
    // Add recent history (last 10 messages to avoid token limits)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      conversationContext += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
    }
    
    conversationContext += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    services: {
      ai: !!process.env.GEMINI_API_KEY,
      ssh: !!(process.env.SSH_HOST && (process.env.SSH_PASSWORD || process.env.SSH_PRIVATE_KEY_PATH))
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Chat: ${process.env.GEMINI_API_KEY ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔐 SSH Proxy: ${process.env.SSH_HOST ? '✅ Configured' : '❌ Not configured'}`);
});

// WebSocket server for SSH connections
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection for SSH');
  
  let sshClient = null;
  let sshStream = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'connect') {
        // Initialize SSH connection
        sshClient = new Client();
        
        const sshConfig = {
          host: process.env.SSH_HOST,
          username: process.env.SSH_USERNAME,
          port: 22,
        };

        // Add authentication method
        if (process.env.SSH_PRIVATE_KEY_PATH) {
          try {
            sshConfig.privateKey = fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH);
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              data: 'Could not read SSH private key file'
            }));
            return;
          }
        } else if (process.env.SSH_PASSWORD) {
          sshConfig.password = process.env.SSH_PASSWORD;
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            data: 'No SSH authentication method configured'
          }));
          return;
        }

        sshClient.on('ready', () => {
          console.log('✅ SSH connection established');
          
          sshClient.shell((err, stream) => {
            if (err) {
              ws.send(JSON.stringify({
                type: 'error',
                data: 'Failed to start shell: ' + err.message
              }));
              return;
            }

            sshStream = stream;

            // Set environment variable
            if (process.env.SSH_ENV_SECRET) {
              stream.write(`export SECRET=${process.env.SSH_ENV_SECRET}\n`);
            }

            // Send data from SSH to WebSocket
            stream.on('data', (data) => {
              ws.send(JSON.stringify({
                type: 'data',
                data: data.toString()
              }));
            });

            stream.on('close', () => {
              console.log('🔌 SSH stream closed');
              ws.send(JSON.stringify({
                type: 'close'
              }));
            });

            // Notify client that connection is ready
            ws.send(JSON.stringify({
              type: 'ready'
            }));
          });
        });

        sshClient.on('error', (err) => {
          console.error('❌ SSH connection error:', err.message);
          ws.send(JSON.stringify({
            type: 'error',
            data: 'SSH connection failed: ' + err.message
          }));
        });

        sshClient.connect(sshConfig);
        
      } else if (data.type === 'input' && sshStream) {
        // Send user input to SSH
        sshStream.write(data.data);
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    if (sshStream) {
      sshStream.end();
    }
    if (sshClient) {
      sshClient.end();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('🌐 WebSocket server ready for SSH connections');