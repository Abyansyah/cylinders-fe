'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, CameraDevice, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Video, RefreshCcw, Loader2, Zap, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

const PREFERRED_CAMERA_ID_KEY = 'preferred_camera_id';

const scannerStyles = `
  #reader {
    width: 100%;
    border: none;
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
    border-radius: 8px; /* samakan dengan radius card */
  }
  #reader video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #reader__dashboard_section_csr,
  #reader__dashboard_section_fsr {
    display: none; /* Sembunyikan tombol-tombol default */
  }
  #reader__scan_region {
    border: 3px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  }
`;

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startCameraScanManually = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const availableCameras = await Html5Qrcode.getCameras();
      if (availableCameras && availableCameras.length > 0) {
        setCameras(availableCameras);
        if (availableCameras.length === 1) {
          handleCameraSelect(availableCameras[0].id);
        }
      } else {
        setError('Tidak ada kamera yang ditemukan.');
      }
    } catch (err) {
      setError('Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraSelect = (cameraId: string) => {
    if (!html5QrcodeRef.current) return;

    setIsLoading(true);
    html5QrcodeRef.current
      .start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          onScan(decodedText);
          handleClose();
        },
        (errorMessage) => {}
      )
      .then(() => {
        localStorage.setItem(PREFERRED_CAMERA_ID_KEY, cameraId);
        setSelectedCameraId(cameraId);
        setIsScanning(true);
        setError(null);
      })
      .catch((err) => {
        setError(`Gagal memulai kamera. Pilih kamera lain atau muat ulang.`);
        localStorage.removeItem(PREFERRED_CAMERA_ID_KEY);
        setIsScanning(false);
        setSelectedCameraId(null);
        setCameras([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleStopScan = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          setSelectedCameraId(null);
          startCameraScanManually();
        })
        .catch((err) => console.error('Gagal menghentikan scanner.', err));
    }
  };

  const handleClose = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current.stop().catch((err) => console.error('Gagal menghentikan scanner saat menutup.', err));
    }
    onClose();
  };

  useEffect(() => {
    if (!readerRef.current) return;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = scannerStyles;
    document.head.appendChild(styleElement);

    const qrCodeScanner = new Html5Qrcode(readerRef.current.id, false);
    html5QrcodeRef.current = qrCodeScanner;

    const initializeScanner = async () => {
      const savedCameraId = localStorage.getItem(PREFERRED_CAMERA_ID_KEY);
      if (savedCameraId) {
        try {
          const availableCameras = await Html5Qrcode.getCameras();
          const savedCameraExists = availableCameras.some((cam) => cam.id === savedCameraId);

          if (savedCameraExists) {
            setCameras(availableCameras);
            handleCameraSelect(savedCameraId);
          } else {
            localStorage.removeItem(PREFERRED_CAMERA_ID_KEY);
            setIsLoading(false);
          }
        } catch (err) {
          setError('Izin kamera diperlukan. Aktifkan di browser Anda.');
          localStorage.removeItem(PREFERRED_CAMERA_ID_KEY);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeScanner();

    return () => {
      document.head.removeChild(styleElement);
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err) => console.error('Cleanup failed to stop scanner.', err));
      }
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 min-h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Mempersiapkan kamera...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={startCameraScanManually}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
        </div>
      );
    }

    if (isScanning) {
      return (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm text-muted-foreground">
            Arahkan kamera ke barcode
          </motion.div>
          <Button variant="outline" className="w-full" onClick={handleStopScan}>
            Ganti Kamera
          </Button>
        </div>
      );
    }

    if (cameras.length > 0 && !selectedCameraId) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-3">
          <p className="text-center text-sm text-muted-foreground">Pilih Kamera</p>
          {cameras.map((camera) => (
            <Button key={camera.id} variant="outline" onClick={() => handleCameraSelect(camera.id)} className="justify-start">
              <Video className="mr-2 h-4 w-4" />
              {camera.label || `Kamera ${camera.id.substring(0, 6)}`}
            </Button>
          ))}
        </motion.div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <motion.div className='flex flex-col items-center'>
          <Camera className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Pindai Barcode</h3>
          <p className="text-sm text-muted-foreground mb-6">Izinkan akses ke kamera Anda untuk memulai.</p>
          <Button onClick={startCameraScanManually}>
            <Camera className="mr-2 h-4 w-4" /> Pindai dengan Kamera
          </Button>
        </motion.div>
      </div>
    );
  };

  const scannerContent = (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan Barcode
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div id="reader" ref={readerRef} className="w-full" />
              <div className="mt-4">{renderContent()}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(scannerContent, document.body);
}
