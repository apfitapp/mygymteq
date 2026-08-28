import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { compressAndConvertToBase64 } from '@/lib/image';

interface PhotoCaptureUploadProps {
  value?: string;
  onChange: (base64Url: string) => void;
  label?: string;
}

export const PhotoCaptureUpload: React.FC<PhotoCaptureUploadProps> = ({
  value,
  onChange,
  label = 'Member Profile Photo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);

  // Safely attach stream to video element when webcam activates
  useEffect(() => {
    if (isCapturingWebcam && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Webcam video play auto-start error:', err);
      });
    }
  }, [isCapturingWebcam, stream]);

  // Clean up media tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await compressAndConvertToBase64(file, { maxWidth: 300, maxHeight: 300, quality: 0.75 });
      onChange(result.base64);
      setFileSizeKb(Math.round(result.sizeBytes / 1024));
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setIsCapturingWebcam(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera access was not granted or is unavailable on this device.');
    }
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, 300, 300);
      const base64 = canvas.toDataURL('image/webp', 0.75);
      onChange(base64);
      setFileSizeKb(Math.round((base64.length * 3) / 4096));
    }
    stopWebcam();
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturingWebcam(false);
  };

  const clearPhoto = () => {
    onChange('');
    setFileSizeKb(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-sm border border-border bg-secondary/50">
        
        {/* Avatar Display Frame */}
        <div className="relative size-20 sm:size-24 rounded-sm border-2 border-border bg-card overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
          {isCapturingWebcam ? (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && stream && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="size-full object-cover"
            />
          ) : value ? (
            <img src={value} alt="Member Photo" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <User className="size-8 opacity-50" />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
              <RefreshCw className="size-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 flex flex-col gap-2 w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isCapturingWebcam ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={snapPhoto}
                className="bg-primary text-primary-foreground text-xs font-bold gap-1.5 h-8 flex-1"
              >
                <Camera className="size-3.5" />
                <span>Snap Photo</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={stopWebcam}
                className="text-xs h-8"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-8 gap-1.5 border-border bg-card hover:bg-secondary"
              >
                <Upload className="size-3.5" />
                <span>Upload Image</span>
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startWebcam}
                className="text-xs h-8 gap-1.5 border-border bg-card hover:bg-secondary"
              >
                <Camera className="size-3.5" />
                <span>Use Webcam</span>
              </Button>

              {value && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearPhoto}
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 px-2"
                  title="Remove Photo"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>WebP compressed for fast check-in</span>
            {fileSizeKb && (
              <Badge variant="outline" className="text-[10px] font-mono bg-ok/10 text-ok border-ok/30">
                {fileSizeKb} KB
              </Badge>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
