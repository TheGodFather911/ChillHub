# Cozy Dashboard Backend

This backend server provides SSH proxy and AI chat functionality for the Cozy Dashboard application.

## Features

- **SSH WebSocket Proxy**: Secure SSH connections through WebSocket
- **AI Chat**: Gemini AI integration with custom system prompts
- **CORS Support**: Configured for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Get from Google AI Studio (https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# SSH Configuration
SSH_HOST=lsd.segfault.net
SSH_USERNAME=root

# Choose ONE authentication method:
# Option 1: Password (less secure)
SSH_PASSWORD=your_ssh_password

# Option 2: SSH Key (recommended)
SSH_PRIVATE_KEY_PATH=/path/to/your/private/key

# Server settings
PORT=3001
FRONTEND_URL=http://localhost:5173
SSH_ENV_SECRET=NsIClGyvkzJRqJvYrfsOyFUB
```

### 3. SSH Authentication Setup

#### Option A: SSH Key Authentication (Recommended)

1. Generate an SSH key pair if you don't have one:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/cozy_dashboard_key
   ```

2. Copy the public key to the target server:
   ```bash
   ssh-copy-id -i ~/.ssh/cozy_dashboard_key.pub root@lsd.segfault.net
   ```

3. Set the private key path in `.env`:
   ```env
   SSH_PRIVATE_KEY_PATH=/home/yourusername/.ssh/cozy_dashboard_key
   ```

#### Option B: Password Authentication

Simply set the password in `.env`:
```env
SSH_PASSWORD=your_actual_password
```

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### 5. Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

- `POST /api/chat` - AI chat endpoint
- `GET /api/health` - Health check and service status
- WebSocket on `/` - SSH proxy connections

## Security Notes

- Never commit your `.env` file to version control
- Use SSH key authentication instead of passwords when possible
- The SSH connection is proxied through WebSocket for browser compatibility
- All API keys and credentials are stored server-side for security

## Troubleshooting

### SSH Connection Issues

1. **Permission denied**: Check your SSH credentials and key permissions
2. **Connection timeout**: Verify the SSH host is accessible
3. **Key not found**: Ensure the SSH key path is correct and readable

### AI Chat Issues

1. **API key invalid**: Verify your Gemini API key is correct
2. **Rate limits**: Gemini free tier has usage limits
3. **System prompt not loading**: Ensure `sys_main.txt` exists in the project root

### General Issues

1. **CORS errors**: Check that `FRONTEND_URL` matches your frontend URL
2. **Port conflicts**: Change the `PORT` in `.env` if 3001 is in use
3. **Dependencies**: Run `npm install` if you get module not found errors

## Development

The server uses:
- Express.js for HTTP API
- WebSocket (ws) for real-time SSH connections
- ssh2 for SSH client functionality
- Google Generative AI for chat responses

For development, use `npm run dev` to enable auto-restart on file changes.