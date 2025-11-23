import React, { useState } from 'react';

const ModelSelector: React.FC = () => {
    const [modelId, setModelId] = useState('');
    const [modelType, setModelType] = useState('chat');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    const loadModel = async () => {
        if (!modelId) return;
        setIsLoading(true);
        setStatus('Initiating load...');

        try {
            // Start loading
            const response = await fetch('/api/load-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_id: modelId, model_type: modelType }),
            });

            if (response.ok) {
                // Poll for status
                const interval = setInterval(async () => {
                    try {
                        const statusRes = await fetch('/api/model-status');
                        const statusData = await statusRes.json();

                        setStatus(statusData.message);

                        if (statusData.status === 'ready') {
                            clearInterval(interval);
                            setIsLoading(false);
                        } else if (statusData.status === 'error') {
                            clearInterval(interval);
                            setIsLoading(false);
                        }
                    } catch (e) {
                        console.error("Polling error", e);
                    }
                }, 1000);
            } else {
                setStatus('Error starting load');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('Connection error');
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Load Model</h3>
            <div className="space-y-2">
                <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="chat">Chat (LLM)</option>
                    <option value="image">Image Gen</option>
                    <option value="vision">Vision</option>
                </select>

                <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="Hugging Face Model ID (e.g. gpt2)"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />

                <button
                    onClick={loadModel}
                    disabled={isLoading || !modelId}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Load Model'}
                </button>

                {status && (
                    <div className={`text-xs ${status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelSelector;
