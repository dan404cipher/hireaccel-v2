import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/api/v1/files/resume/${fileId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
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
    loadPDF();
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setError(null);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
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
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {fileName || 'PDF Document'}
        </DialogTitle>
        <div className="min-h-[32px] flex items-center px-2 border-b bg-white relative">
          <span className="text-sm font-medium text-gray-700 truncate pr-12">
            {fileName || 'PDF Document'}
          </span>
          <div className="absolute right-0 top-0 h-full flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-[32px] w-8 p-0 rounded-none hover:bg-gray-100"
              title="Download"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-[32px] w-8 p-0 rounded-none hover:bg-gray-100"
              title="Close"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl + '#view=FitH'} 
              className="absolute inset-0 w-full h-full border-0"
              title={fileName || 'PDF Document'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;