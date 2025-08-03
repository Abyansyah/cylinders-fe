'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export interface SignatureCanvasProps {
  onSignatureChange: (signature: string, svg: string) => void;
  width: number;
  height: number;
  isFullscreen?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

export interface SignatureData {
  base64: string;
  svg: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureChange, width, height, isFullscreen = false, strokeColor = '#000000', strokeWidth = 3, backgroundColor = 'white' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Array<{ x: number; y: number }[]>>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set drawing styles
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Redraw all paths
    paths.forEach((path) => {
      if (path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }
    });

    // Draw current path
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [paths, currentPath, width, height, strokeColor, strokeWidth, backgroundColor]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentPath([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    setCurrentPath((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath.length > 0) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath([]);

      // Generate signature data after a short delay to ensure canvas is updated
      setTimeout(() => {
        generateSignature();
      }, 50);
    }
    setIsDrawing(false);
  };

  const generateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Generate base64
      const base64 = canvas.toDataURL('image/png');

      // Generate SVG
      const svg = generateSVG();

      onSignatureChange(base64, svg);
    } catch (error) {
      console.error('Error generating signature:', error);
    }
  };

  const generateSVG = () => {
    let svgPaths = '';

    // Combine all paths including current path if it exists
    const allPaths = [...paths, ...(currentPath.length > 1 ? [currentPath] : [])];

    allPaths.forEach((path) => {
      if (path.length > 1) {
        let pathData = `M ${path[0].x.toFixed(2)} ${path[0].y.toFixed(2)}`;
        for (let i = 1; i < path.length; i++) {
          pathData += ` L ${path[i].x.toFixed(2)} ${path[i].y.toFixed(2)}`;
        }
        svgPaths += `<path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });

    // SVG with transparent background (no background rect)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${svgPaths}
    </svg>`;
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    onSignatureChange('', '');
  };

  const hasSignature = () => {
    return paths.length > 0 || currentPath.length > 0;
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className={`border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none transition-colors hover:border-gray-400 ${isFullscreen ? 'w-full h-full' : 'w-full'}`}
        style={{
          width: isFullscreen ? '100%' : width,
          height: isFullscreen ? '60vh' : height,
          maxWidth: '100%',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{isFullscreen ? 'Gambar tanda tangan Anda di area di atas' : 'Ketuk tombol expand untuk tanda tangan fullscreen'}</p>
        <Button type="button" variant="outline" size="sm" onClick={clearSignature} disabled={!hasSignature()}>
          Hapus Tanda Tangan
        </Button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
