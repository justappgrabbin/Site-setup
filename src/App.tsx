export default function App() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Paste Your CustomLLMChat Component</h1>
      <p className="opacity-80">Open <code>src/CustomLLMChat.tsx</code>  import React, { useState, useRef } from 'react';
import { Send, Upload, Eye, Settings, X } from 'lucide-react';

export default function CustomLLMChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState(false);
  const [settings, setSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    endpoint: '',
    apiKey: '',
    model: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    setCode(text);
    setMessages([...messages, {
      role: 'system',
      content: `File uploaded: ${file.name} (${text.length} chars)`
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() && !code) return;
    
    if (!apiConfig.endpoint) {
      alert('Please configure your LLM endpoint in settings first!');
      setSettings(true);
      return;
    }

    const userMsg = {
      role: 'user',
      content: input + (code ? `\n\nCode:\n${code}` : '')
    };

    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [...messages, userMsg].map(m => ({
            role: m.role === 'system' ? 'user' : m.role,
            content: m.content
          })),
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 
                 data.content?.[0]?.text || 
                 'Error: Unexpected response format'
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If response contains code, extract it
      const codeMatch = assistantMsg.content.match(/```(?:html|css|javascript|js)?\n([\s\S]*?)```/);
      if (codeMatch) {
        setCode(codeMatch[1]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${error.message}`
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-pink-950 to-purple-950 text-white">
      {/* Settings Panel */}
      {settings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-pink-900 bg-opacity-90 backdrop-blur p-6 rounded-lg w-full max-w-md border border-pink-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-200">LLM Settings</h2>
              <button onClick={() => setSettings(false)} className="hover:bg-pink-800 rounded p-1">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-pink-300">API Endpoint</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1/chat/completions"
                  className="w-full bg-pink-950 bg-opacity-70 p-2 rounded border border-pink-700 focus:border-pink-500 focus:outline-none text-pink-100 placeholder-pink-500"
                  value={apiConfig.endpoint}
                  onChange={(e) => setApiConfig({...apiConfig, endpoint: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-pink-300">API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full bg-pink-950 bg-opacity-70 p-2 rounded border border-pink-700 focus:border-pink-500 focus:outline-none text-pink-100 placeholder-pink-500"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-pink-300">Model Name</label>
                <input
                  type="text"
                  placeholder="gpt-4, claude-3-opus, etc."
                  className="w-full bg-pink-950 bg-opacity-70 p-2 rounded border border-pink-700 focus:border-pink-500 focus:outline-none text-pink-100 placeholder-pink-500"
                  value={apiConfig.model}
                  onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                />
              </div>
              <button
                onClick={() => setSettings(false)}
                className="w-full bg-pink-600 hover:bg-pink-500 p-2 rounded font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-pink-900 bg-opacity-50 backdrop-blur p-3 lg:p-4 flex justify-between items-center flex-shrink-0 border-b border-pink-500">
          <h1 className="text-lg lg:text-xl font-bold text-pink-200">Custom LLM Chat</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings(true)}
              className="p-2 hover:bg-pink-800 rounded"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setPreview(!preview)}
              className="lg:hidden p-2 bg-pink-600 hover:bg-pink-700 rounded"
            >
              <Eye size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 lg:p-3 rounded text-sm lg:text-base ${
              msg.role === 'user' ? 'bg-pink-600 ml-4 lg:ml-12' :
              msg.role === 'assistant' ? 'bg-pink-800 bg-opacity-70 mr-4 lg:mr-12' :
              'bg-pink-900 bg-opacity-50 text-center text-xs lg:text-sm'
            }`}>
              <pre className="whitespace-pre-wrap font-sans break-words">{msg.content}</pre>
            </div>
          ))}
          {loading && (
            <div className="bg-pink-800 bg-opacity-70 p-2 lg:p-3 rounded mr-4 lg:mr-12 animate-pulse text-sm lg:text-base">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-3 lg:p-4 bg-pink-900 bg-opacity-50 backdrop-blur space-y-2 flex-shrink-0 border-t border-pink-500">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask to edit your code..."
              className="flex-1 bg-pink-950 bg-opacity-70 p-2 lg:p-3 rounded text-sm lg:text-base border border-pink-700 focus:border-pink-500 focus:outline-none"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2 lg:p-3 bg-pink-800 hover:bg-pink-700 rounded flex-shrink-0"
            >
              <Upload size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={sendMessage}
              className="p-2 lg:p-3 bg-pink-600 hover:bg-pink-500 rounded flex-shrink-0"
            >
              <Send size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Code & Preview Panel */}
      <div className={`${preview ? 'fixed inset-0 z-40 lg:relative' : 'hidden'} lg:flex lg:w-1/2 flex-col border-l border-pink-700 bg-gradient-to-br from-pink-950 to-purple-950`}>
        <div className="bg-pink-900 bg-opacity-50 backdrop-blur p-3 lg:p-4 flex justify-between items-center flex-shrink-0 border-b border-pink-500">
          <h2 className="font-bold text-sm lg:text-base text-pink-200">Code Editor</h2>
          <button
            onClick={() => setPreview(!preview)}
            className="p-2 bg-pink-600 hover:bg-pink-500 rounded flex items-center gap-2 text-sm"
          >
            {preview && <X size={16} className="lg:hidden" />}
            <Eye size={16} />
            <span className="hidden lg:inline">{preview ? 'Hide' : 'Show'} Preview</span>
          </button>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here or upload a file..."
          className="flex-1 bg-pink-950 bg-opacity-50 p-3 lg:p-4 font-mono text-xs lg:text-sm resize-none min-h-0 text-pink-100 placeholder-pink-400 border-none focus:outline-none"
        />

        {preview && (
          <div className="h-1/2 border-t border-pink-700 flex flex-col min-h-0">
            <div className="bg-pink-900 bg-opacity-70 p-2 text-xs lg:text-sm font-bold flex-shrink-0 text-pink-200">Live Preview</div>
            <iframe
              srcDoc={code}
              className="w-full flex-1 bg-white min-h-0"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
} </p>
    </div>
  );
}
