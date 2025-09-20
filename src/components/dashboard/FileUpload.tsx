import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileProcessed: (data: any) => void;
}

interface UploadStatus {
  file: File | null;
  uploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
}

export const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    file: null,
    uploading: false,
    progress: 0,
    status: 'idle',
    message: ''
  });
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      '.xls',
      '.xlsx',
      '.csv'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.some(type => 
      file.type === type || fileExtension === type.replace('.', '')
    );

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .xls, .xlsx, or .csv file",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus({
      file,
      uploading: false,
      progress: 0,
      status: 'idle',
      message: `Ready to upload: ${file.name}`
    });
  }, [toast]);

  const handleUpload = useCallback(async () => {
    if (!uploadStatus.file) return;

    setUploadStatus(prev => ({
      ...prev,
      uploading: true,
      status: 'uploading',
      progress: 0,
      message: 'Uploading file...'
    }));

    try {
      // Real upload
      const form = new FormData();
      form.append('file', uploadStatus.file);

      const { API_BASE_URL } = await import('@/lib/utils');
      const axios = (await import('axios')).default;

      const isXlsx = uploadStatus.file.name.toLowerCase().endsWith('.xlsx') || uploadStatus.file.name.toLowerCase().endsWith('.xls');
      const endpoint = isXlsx ? `${API_BASE_URL}/api/upload/xlsx` : `${API_BASE_URL}/api/upload/csv`;

      const resp = await axios.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 50) / e.total);
            setUploadStatus(prev => ({ ...prev, progress: percent }));
          }
        }
      });

      setUploadStatus(prev => ({
        ...prev,
        status: 'processing',
        progress: 70,
        message: 'Processing CDR data...'
      }));

      setUploadStatus(prev => ({
        ...prev,
        status: 'complete',
        uploading: false,
        progress: 100,
        message: `Successfully processed ${resp.data.insertedCount || 0} CDR records`
      }));

      onFileProcessed({ batchId: resp.data.batchId, recordsProcessed: resp.data.insertedCount });

      toast({
        title: "File processed successfully",
        description: `${resp.data.insertedCount || 0} CDR records have been imported and analyzed`,
      });

    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        status: 'error',
        uploading: false,
        message: 'Failed to process file. Please try again.'
      }));

      toast({
        title: "Upload failed",
        description: "There was an error processing your CDR file",
        variant: "destructive"
      });
    }
  }, [uploadStatus.file, onFileProcessed, toast]);

  const resetUpload = () => {
    setUploadStatus({
      file: null,
      uploading: false,
      progress: 0,
      status: 'idle',
      message: ''
    });
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CDR File Upload
        </CardTitle>
        <CardDescription>
          Upload .xls, .xlsx, or .csv files containing Call Detail Records for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadStatus.status === 'idle' && !uploadStatus.file ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Choose CDR file to upload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports .xls, .xlsx, and .csv formats up to 100MB
            </p>
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileSelect}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Select File
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium">{uploadStatus.file?.name}</p>
                <p className="text-sm text-muted-foreground">{uploadStatus.message}</p>
              </div>
            </div>

            {uploadStatus.uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadStatus.progress}%</span>
                </div>
                <Progress value={uploadStatus.progress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              {uploadStatus.status === 'idle' && uploadStatus.file && !uploadStatus.uploading && (
                <Button onClick={handleUpload} className="flex-1">
                  Process File
                </Button>
              )}
              {uploadStatus.status === 'complete' && (
                <Button onClick={resetUpload} variant="outline" className="flex-1">
                  Upload Another File
                </Button>
              )}
              {uploadStatus.status === 'error' && (
                <Button onClick={resetUpload} variant="outline" className="flex-1">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};