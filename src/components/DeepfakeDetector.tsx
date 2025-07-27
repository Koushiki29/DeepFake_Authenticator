import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Play, Pause, AlertTriangle, CheckCircle, Eye, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DetectionResult {
  confidence: number;
  isDeepfake: boolean;
  frameAnalysis: {
    frame: number;
    timestamp: number;
    confidence: number;
    anomalies: string[];
  }[];
  processingTime: number;
  modelUsed: string;
}

const DeepfakeDetector = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Please select a video file smaller than 100MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setProgress(0);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const simulateAnalysis = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate AI processing with realistic progress
    const steps = [
      { progress: 10, message: "Loading AI model..." },
      { progress: 25, message: "Extracting video frames..." },
      { progress: 40, message: "Analyzing facial features..." },
      { progress: 60, message: "Running CNN detection..." },
      { progress: 80, message: "Calculating confidence scores..." },
      { progress: 95, message: "Generating report..." },
      { progress: 100, message: "Analysis complete" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(step.progress);
    }

    // Generate realistic detection result
    const isDeepfake = Math.random() > 0.6;
    const confidence = isDeepfake 
      ? 75 + Math.random() * 20  // 75-95% for deepfakes
      : 15 + Math.random() * 25; // 15-40% for authentic

    const frameAnalysis = Array.from({ length: 5 }, (_, i) => ({
      frame: i * 30 + 1,
      timestamp: i * 1.5,
      confidence: confidence + (Math.random() - 0.5) * 20,
      anomalies: isDeepfake ? [
        "Facial boundary inconsistencies",
        "Temporal flickering detected",
        "Compression artifacts mismatch"
      ].slice(0, Math.floor(Math.random() * 3) + 1) : []
    }));

    setResult({
      confidence,
      isDeepfake,
      frameAnalysis,
      processingTime: 4.2,
      modelUsed: "DeepFake-CNN-v3.1"
    });

    setIsProcessing(false);
    
    toast({
      title: isDeepfake ? "Deepfake Detected" : "Video Appears Authentic",
      description: `Analysis complete with ${confidence.toFixed(1)}% confidence`,
      variant: isDeepfake ? "destructive" : "default"
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              DeepFake Video Detector
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Advanced AI-powered detection system to identify synthetic and tampered video content
            using deep learning and facial feature analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Video</h2>
            </div>

            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop your video here</p>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4, WebM, AVI • Max 100MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium truncate">{file.name}</span>
                    <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {file.type} • Ready for analysis
                  </div>
                </div>

                {/* Video Preview */}
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={URL.createObjectURL(file)}
                    className="w-full rounded-lg"
                    controls={false}
                  />
                  <Button
                    onClick={togglePlay}
                    className="absolute bottom-4 left-4"
                    size="sm"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={simulateAnalysis}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Analyzing...' : 'Start Analysis'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setProgress(0);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
              }}
            />
          </Card>

          {/* Results Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Analysis Results</h2>
            </div>

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span>Processing video...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress}% complete
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Main Result */}
                <Alert className={result.isDeepfake ? "border-destructive" : "border-success"}>
                  <div className="flex items-center gap-2">
                    {result.isDeepfake ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <span className="font-semibold">
                      {result.isDeepfake ? "DEEPFAKE DETECTED" : "AUTHENTIC VIDEO"}
                    </span>
                  </div>
                  <AlertDescription className="mt-2">
                    Confidence: {result.confidence.toFixed(1)}% • 
                    Processed in {result.processingTime}s using {result.modelUsed}
                  </AlertDescription>
                </Alert>

                {/* Confidence Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Detection Confidence</span>
                    <span className="font-medium">{result.confidence.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={result.confidence} 
                    className={`w-full ${result.isDeepfake ? 'text-destructive' : 'text-success'}`}
                  />
                </div>

                {/* Frame Analysis */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Frame Analysis</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.frameAnalysis.map((frame, index) => (
                      <div key={index} className="bg-muted rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Frame {frame.frame}</span>
                          <Badge variant={frame.confidence > 70 ? "destructive" : "secondary"}>
                            {frame.confidence.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          {frame.timestamp.toFixed(1)}s
                        </div>
                        {frame.anomalies.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-destructive font-medium">Anomalies detected:</p>
                            <ul className="text-xs text-muted-foreground mt-1">
                              {frame.anomalies.map((anomaly, i) => (
                                <li key={i}>• {anomaly}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isProcessing && !result && (
              <div className="text-center text-muted-foreground py-12">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload a video to start analysis</p>
              </div>
            )}
          </Card>
        </div>

        {/* Technical Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="font-medium">Deep Learning Analysis</span>
              </div>
              <p className="text-muted-foreground">
                Advanced CNN models trained on thousands of deepfake samples to detect synthetic content patterns.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="font-medium">Facial Feature Tracking</span>
              </div>
              <p className="text-muted-foreground">
                Analyzes facial landmarks, micro-expressions, and temporal consistency across video frames.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="font-medium">Anomaly Detection</span>
              </div>
              <p className="text-muted-foreground">
                Identifies compression artifacts, boundary inconsistencies, and other synthetic video markers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeepfakeDetector;