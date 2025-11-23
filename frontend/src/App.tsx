import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import MediaAnalyzer from './components/MediaAnalyzer';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex h-screen bg-dark text-white overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none" />

        <div className="h-full p-6 overflow-y-auto">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'image' && <ImageGenerator />}
          {activeTab === 'vision' && <MediaAnalyzer />}
        </div>
      </main>
    </div>
  );
}

export default App;
