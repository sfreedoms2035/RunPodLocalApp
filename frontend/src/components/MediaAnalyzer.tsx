import React, { useState } from 'react';

const MediaAnalyzer: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setAnalysis('');
        }
    };

    const analyzeMedia = async () => {
        if (!selectedFile) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error('Error:', error);
            setAnalysis('Error analyzing image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
            <div className="w-full mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                    Visual Analysis
                </h2>
                <p className="text-gray-400">Upload an image to understand its content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col gap-4">
                    <div className="flex-1 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-800 flex items-center justify-center relative overflow-hidden group">
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center p-8">
                                <p className="text-gray-500 mb-2">Drag & drop or click to upload</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={analyzeMedia}
                        disabled={!selectedFile || isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Image'}
                    </button>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 overflow-y-auto">
                    <h3 className="text-xl font-semibold mb-4 text-emerald-400">Analysis Results</h3>
                    {analysis ? (
                        <p className="text-gray-200 leading-relaxed">{analysis}</p>
                    ) : (
                        <p className="text-gray-600 italic">Results will appear here...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaAnalyzer;
