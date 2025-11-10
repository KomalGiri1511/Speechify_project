import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Highlighter, Minus, X, FileText } from 'lucide-react';

export default function SimplePdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [currentTool, setCurrentTool] = useState('highlight');
  const [currentColor, setCurrentColor] = useState('#FFFF00');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);
  const pdfViewerRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setPdfFile(file);
    
    // Create URL for PDF display
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setAnnotations([]);
  };

  // Get mouse position relative to the PDF viewer
  const getMousePos = useCallback((e) => {
    if (!pdfViewerRef.current) return { x: 0, y: 0 };
    
    const rect = pdfViewerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Start drawing annotation
  const handleMouseDown = (e) => {
    if (!pdfUrl) return;
    
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
  };

  // Update drawing while mouse moves
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    // Could add live preview here if needed
  };

  // Finish drawing annotation
  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    
    const endPos = getMousePos(e);
    const minSize = 10;
    
    // Check if annotation is large enough
    if (Math.abs(endPos.x - startPos.x) < minSize && Math.abs(endPos.y - startPos.y) < minSize) {
      setIsDrawing(false);
      return;
    }

    const newAnnotation = {
      id: Date.now() + Math.random(),
      type: currentTool,
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y),
      width: Math.abs(endPos.x - startPos.x),
      height: currentTool === 'highlight' ? Math.max(Math.abs(endPos.y - startPos.y), 20) : 3,
      color: currentColor
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setIsDrawing(false);
  };

  // Remove annotation
  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  // Save edited PDF (client-side only)
  const handleSavePDF = async () => {
    if (!pdfFile) {
      alert('No PDF to save');
      return;
    }

    if (annotations.length === 0) {
      alert('No annotations to save. Add some annotations first.');
      return;
    }

    try {
      // For pure React.js solution, we'll create a canvas-based approach
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a new PDF with annotations using jsPDF (client-side)
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // For simplicity, we'll save the original PDF and create an annotation overlay
      // This is a basic implementation - for full PDF editing, you'd need pdf-lib
      
      // Create annotation data as JSON for now
      const annotationData = {
        fileName: fileName,
        annotations: annotations,
        timestamp: new Date().toISOString()
      };
      
      // Save annotations as a separate file for now
      const annotationBlob = new Blob([JSON.stringify(annotationData, null, 2)], 
        { type: 'application/json' });
      const annotationUrl = URL.createObjectURL(annotationBlob);
      
      // Download original PDF
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      pdfLink.download = `original_${fileName}`;
      pdfLink.click();
      
      // Download annotations
      const annotationLink = document.createElement('a');
      annotationLink.href = annotationUrl;
      annotationLink.download = `annotations_${fileName.replace('.pdf', '.json')}`;
      annotationLink.click();
      
      // Clean up
      URL.revokeObjectURL(annotationUrl);
      
      alert('✅ Files saved!\n\n• Original PDF downloaded\n• Annotations saved as JSON file\n• You can reload annotations later');
      
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Error saving files. Please try again.');
    }
  };

  // Load annotations from JSON file
  const handleLoadAnnotations = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/json') {
      alert('Please select a valid JSON annotation file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.annotations && Array.isArray(data.annotations)) {
          setAnnotations(data.annotations);
          alert(`✅ Loaded ${data.annotations.length} annotations!`);
        } else {
          alert('Invalid annotation file format.');
        }
      } catch (error) {
        alert('Error reading annotation file.');
      }
    };
    reader.readAsText(file);
  };

  // Clear all annotations
  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // Reset everything
  const resetEditor = () => {
    setPdfUrl(null);
    setPdfFile(null);
    setFileName('');
    setAnnotations([]);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">React PDF Editor</h1>
          </div>
          <p className="text-lg text-slate-600">
            Client-side PDF editing with React.js only - No backend required
          </p>
        </div>

        {/* Upload Section */}
        {!pdfUrl && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-8">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800 mb-1">
                      Upload PDF File
                    </p>
                    <p className="text-sm text-slate-500">
                      Click to browse and select a PDF
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Main Editor */}
        {pdfUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Viewer */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                {/* Toolbar */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Editing Tools</h3>
                  
                  {/* Tool Selection */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setCurrentTool('highlight')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentTool === 'highlight' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-white text-slate-700 hover:bg-yellow-50'
                      }`}
                    >
                      <Highlighter className="w-4 h-4" />
                      Highlight
                    </button>
                    
                    <button
                      onClick={() => setCurrentTool('underline')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentTool === 'underline' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      Underline
                    </button>
                  </div>
                  
                  {/* Color Selection */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Color:</span>
                    <div className="flex gap-2">
                      {['#FFFF00', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            currentColor === color 
                              ? 'border-slate-400 scale-110' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>

                {/* PDF Display Area */}
                <div className="relative border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                  {/* PDF Viewer */}
                  <div
                    ref={pdfViewerRef}
                    className="relative w-full h-[600px] cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full border-none pointer-events-none"
                      title="PDF Viewer"
                    />
                    
                    {/* Annotation Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className={`absolute group ${
                            annotation.type === 'highlight' ? 'rounded-sm' : 'rounded-full'
                          }`}
                          style={{
                            left: `${annotation.x}px`,
                            top: `${annotation.y}px`,
                            width: `${annotation.width}px`,
                            height: `${annotation.height}px`,
                            backgroundColor: annotation.color,
                            opacity: annotation.type === 'highlight' ? 0.4 : 0.8,
                            zIndex: 10
                          }}
                        >
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAnnotation(annotation.id);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs pointer-events-auto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-4">
                {/* File Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 text-lg mb-4">Document Info</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{annotations.length}</div>
                      <div className="text-sm text-slate-600">Annotations</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-2">File Name</div>
                      <div className="font-medium text-slate-800 truncate">{fileName}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 text-lg">Actions</h3>
                  
                  <button
                    onClick={handleSavePDF}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    Save Files
                  </button>

                  <button
                    onClick={clearAnnotations}
                    disabled={annotations.length === 0}
                    className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                    Clear All
                  </button>

                  <div className="border-t border-slate-200 pt-4">
                    <label className="w-full flex items-center justify-center gap-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-xl border border-blue-300 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Load Annotations
                      <input
                        type="file"
                        accept="application/json"
                        onChange={handleLoadAnnotations}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={resetEditor}
                    className="w-full flex items-center justify-center gap-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-xl border border-red-300 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    New PDF
                  </button>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">How to use:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Select highlight or underline tool</li>
                    <li>• Choose your preferred color</li>
                    <li>• Click and drag over text to annotate</li>
                    <li>• Save files to download PDF + annotations</li>
                    <li>• Load annotations to restore your work</li>
                  </ul>
                </div>

                {/* Note */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Pure React.js:</strong> This editor runs entirely in your browser with no backend required. Annotations are saved as a separate JSON file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
