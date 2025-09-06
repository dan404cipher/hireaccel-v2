import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use public worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  fileId: string;
  fileName: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileId, 
  fileName, 
  trigger, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    console.log(`PDF loaded successfully with ${numPages} pages`);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading PDF file:', fileId);
      console.log('API URL:', `/api/v1/files/resume/${fileId}`);
      console.log('Access token available:', !!localStorage.getItem('accessToken'));
      
      const response = await fetch(getApiUrl(`/api/v1/files/resume/${fileId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Failed to load PDF: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('PDF ArrayBuffer size:', arrayBuffer.byteLength);
      console.log('Expected file size:', 132265);
      
      // Check if this is actually a PDF by looking at the first few bytes
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 10));
      const firstBytes = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log('First 10 bytes (hex):', firstBytes);
      
      // Check if it starts with PDF signature
      const textDecoder = new TextDecoder();
      const firstChars = textDecoder.decode(arrayBuffer.slice(0, 20));
      console.log('First 20 characters:', firstChars);
      
      setPdfData(arrayBuffer);
      setLoading(false);
      console.log('PDF data set successfully, loading should be false now');
      
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/files/resume/${fileId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, response.statusText, errorText);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download Started',
        description: 'Your resume download has started.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    loadPDF(); // Always reload PDF data when opening
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setError(null);
    setPageNumber(1);
    setScale(1.0);
    setRotation(0);
    setPdfData(null); // Clear the PDF data when closing
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const defaultTrigger = trigger || (
    <Button variant="outline" size="sm">
      <Eye className="w-4 h-4 mr-2" />
      View PDF
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpenDialog}>
        {children || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 bg-gray-50">
        <DialogHeader className="p-3 border-b bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {fileName || 'PDF Document'}
            </DialogTitle>
            <div className="flex items-center gap-1">
              {/* Navigation controls */}
              {numPages && numPages > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[70px] text-center">
                    {pageNumber} / {numPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                </>
              )}
              
              {/* Zoom controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="h-8 px-2"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="px-2 py-1 bg-gray-100 rounded text-sm font-medium min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 3.0}
                className="h-8 px-2"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <div className="h-6 w-px bg-gray-300 mx-2" />
              
              {/* Rotate button */}
              <Button
                variant="outline"
                size="sm"
                onClick={rotate}
                className="h-8 px-2"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              {/* Download button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 px-3 mr-7"
                title="Download"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              

            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="flex justify-center items-start min-h-full">
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading PDF...</span>
              </div>
            )}
            
            {error && (
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {pdfData && !loading && !error && (
              <div className="flex flex-col items-center w-full">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <Document
                    file={pdfData}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    onLoadProgress={({ loaded, total }) => {
                      console.log('PDF load progress:', loaded, '/', total);
                    }}
                    loading={
                      <div className="flex items-center justify-center h-96 w-[600px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading PDF Document...</span>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-96 w-[600px]">
                        <Alert className="max-w-md">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Failed to load PDF document</AlertDescription>
                        </Alert>
                      </div>
                    }
                    className="pdf-document"
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      loading={
                        <div className="flex items-center justify-center h-96 w-[600px] bg-gray-50">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center h-96 w-[600px] bg-gray-50">
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Failed to load page</AlertDescription>
                          </Alert>
                        </div>
                      }
                      className="pdf-page"
                    />
                  </Document>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
