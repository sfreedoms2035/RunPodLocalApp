import React, { useState } from 'react';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setImage(null);

        try {
            const response = await fetch('http://localhost:8000/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            setImage(`data:image/png;base64,${data.image_base64}`);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center h-full max-w-4xl mx-auto p-4">
            <div className="w-full mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Create Imagination
                </h2>
                <p className="text-gray-400">Describe what you want to see.</p>
            </div>

            <div className="w-full flex gap-2 mb-8">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic city on Mars, cyberpunk style..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                    onClick={generateImage}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>

            <div className="flex-1 w-full flex items-center justify-center bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-800 overflow-hidden">
                {isLoading ? (
                    <div className="text-purple-400 animate-pulse">Creating masterpiece...</div>
                ) : image ? (
                    <img src={image} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                ) : (
                    <div className="text-gray-600">Image will appear here</div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
