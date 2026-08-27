import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, User, RefreshCw } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);

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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Camera access not granted or unavailable on this device.');
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
      <span className="text-xs font-semibold text-[var(--ink)]">{label}</span>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
        
        {/* Avatar Display Frame */}
        <div className="relative size-20 sm:size-24 rounded-2xl border-2 border-[var(--line-strong)] bg-[var(--surface)] overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
          {isCapturingWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="size-full object-cover"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
          ) : value ? (
            <img src={value} alt="Member Photo" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--muted)]">
              <User className="size-8 opacity-50" />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
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
                className="bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold gap-1.5 h-8 flex-1"
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
                className="text-xs h-8 gap-1.5 border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--line)]"
              >
                <Upload className="size-3.5" />
                <span>Upload Image</span>
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startWebcam}
                className="text-xs h-8 gap-1.5 border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--line)]"
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
                  className="text-xs h-8 text-[var(--err)] hover:bg-[var(--err-soft)] px-2"
                  title="Remove Photo"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span>WebP compressed for fast check-in</span>
            {fileSizeKb && (
              <Badge variant="outline" className="text-[10px] font-mono bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30">
                {fileSizeKb} KB
              </Badge>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
