import React from 'react';
import ModelSelector from './ModelSelector';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'chat', label: 'AI Chat', icon: '💬' },
        { id: 'image', label: 'Image Gen', icon: '🎨' },
        { id: 'vision', label: 'Analysis', icon: '👁️' },
    ];

    return (
        <div className="w-64 bg-darker border-r border-gray-800 h-screen p-4 flex flex-col">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">
                RunPod AI
            </h1>
            <nav className="flex-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all duration-200 flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto">
                <ModelSelector />
                <div className="text-xs text-gray-600 mt-4 text-center">
                    Running on RunPod
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
