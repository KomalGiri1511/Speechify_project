import React, { useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Upload, Download, ChevronLeft, ChevronRight, FileText, MousePointer, Highlighter, Minus, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfEditor() {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pdfScale, setPdfScale] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [currentTool, setCurrentTool] = useState('underline');
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [isDownloading, setIsDownloading] = useState(false);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const containerRef = useRef(null);
  const pdfPageRef = useRef(null);

  // Upload PDF
  const handleFileUpload = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded || uploaded.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setFileName(uploaded.name);
    setAnnotations([]);
    setPageNumber(1);
    setNumPages(0);

    try {
      // Use File.arrayBuffer() instead of FileReader to prevent detachment
      const arrayBuffer = await uploaded.arrayBuffer();
      // Create a stable copy that won't be detached
      const stableBuffer = arrayBuffer.slice();
      setFileData(stableBuffer);
    } catch (error) {
      console.error('Error reading PDF file:', error);
      alert('Error reading PDF file. Please try again.');
    }
  };

  // When PDF loads successfully
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setAnnotations([]); // Clear annotations when new PDF loads
  };

  // When PDF page loads successfully
  const onPageLoadSuccess = (page) => {
    const { width, height } = page.originalWidth ? 
      { width: page.originalWidth, height: page.originalHeight } : 
      { width: page.width, height: page.height };
    setPdfDimensions({ width, height });
    
    // Calculate scale based on rendered size vs original size
    if (pdfPageRef.current) {
      const renderedWidth = pdfPageRef.current.querySelector('canvas')?.width || width;
      setPdfScale(renderedWidth / width);
    }
  };

  // Get PDF page coordinates relative to PDF content
  const getPdfCoordinates = (clientX, clientY) => {
    if (!pdfPageRef.current) return null;
    
    const pdfRect = pdfPageRef.current.getBoundingClientRect();
    
    // Get coordinates relative to the PDF page element
    const pdfX = clientX - pdfRect.left;
    const pdfY = clientY - pdfRect.top;
    
    // Check if click is within PDF bounds
    if (pdfX < 0 || pdfY < 0 || pdfX > pdfRect.width || pdfY > pdfRect.height) {
      return null;
    }
    
    // Return coordinates relative to the PDF page
    return {
      x: pdfX, // Display coordinates relative to PDF page element
      y: pdfY,
      pdfX: pdfX / pdfScale, // Actual PDF coordinates for saving
      pdfY: pdfY / pdfScale
    };
  };

  // Start drawing underline/highlight
  const handleMouseDown = (e) => {
    if (!fileData) return;
    
    const coords = getPdfCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    
    setIsDrawing(true);
    setStartPos(coords);
  };

  // Finish drawing underline/highlight
  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const coords = getPdfCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    
    const endX = coords.x;
    const minWidth = 10; // Minimum width
    
    if (Math.abs(endX - startPos.x) < minWidth) return;

    const newAnnotation = {
      type: currentTool,
      x: Math.min(startPos.x, endX),
      y: startPos.y,
      width: Math.abs(endX - startPos.x),
      height: currentTool === 'highlight' ? 14 : 3,
      page: pageNumber,
      color: currentColor,
      // Store PDF coordinates for accurate saving
      pdfX: Math.min(startPos.pdfX, coords.pdfX),
      pdfY: startPos.pdfY,
      pdfWidth: Math.abs(coords.pdfX - startPos.pdfX),
      pdfHeight: currentTool === 'highlight' ? 14 / pdfScale : 3 / pdfScale,
      scale: pdfScale,
      id: Date.now() + Math.random()
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  // Save PDF with embedded annotations
  const handleSavePDF = async () => {
    if (!fileData) {
      showDownloadError("Please upload a PDF first");
      return;
    }

    if (annotations.length === 0) {
      showDownloadError("No annotations to save. Please add some annotations first");
      return;
    }

    setIsDownloading(true);
    
    try {
      // Load the original PDF - ensure we have a valid, non-detached buffer
      let pdfBuffer;
      if (fileData instanceof ArrayBuffer) {
        // Create a new ArrayBuffer copy to ensure it's not detached
        pdfBuffer = fileData.slice();
      } else if (fileData instanceof Uint8Array) {
        pdfBuffer = fileData.buffer.slice();
      } else {
        throw new Error('Invalid PDF data format');
      }
      
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Convert hex color to RGB values (0-1 range)
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 0 }; // Default to yellow
      };
      
      // Process each annotation and embed it into the PDF
      annotations.forEach((annotation) => {
        try {
          // Validate annotation data
          if (!annotation || typeof annotation.page !== 'number' || annotation.page < 1) {
            console.warn('Invalid annotation page:', annotation);
            return;
          }
          
          if (annotation.page > pdfDoc.getPageCount()) {
            console.warn('Annotation page exceeds PDF page count:', annotation.page);
            return;
          }
          
          const page = pdfDoc.getPage(annotation.page - 1);
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Use simpler coordinate conversion
          // Get the current PDF page dimensions from the rendered page
          let displayWidth = 750; // Default width
          if (pdfPageRef.current) {
            const canvas = pdfPageRef.current.querySelector('canvas');
            if (canvas) {
              displayWidth = canvas.clientWidth || canvas.width || 750;
            }
          }
          
          // Validate annotation coordinates
          if (typeof annotation.x !== 'number' || typeof annotation.y !== 'number' || 
              typeof annotation.width !== 'number' || typeof annotation.height !== 'number') {
            console.warn('Invalid annotation coordinates:', annotation);
            return;
          }
          
          // Calculate scale factor from display to PDF coordinates
          const scale = pageWidth / displayWidth;
          
          // Convert display coordinates to PDF coordinates
          const x = annotation.x * scale;
          const width = annotation.width * scale;
          const height = annotation.height * scale;
          
          // PDF coordinate system has origin at bottom-left, so flip Y
          const y = pageHeight - (annotation.y * scale) - height;

          const color = hexToRgb(annotation.color);

          // Ensure coordinates are within bounds
          const safeX = Math.max(0, Math.min(pageWidth - 1, x));
          const safeY = Math.max(0, Math.min(pageHeight - 1, y));
          const safeWidth = Math.max(1, Math.min(pageWidth - safeX, width));
          const safeHeight = Math.max(1, Math.min(pageHeight - safeY, height));

          // Draw annotation based on type
          if (annotation.type === 'underline') {
            // Draw underline as a thick line
            page.drawLine({
              start: { x: safeX, y: safeY },
              end: { x: safeX + safeWidth, y: safeY },
              thickness: 2,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.9
            });
          } else if (annotation.type === 'highlight') {
            // Draw highlight as a semi-transparent rectangle
            page.drawRectangle({
              x: safeX,
              y: safeY,
              width: safeWidth,
              height: safeHeight,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.4,
              borderWidth: 0
            });
          }
        } catch (annotationError) {
          console.warn('Error processing annotation:', annotationError);
        }
      });

      // Save the modified PDF with error handling
      let pdfBytes;
      try {
        pdfBytes = await pdfDoc.save({
          useObjectStreams: false,
          addDefaultPage: false
        });
      } catch (saveError) {
        console.error('Error saving PDF document:', saveError);
        throw new Error('Failed to generate PDF. Please try again.');
      }
      
      // Create and download the file
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Create download like ChatGPT - direct download without user interaction
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const safeName = fileName.replace('.pdf', '').replace(/[^a-zA-Z0-9-_]/g, '_');
      const downloadName = `edited_${safeName}_${timestamp}.pdf`;
      
      // Use the modern download approach like ChatGPT
      if (window.showSaveFilePicker) {
        // Modern File System Access API (like ChatGPT)
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: downloadName,
            types: [{
              description: 'PDF files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(pdfBytes);
          await writable.close();
          
          // Show success message like ChatGPT
          showDownloadSuccess(downloadName);
          setIsDownloading(false);
        } catch (err) {
          if (err.name !== 'AbortError') {
            // Fallback to traditional download
            downloadTraditional(pdfBytes, downloadName);
          } else {
            setIsDownloading(false);
          }
        }
      } else {
        // Fallback for browsers without File System Access API
        downloadTraditional(pdfBytes, downloadName);
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      showDownloadError(error.message);
      setIsDownloading(false);
    }
  };
  
  // Traditional download method
  const downloadTraditional = (pdfBytes, fileName) => {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    showDownloadSuccess(fileName);
    setIsDownloading(false);
  };
  
  // Success notification like ChatGPT
  const showDownloadSuccess = (fileName) => {
    // Add to recent downloads
    const downloadInfo = {
      id: Date.now(),
      fileName: fileName,
      originalName: fileName,
      downloadTime: new Date().toLocaleString(),
      size: 'PDF File',
      annotations: annotations.length
    };
    
    setRecentDownloads(prev => [downloadInfo, ...prev.slice(0, 4)]); // Keep last 5 downloads
    
    // Create a toast notification like ChatGPT
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-sm';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
      </svg>
      <div>
        <div class="font-medium">PDF downloaded successfully</div>
        <div class="text-xs opacity-90">Saved to Downloads folder</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  };
  
  // Error notification
  const showDownloadError = (errorMessage) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <span>Download failed: ${errorMessage}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  };

  const memoizedFile = useMemo(() => {
    if (!fileData) return null;
    
    // Ensure we pass a stable buffer to react-pdf
    try {
      if (fileData instanceof ArrayBuffer) {
        return { data: fileData.slice() };
      } else if (fileData instanceof Uint8Array) {
        return { data: fileData };
      }
      return { data: fileData };
    } catch (error) {
      console.error('Error preparing PDF data:', error);
      return null;
    }
  }, [fileData]);

  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .pdf-scroll-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .pdf-scroll-container::-webkit-scrollbar-track {
          background: #f0f9ff;
          border-radius: 4px;
        }
        .pdf-scroll-container::-webkit-scrollbar-thumb {
          background: #0ea5e9;
          border-radius: 4px;
        }
        .pdf-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #0284c7;
        }
        .pdf-scroll-container::-webkit-scrollbar-corner {
          background: #f0f9ff;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 flex flex-col items-center py-8 px-4">
      {/* Header Section */}
      <div className="w-full max-w-6xl text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-800">PDF Editor</h1>
        </div>
        <p className="text-lg text-blue-600 mb-6">
          Edit PDFs by adding highlights and underlines - Save as a new file with permanent changes
        </p>

        {/* Upload Section - Improved Styling */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-200 p-8 max-w-md mx-auto mb-8">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-sky-300 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all duration-300">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-sky-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-800 mb-1">
                  Upload PDF File
                </p>
                <p className="text-sm text-blue-500">
                  Click to browse or drag and drop
                </p>
              </div>
            </div>
          </label>

          {/* File Info */}
          {fileName && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <FileText className="w-5 h-5" />
                <span className="font-medium truncate">{fileName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl flex flex-col gap-8">
        {/* PDF Display Section */}
        {memoizedFile && (
          <div className="w-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-200 p-6">
              {/* Editing Toolbar */}
              <div className="mb-6 p-4 bg-sky-50 rounded-xl border border-sky-200">
                <h3 className="font-semibold text-blue-800 mb-3">Editing Tools</h3>
                
                {/* Tool Selection */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setCurrentTool('underline')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentTool === 'underline' 
                        ? 'bg-sky-600 text-white' 
                        : 'bg-white text-blue-700 hover:bg-sky-50'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Underline
                  </button>
                  
                  <button
                    onClick={() => setCurrentTool('highlight')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentTool === 'highlight' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Highlighter className="w-4 h-4" />
                    Highlight
                  </button>
                  
                </div>
                
                {/* Color Selection */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-700">Color:</span>
                  <div className="flex gap-2">
                    {['#0EA5E9', '#3B82F6', '#1E40AF', '#10B981', '#F59E0B', '#000000'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCurrentColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          currentColor === color 
                            ? 'border-blue-400 scale-110' 
                            : 'border-sky-200 hover:border-sky-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-8 h-8 rounded border border-sky-200 cursor-pointer"
                  />
                </div>
                
                {/* Current Tool Info */}
                <div className="mt-3 p-2 bg-white rounded-lg border border-sky-200">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium text-blue-700">Active Tool:</span> 
                    <span className="capitalize text-blue-800">{currentTool}</span>
                    <span className="text-blue-600">{' (Click and drag to draw)'}</span>
                  </p>
                </div>
              </div>

              {/* Controls Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">PDF Editor</h3>
                    <p className="text-sm text-blue-500">Select tool and drag to annotate</p>
                  </div>
                </div>

                {/* Page Navigation */}
                {numPages > 1 && (
                  <div className="flex items-center gap-4 bg-sky-100 rounded-xl px-4 py-2">
                    <button
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber === 1}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-blue-700" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-blue-700">
                      <span className="font-medium">Page</span>
                      <span className="bg-white px-3 py-1 rounded-lg font-semibold">
                        {pageNumber}
                      </span>
                      <span className="text-blue-500">of {numPages}</span>
                    </div>
                    
                    <button
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber === numPages}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-blue-700" />
                    </button>
                  </div>
                )}
              </div>

              {/* PDF Container */}
              <div
                ref={containerRef}
                className="border-2 border-sky-200 bg-white rounded-xl shadow-inner"
                style={{ 
                  height: "75vh", 
                  minHeight: "600px",
                  maxHeight: "75vh",
                  overflow: "hidden"
                }}
              >
                <div 
                  className="pdf-scroll-container overflow-y-auto overflow-x-auto w-full h-full flex justify-center"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#0ea5e9 #f0f9ff'
                  }}
                >
                  <div className="relative p-4 flex justify-center items-start min-h-full">
                    <Document
                      file={memoizedFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-64 w-full">
                          <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-600">Loading PDF...</p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center h-64 w-full">
                          <div className="text-center">
                            <p className="text-red-600 mb-2">Failed to load PDF</p>
                            <p className="text-slate-500 text-sm">Please try uploading again</p>
                          </div>
                        </div>
                      }
                    >
                      <div 
                        ref={pdfPageRef}
                        className="relative"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                      >
                        <Page 
                          pageNumber={pageNumber} 
                          width={Math.min(750, containerRef.current?.clientWidth - 40 || 750)}
                          onLoadSuccess={onPageLoadSuccess}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="shadow-lg"
                        />
                        
                        {/* User Annotations - Positioned relative to PDF page */}
                        {annotations
                          .filter((a) => a.page === pageNumber)
                          .map((annotation) => (
                            <div
                              key={annotation.id}
                              className={`absolute pointer-events-none ${
                                annotation.type === 'highlight' ? 'rounded-sm' : 'rounded-full'
                              }`}
                              style={{
                                left: `${annotation.x}px`,
                                top: `${annotation.y}px`,
                                width: `${annotation.width}px`,
                                height: `${annotation.height}px`,
                                backgroundColor: annotation.color,
                                opacity: annotation.type === 'highlight' ? 0.4 : 0.8,
                                zIndex: 10,
                                transform: 'translateZ(0)'
                              }}
                            >
                              {/* Delete button for annotation */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
                                }}
                                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-auto"
                                style={{ fontSize: '10px' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </Document>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Info Section - Bottom */}
        {memoizedFile && (
          <div className="w-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Stats */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-800 text-lg mb-4">Document Info</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-200">
                      <div className="text-2xl font-bold text-sky-600">{numPages}</div>
                      <div className="text-sm text-blue-600">Total Pages</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                        <div className="text-xl font-bold text-blue-600">
                          {annotations.length}
                        </div>
                        <div className="text-xs text-blue-600">Total</div>
                      </div>
                      
                      <div className="bg-sky-50 rounded-xl p-3 text-center border border-sky-200">
                        <div className="text-xl font-bold text-sky-600">
                          {annotations.filter(a => a.page === pageNumber).length}
                        </div>
                        <div className="text-xs text-blue-600">This Page</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                    <div className="text-sm text-blue-600 mb-2">Current File</div>
                    <div className="font-medium text-blue-800 truncate">{fileName}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-800 text-lg">Actions</h3>
                  
                  <button
                    onClick={handleSavePDF}
                    disabled={!fileData || annotations.length === 0 || isDownloading}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-sky-600 disabled:hover:to-blue-700"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {annotations.length === 0 ? 'Add annotations to download' : `Download PDF (${annotations.length} edits)`}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setAnnotations([])}
                    disabled={annotations.length === 0}
                    className="w-full flex items-center justify-center gap-3 bg-sky-100 hover:bg-sky-200 text-blue-700 font-medium py-3 px-6 rounded-xl border border-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear All Annotations
                  </button>

                  {/* Instructions */}
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">How to use:</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Select highlight or underline tool</li>
                      <li>• Choose your preferred color</li>
                      <li>• Click and drag over text to edit</li>
                      <li>• Download saves to Downloads folder</li>
                    </ul>
                  </div>
                </div>

                {/* Recent Downloads */}
                <div className="space-y-4">
                  {recentDownloads.length > 0 && (
                    <>
                      <h3 className="font-semibold text-blue-800 text-lg mb-4">Recent Downloads</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {recentDownloads.map((download) => (
                          <div key={download.id} className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                  <p className="text-sm font-medium text-blue-800 truncate">
                                    {download.fileName.length > 15 ? 
                                      `${download.fileName.substring(0, 15)}...` : 
                                      download.fileName
                                    }
                                  </p>
                                </div>
                                <p className="text-xs text-blue-500">
                                  {download.downloadTime}
                                </p>
                                <p className="text-xs text-sky-600 font-medium">
                                  {download.annotations} annotations
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  // Show file location info
                                  const locationToast = document.createElement('div');
                                  locationToast.className = 'fixed top-4 right-4 bg-sky-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
                                  locationToast.innerHTML = `
                                    <div class="text-sm">
                                      <div class="font-medium mb-1">File Location</div>
                                      <div class="text-xs opacity-90">Check your Downloads folder:</div>
                                      <div class="text-xs font-mono bg-sky-700 px-2 py-1 rounded mt-1">
                                        ~/Downloads/${download.fileName}
                                      </div>
                                    </div>
                                  `;
                                  document.body.appendChild(locationToast);
                                  setTimeout(() => {
                                    if (locationToast.parentNode) {
                                      locationToast.parentNode.removeChild(locationToast);
                                    }
                                  }, 5000);
                                }}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Show Location
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <h4 className="font-semibold text-blue-800 text-sm">Download Location</h4>
                        </div>
                        <p className="text-xs text-blue-700">
                          Files are saved to your <strong>Downloads</strong> folder.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Empty State */}
      {!memoizedFile && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              No PDF Uploaded
            </h3>
            <p className="text-blue-600 mb-4">
              Upload a PDF file to start underlining text and editing your document.
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}