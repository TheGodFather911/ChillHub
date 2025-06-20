import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Wifi, WifiOff } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

const SSHTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new Terminal({
        theme: {
          background: '#1a1a1a',
          foreground: '#ffffff',
          cursor: '#ffffff',
          selection: '#444444',
          black: '#000000',
          red: '#ff6b6b',
          green: '#51cf66',
          yellow: '#ffd43b',
          blue: '#74c0fc',
          magenta: '#d0bfff',
          cyan: '#99e9f2',
          white: '#ffffff',
          brightBlack: '#495057',
          brightRed: '#ff8787',
          brightGreen: '#69db7c',
          brightYellow: '#ffe066',
          brightBlue: '#91a7ff',
          brightMagenta: '#e599f7',
          brightCyan: '#b3f3ff',
          brightWhite: '#f8f9fa'
        },
        fontFamily: '"JetBrains Mono", "Fira Code", "Monaco", "Menlo", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        allowTransparency: true,
        convertEol: true
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      
      term.open(terminalRef.current);
      fitAddon.fit();
      fitAddonRef.current = fitAddon;

      // Welcome message
      term.writeln('\x1b[1;32m╔═══════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;32m║\x1b[0m \x1b[1;36mCozy SSH Terminal\x1b[0m                   \x1b[1;32m║\x1b[0m');
      term.writeln('\x1b[1;32m║\x1b[0m \x1b[33mClick Connect to start SSH session\x1b[0m   \x1b[1;32m║\x1b[0m');
      term.writeln('\x1b[1;32m╚═══════════════════════════════════════╝\x1b[0m');
      term.writeln('');

      setTerminal(term);

      // Handle window resize
      const handleResize = () => {
        if (fitAddon) {
          fitAddon.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
  }, []);

  const connectToSSH = () => {
    if (!terminal) return;

    setConnectionStatus('connecting');
    terminal.writeln('\x1b[33m🔌 Connecting to SSH server...\x1b[0m');

    try {
      const websocket = new WebSocket('ws://localhost:3001');
      
      websocket.onopen = () => {
        terminal.writeln('\x1b[32m✓ WebSocket connected\x1b[0m');
        terminal.writeln('\x1b[33m🔐 Establishing SSH connection...\x1b[0m');
        
        // Send connect message
        websocket.send(JSON.stringify({ type: 'connect' }));
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'ready':
              terminal.writeln('\x1b[32m✓ SSH connection established\x1b[0m');
              terminal.writeln('\x1b[33m⚡ Environment: SECRET=NsIClGyvkzJRqJvYrfsOyFUB\x1b[0m');
              terminal.writeln('');
              setConnectionStatus('connected');
              setIsConnected(true);
              
              // Enable terminal input handling after connection is ready
              terminal.onData((data) => {
                if (websocket.readyState === WebSocket.OPEN) {
                  websocket.send(JSON.stringify({ type: 'input', data }));
                }
              });
              
              // Focus the terminal for immediate input
              terminal.focus();
              break;
              
            case 'data':
              terminal.write(message.data);
              break;
              
            case 'error':
              terminal.writeln(`\x1b[31m✗ Error: ${message.data}\x1b[0m`);
              setConnectionStatus('error');
              break;
              
            case 'close':
              terminal.writeln('\x1b[33m🔌 SSH connection closed\x1b[0m');
              setConnectionStatus('disconnected');
              setIsConnected(false);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onerror = (error) => {
        terminal.writeln('\x1b[31m✗ WebSocket connection failed\x1b[0m');
        terminal.writeln('\x1b[33m  Make sure the backend server is running\x1b[0m');
        terminal.writeln('\x1b[90m  Run: cd backend && npm start\x1b[0m');
        setConnectionStatus('error');
      };

      websocket.onclose = () => {
        terminal.writeln('\x1b[33m🔌 WebSocket connection closed\x1b[0m');
        setConnectionStatus('disconnected');
        setIsConnected(false);
        setWs(null);
      };

    } catch (error) {
      terminal.writeln('\x1b[31m✗ Connection failed\x1b[0m');
      terminal.writeln('\x1b[33m  Backend server not available\x1b[0m');
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
    }
    setConnectionStatus('disconnected');
    setIsConnected(false);
    setWs(null);
    
    if (terminal) {
      terminal.writeln('\x1b[33m🔌 Disconnected from SSH server\x1b[0m');
      // Remove input handler when disconnected
      terminal.onData(() => {});
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  // Handle terminal container click to focus
  const handleTerminalClick = () => {
    if (terminal && isConnected) {
      terminal.focus();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl">
            <TerminalIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100">SSH Terminal</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          
          {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
            <button
              onClick={connectToSSH}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors duration-200"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div 
        ref={terminalRef} 
        onClick={handleTerminalClick}
        className="flex-1 bg-gray-900 rounded-2xl p-4 font-mono text-sm cursor-text"
        style={{ minHeight: '300px' }}
      />

      <div className="mt-4 text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
        <p>🔐 Target: root@adm.segfault.net</p>
        <p>🌍 Environment: SECRET=lMKLBbjNNlAzFfAfRCZZnhYm</p>
        <p>⚙️ Backend required: ws://localhost:3001</p>
        {isConnected && <p>💡 Click in the terminal area to focus and start typing</p>}
      </div>
    </div>
  );
};

export default SSHTerminal;