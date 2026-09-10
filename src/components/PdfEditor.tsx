'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PDFEditorObject } from '@/types';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  PenTool,
  Upload,
  Download,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Move,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FilePlus,
  CheckCircle2,
} from 'lucide-react';

export const PdfEditor: React.FC = () => {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 612, height: 792 }); // default Letter
  const [objects, setObjects] = useState<PDFEditorObject[]>([]);
  const [history, setHistory] = useState<PDFEditorObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interaction dragging/resizing state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // handle name: 'se', 'sw', etc.
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialObjState, setInitialObjState] = useState<PDFEditorObject | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Push state to history for undo/redo
  const pushHistory = (newObjects: PDFEditorObject[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newObjects);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setObjects(newObjects);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setObjects(history[historyIndex - 1]);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setObjects(history[historyIndex + 1]);
      setSelectedId(null);
    }
  };

  // Render PDF page to background canvas using PDF.js or blank canvas
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!pdfBytes) {
        // Blank document mode
        canvas.width = pageSize.width;
        canvas.height = pageSize.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      try {
        // Dynamically import pdfjs-dist on client side
        const pdfjs = await import('pdfjs-dist');
        // Set worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const loadingTask = pdfjs.getDocument({ data: pdfBytes });
        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 }); // High-DPI scale

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setPageSize({ width: viewport.width / 1.5, height: viewport.height / 1.5 });

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering PDF with PDF.js:', err);
      }
    }

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, currentPage, pageSize.width, pageSize.height]);

  // Load uploaded PDF
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      setPdfBytes(buffer);
      setCurrentPage(1);
      setObjects([]);
      setHistory([[]]);
      setHistoryIndex(0);
      showToast('PDF loaded into editor');
    };
    reader.readAsArrayBuffer(file);
  };

  // Create New Blank PDF
  const handleCreateBlank = (format: 'Letter' | 'A4' = 'Letter') => {
    setPdfBytes(null);
    setNumPages(1);
    setCurrentPage(1);
    const size = format === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 };
    setPageSize(size);
    setObjects([]);
    setHistory([[]]);
    setHistoryIndex(0);
    showToast(`Created new blank ${format} document`);
  };

  // Add Object Helpers
  const handleAddText = () => {
    const newObj: PDFEditorObject = {
      id: `text-${Date.now()}`,
      page: currentPage,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      content: 'Click to edit text',
      fontSize: 16,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#000000',
    };
    pushHistory([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleAddRectangle = () => {
    const newObj: PDFEditorObject = {
      id: `rect-${Date.now()}`,
      page: currentPage,
      type: 'rect',
      x: 120,
      y: 120,
      width: 150,
      height: 80,
      backgroundColor: 'transparent',
      borderColor: '#000000',
      borderWidth: 2,
      opacity: 1,
    };
    pushHistory([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleAddLine = () => {
    const newObj: PDFEditorObject = {
      id: `line-${Date.now()}`,
      page: currentPage,
      type: 'line',
      x: 100,
      y: 150,
      width: 200,
      height: 3,
      backgroundColor: '#000000',
      opacity: 1,
    };
    pushHistory([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleAddSignature = (sigUrl = '/assets/signatures/alex_morgan.png') => {
    const newObj: PDFEditorObject = {
      id: `sig-${Date.now()}`,
      page: currentPage,
      type: 'signature',
      x: 150,
      y: 200,
      width: 140,
      height: 50,
      imageUrl: sigUrl,
      opacity: 1,
    };
    pushHistory([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 160;
        const height = width / aspect;

        const newObj: PDFEditorObject = {
          id: `img-${Date.now()}`,
          page: currentPage,
          type: 'image',
          x: 120,
          y: 120,
          width,
          height,
          imageUrl: dataUrl,
          opacity: 1,
        };
        pushHistory([...objects, newObj]);
        setSelectedId(newObj.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Delete & Duplicate
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    pushHistory(objects.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const obj = objects.find((o) => o.id === selectedId);
    if (!obj) return;
    const duplicated: PDFEditorObject = {
      ...obj,
      id: `${obj.type}-${Date.now()}`,
      x: obj.x + 15,
      y: obj.y + 15,
    };
    pushHistory([...objects, duplicated]);
    setSelectedId(duplicated.id);
  };

  // Drag and Resize handlers
  const selectedObj = objects.find((o) => o.id === selectedId);

  const handleMouseDown = (e: React.MouseEvent, objId: string, handle?: string) => {
    e.stopPropagation();
    setSelectedId(objId);
    const obj = objects.find((o) => o.id === objId);
    if (!obj) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialObjState({ ...obj });

    if (handle) {
      setIsResizing(handle);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedObj || !initialObjState) return;

    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;

    if (isDragging) {
      setObjects((prev) =>
        prev.map((o) =>
          o.id === selectedObj.id
            ? {
                ...o,
                x: Math.max(0, initialObjState.x + dx),
                y: Math.max(0, initialObjState.y + dy),
              }
            : o
        )
      );
    } else if (isResizing) {
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id !== selectedObj.id) return o;
          let newWidth = initialObjState.width;
          let newHeight = initialObjState.height;

          if (isResizing.includes('e')) newWidth = Math.max(20, initialObjState.width + dx);
          if (isResizing.includes('s')) newHeight = Math.max(10, initialObjState.height + dy);

          return {
            ...o,
            width: newWidth,
            height: newHeight,
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(null);
      pushHistory(objects);
    }
  };

  // Export modified or blank PDF with pdf-lib
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      let pdfDoc: PDFDocument;

      if (pdfBytes) {
        pdfDoc = await PDFDocument.load(pdfBytes);
      } else {
        pdfDoc = await PDFDocument.create();
        for (let i = 0; i < numPages; i++) {
          pdfDoc.addPage([pageSize.width, pageSize.height]);
        }
      }

      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      for (const obj of objects) {
        const pageIdx = (obj.page || 1) - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { height: pageH } = page.getSize();

        // Convert DOM coordinates (top-left) to PDF coordinates (bottom-left)
        const pdfX = obj.x;
        const pdfY = pageH - obj.y - obj.height;

        if (obj.type === 'text' && obj.content) {
          const font =
            obj.fontWeight === 'bold'
              ? helveticaBold
              : obj.fontStyle === 'italic'
              ? helveticaItalic
              : helveticaFont;

          // Convert hex color to RGB
          let r = 0, g = 0, b = 0;
          if (obj.color && obj.color.startsWith('#')) {
            const hex = obj.color.replace('#', '');
            if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16) / 255;
              g = parseInt(hex.substring(2, 4), 16) / 255;
              b = parseInt(hex.substring(4, 6), 16) / 255;
            }
          }

          page.drawText(obj.content, {
            x: pdfX,
            y: pageH - obj.y - (obj.fontSize || 14),
            size: obj.fontSize || 14,
            font,
            color: rgb(r, g, b),
          });
        } else if (obj.type === 'rect') {
          let fillRgb = undefined;
          if (obj.backgroundColor && obj.backgroundColor !== 'transparent') {
            fillRgb = rgb(0.9, 0.9, 0.9);
          }
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: obj.width,
            height: obj.height,
            borderColor: rgb(0, 0, 0),
            borderWidth: obj.borderWidth || 1,
            color: fillRgb,
          });
        } else if (obj.type === 'line') {
          page.drawLine({
            start: { x: pdfX, y: pdfY + obj.height / 2 },
            end: { x: pdfX + obj.width, y: pdfY + obj.height / 2 },
            thickness: obj.height || 2,
            color: rgb(0, 0, 0),
          });
        } else if ((obj.type === 'image' || obj.type === 'signature') && obj.imageUrl) {
          try {
            const imgRes = await fetch(obj.imageUrl);
            const imgBuffer = await imgRes.arrayBuffer();
            const embedded =
              obj.imageUrl.includes('.png') || obj.imageUrl.startsWith('data:image/png')
                ? await pdfDoc.embedPng(imgBuffer)
                : await pdfDoc.embedJpg(imgBuffer);

            page.drawImage(embedded, {
              x: pdfX,
              y: pdfY,
              width: obj.width,
              height: obj.height,
            });
          } catch (imgErr) {
            console.error('Error embedding image in PDF:', imgErr);
          }
        }
      }

      const finalPdfBytes = await pdfDoc.save();
      const blob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Document_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('PDF exported successfully');
    } catch (err: any) {
      console.error(err);
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-md shadow-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          {/* File Actions */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreateBlank('Letter')}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>New Blank PDF</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          {/* Tools */}
          <button
            type="button"
            onClick={handleAddText}
            className="inline-flex items-center gap-1 text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded text-xs font-medium"
            title="Add Text"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded text-xs font-medium"
            title="Add Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddSignature()}
            className="inline-flex items-center gap-1 text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded text-xs font-medium"
            title="Add Signature"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Signature</span>
          </button>

          <button
            type="button"
            onClick={handleAddRectangle}
            className="inline-flex items-center gap-1 text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded text-xs font-medium"
            title="Add Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Rectangle</span>
          </button>

          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex items-center gap-1 text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded text-xs font-medium"
            title="Add Line"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete & Duplicate Selected */}
          {selectedId && (
            <>
              <button
                type="button"
                onClick={handleDuplicateSelected}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                title="Duplicate Object"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                title="Delete Object"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Right Side: Page Navigation, Zoom, Export */}
        <div className="flex items-center gap-3">
          {/* Page nav */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-0.5 disabled:opacity-30 hover:text-slate-900"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-0.5 disabled:opacity-30 hover:text-slate-900"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 rounded bg-white p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-1.5 rounded-md shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* Document Canvas Area */}
        <div
          className="flex-1 overflow-auto p-8 flex justify-center items-start"
          onClick={() => setSelectedId(null)}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.1s ease-out',
            }}
            className="relative shadow-xl bg-white select-none"
          >
            {/* Background Canvas (PDF.js render or blank) */}
            <canvas
              ref={canvasRef}
              style={{
                width: `${pageSize.width}px`,
                height: `${pageSize.height}px`,
                display: 'block',
              }}
            />

            {/* Overlay Objects Layer */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${pageSize.width}px`, height: `${pageSize.height}px` }}
            >
              {objects
                .filter((o) => (o.page || 1) === currentPage)
                .map((obj) => {
                  const isSelected = obj.id === selectedId;

                  return (
                    <div
                      key={obj.id}
                      onMouseDown={(e) => handleMouseDown(e, obj.id)}
                      style={{
                        position: 'absolute',
                        left: `${obj.x}px`,
                        top: `${obj.y}px`,
                        width: `${obj.width}px`,
                        height: `${obj.height}px`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        pointerEvents: 'auto',
                        border: isSelected ? '1.5px dashed #2563eb' : 'none',
                        boxSizing: 'border-box',
                      }}
                      className="group"
                    >
                      {/* Render Object by Type */}
                      {obj.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${obj.fontSize || 14}px`,
                            fontFamily: obj.fontFamily || 'Helvetica',
                            fontWeight: obj.fontWeight || 'normal',
                            fontStyle: obj.fontStyle || 'normal',
                            color: obj.color || '#000000',
                            textAlign: obj.textAlign || 'left',
                            width: '100%',
                            height: '100%',
                            wordBreak: 'break-word',
                            lineHeight: 1.2,
                          }}
                        >
                          {obj.content}
                        </div>
                      )}

                      {obj.type === 'rect' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: obj.backgroundColor || 'transparent',
                            borderColor: obj.borderColor || '#000000',
                            borderWidth: `${obj.borderWidth || 1}px`,
                            borderStyle: 'solid',
                            opacity: obj.opacity ?? 1,
                          }}
                        />
                      )}

                      {obj.type === 'line' && (
                        <div
                          style={{
                            width: '100%',
                            height: `${obj.height || 2}px`,
                            backgroundColor: obj.backgroundColor || '#000000',
                            opacity: obj.opacity ?? 1,
                          }}
                        />
                      )}

                      {(obj.type === 'image' || obj.type === 'signature') && obj.imageUrl && (
                        <img
                          src={obj.imageUrl}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            opacity: obj.opacity ?? 1,
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Resize Handle (bottom-right) */}
                      {isSelected && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, obj.id, 'se')}
                          className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-blue-600 border border-white rounded-full cursor-se-resize shadow-xs"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {selectedObj && (
          <div className="w-72 bg-white border-l border-slate-200 p-4 space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 uppercase text-[11px]">
                {selectedObj.type} Properties
              </span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete object"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Specific Controls */}
            {selectedObj.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Text Content</label>
                  <textarea
                    rows={3}
                    value={selectedObj.content || ''}
                    onChange={(e) => {
                      const updated = objects.map((o) =>
                        o.id === selectedObj.id ? { ...o, content: e.target.value } : o
                      );
                      setObjects(updated);
                    }}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedObj.fontSize || 14}
                      onChange={(e) => {
                        const updated = objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, fontSize: parseInt(e.target.value) || 14 } : o
                        );
                        setObjects(updated);
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedObj.color || '#000000'}
                      onChange={(e) => {
                        const updated = objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, color: e.target.value } : o
                        );
                        setObjects(updated);
                      }}
                      className="w-full h-7 p-0.5 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-1 border border-slate-200 rounded p-1 bg-slate-50 justify-around">
                  <button
                    type="button"
                    onClick={() => {
                      const isBold = selectedObj.fontWeight === 'bold';
                      setObjects(
                        objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, fontWeight: isBold ? 'normal' : 'bold' } : o
                        )
                      );
                    }}
                    className={`p-1.5 rounded ${
                      selectedObj.fontWeight === 'bold' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const isItalic = selectedObj.fontStyle === 'italic';
                      setObjects(
                        objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, fontStyle: isItalic ? 'normal' : 'italic' } : o
                        )
                      );
                    }}
                    className={`p-1.5 rounded ${
                      selectedObj.fontStyle === 'italic' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setObjects(objects.map((o) => (o.id === selectedObj.id ? { ...o, textAlign: 'left' } : o)))
                    }
                    className={`p-1.5 rounded ${
                      selectedObj.textAlign === 'left' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setObjects(objects.map((o) => (o.id === selectedObj.id ? { ...o, textAlign: 'center' } : o)))
                    }
                    className={`p-1.5 rounded ${
                      selectedObj.textAlign === 'center' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setObjects(objects.map((o) => (o.id === selectedObj.id ? { ...o, textAlign: 'right' } : o)))
                    }
                    className={`p-1.5 rounded ${
                      selectedObj.textAlign === 'right' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Rectangle Controls */}
            {selectedObj.type === 'rect' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Border Color</label>
                    <input
                      type="color"
                      value={selectedObj.borderColor || '#000000'}
                      onChange={(e) => {
                        setObjects(
                          objects.map((o) =>
                            o.id === selectedObj.id ? { ...o, borderColor: e.target.value } : o
                          )
                        );
                      }}
                      className="w-full h-7 p-0.5 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Border Width</label>
                    <input
                      type="number"
                      value={selectedObj.borderWidth || 1}
                      onChange={(e) => {
                        setObjects(
                          objects.map((o) =>
                            o.id === selectedObj.id ? { ...o, borderWidth: parseInt(e.target.value) || 1 } : o
                          )
                        );
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Position & Dimensions */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase">Dimensions</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Width</span>
                  <input
                    type="number"
                    value={Math.round(selectedObj.width)}
                    onChange={(e) => {
                      setObjects(
                        objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, width: parseInt(e.target.value) || 20 } : o
                        )
                      );
                    }}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Height</span>
                  <input
                    type="number"
                    value={Math.round(selectedObj.height)}
                    onChange={(e) => {
                      setObjects(
                        objects.map((o) =>
                          o.id === selectedObj.id ? { ...o, height: parseInt(e.target.value) || 10 } : o
                        )
                      );
                    }}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
