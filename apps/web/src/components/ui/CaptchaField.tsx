import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

interface CaptchaFieldProps {
  onValidate: (isValid: boolean) => void;
  error?: string | null;
}

export const CaptchaField: React.FC<CaptchaFieldProps> = ({ onValidate, error }) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isMatched, setIsMatched] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep a stable ref to onValidate so parent re-renders never trigger CAPTCHA resets
  const onValidateRef = useRef(onValidate);
  useEffect(() => {
    onValidateRef.current = onValidate;
  }, [onValidate]);

  // Generate random 5-character alphanumeric string (excluding ambiguous chars: 0, O, I, l, 1)
  const generateRandomCode = useCallback((): string => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Draw security distorted text on canvas
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark-theme');

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      bgGradient.addColorStop(0, '#1E1D19');
      bgGradient.addColorStop(1, '#2B2A25');
    } else {
      bgGradient.addColorStop(0, '#F3F1EC');
      bgGradient.addColorStop(1, '#E6E2D9');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = isDark
        ? `rgba(255, 255, 255, ${Math.random() * 0.15})`
        : `rgba(0, 0, 0, ${Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add distortion lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = isDark
        ? `rgba(0, 229, 122, ${0.2 + Math.random() * 0.3})`
        : `rgba(0, 160, 80, ${0.2 + Math.random() * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * (width / 4), Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        width - Math.random() * 20, Math.random() * height
      );
      ctx.stroke();
    }

    // Render characters with rotation and slight offset
    const charSpacing = width / (code.length + 1);
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = charSpacing * (i + 1);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${Math.floor(20 + Math.random() * 4)}px monospace`;
      ctx.fillStyle = isDark ? '#00E57A' : '#008547';
      ctx.shadowColor = isDark ? 'rgba(0, 229, 122, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;

      ctx.fillText(char, -8, 2);
      ctx.restore();
    }
  }, []);

  // Explicit refresh button click or initial mount
  const refreshCaptcha = useCallback(() => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput('');
    setIsMatched(false);
    onValidateRef.current(false);
    setTimeout(() => {
      drawCaptcha(newCode);
    }, 10);
  }, [generateRandomCode, drawCaptcha]);

  // Generate code only ONCE on mount
  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    setHasInteracted(true);

    const matches = val.trim() === captchaCode.trim() && captchaCode.length === 5;
    setIsMatched(matches);
    onValidateRef.current(matches);
  };

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border/80 bg-card/70 backdrop-blur-md p-3 shadow-xs">
      <div className="flex items-center justify-between">
        <Label htmlFor="captchaInput" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" />
          Security Verification
        </Label>
        <span className="text-[10px] font-mono text-muted-foreground">Type 5 characters</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Canvas displaying distorted code */}
        <div className="relative overflow-hidden rounded-xs border border-border/80 bg-muted shrink-0 select-none">
          <canvas
            ref={canvasRef}
            width={140}
            height={42}
            className="block cursor-pointer"
            onClick={refreshCaptcha}
            title="Click to refresh CAPTCHA code"
          />
        </div>

        {/* Refresh button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refreshCaptcha}
          className="size-9 shrink-0 rounded-xs text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          title="Get a new verification code"
        >
          <RefreshCw className="size-3.5" />
        </Button>

        {/* Input for user to type */}
        <div className="relative flex-1">
          <Input
            id="captchaInput"
            type="text"
            required
            maxLength={5}
            placeholder="Code"
            value={userInput}
            onChange={handleInputChange}
            className={`font-mono text-center tracking-widest text-xs font-bold uppercase h-9 rounded-xs ${
              isMatched
                ? 'border-ok text-ok focus-visible:ring-ok/30'
                : hasInteracted && userInput.length >= 5
                ? 'border-destructive text-destructive focus-visible:ring-destructive/30'
                : ''
            }`}
          />
        </div>
      </div>

      {hasInteracted && userInput.length >= 5 && !isMatched && (
        <p className="text-[11px] font-mono text-destructive flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" />
          Verification code does not match. Check and try again.
        </p>
      )}

      {isMatched && (
        <p className="text-[11px] font-mono text-ok flex items-center gap-1">
          <ShieldCheck className="size-3 shrink-0" />
          Verification confirmed.
        </p>
      )}

      {error && !isMatched && (
        <p className="text-[11px] font-mono text-destructive flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
