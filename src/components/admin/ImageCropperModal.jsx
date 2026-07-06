import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
  X, 
  Check, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Sparkles, 
  Crop as CropIcon, 
  RefreshCw, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context available');
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.putImageData(data, 0, 0);

  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;
  const maxDim = 1600;

  if (targetWidth > targetHeight && targetWidth > maxDim) {
    targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
    targetWidth = maxDim;
  } else if (targetHeight > maxDim) {
    targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
    targetHeight = maxDim;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.drawImage(cropCanvas, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const fileName = `cropped_${Date.now()}.webp`;
        const file = new File([blob], fileName, { type: 'image/webp', lastModified: Date.now() });
        resolve({ file, dataUrl: finalCanvas.toDataURL('image/webp', 0.85) });
      },
      'image/webp',
      0.85
    );
  });
}

export default function ImageCropperModal({ 
  isOpen, 
  imageSrc, 
  onClose, 
  onCropComplete, 
  initialAspect = 1 
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(initialAspect);
  const [showGrid, setShowGrid] = useState(true);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onCropChange = (location) => {
    setCrop(location);
  };

  const onZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCompletedCrop(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(initialAspect);
    setErrorMsg('');
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imageSrc) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const { file, dataUrl } = await getCroppedImg(imageSrc, completedCrop, rotation);
      onCropComplete(file, dataUrl);
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
      setErrorMsg('Failed to process image crop. Please try resetting or selecting another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const aspectRatios = [
    { label: '1:1 Square (Recommended)', value: 1 / 1, recommended: true },
    { label: '4:3 Standard', value: 4 / 3 },
    { label: '3:4 Portrait', value: 3 / 4 },
    { label: '16:9 Wide', value: 16 / 9 },
    { label: 'Free / Original', value: undefined }
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-cream-100 rounded-3xl border-2 border-gold/40 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-charcoal text-cream-100 px-6 py-4 flex items-center justify-between border-b border-gold/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <CropIcon className="w-5 h-5 text-gold" />
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-cream-100 flex items-center gap-2">
                Image Cropper & Alignment Tool
              </h3>
              <p className="text-[10px] text-cream-300 font-sans hidden sm:block">
                Crop and center your image so it fits perfectly on storefront product cards without being cut off
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-cream-200 hover:text-gold transition-colors rounded-full cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-2.5 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cropper Workspace */}
        <div className="relative w-full h-[320px] sm:h-[420px] bg-charcoal-950 shrink-0 select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            showGrid={showGrid}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            onRotationChange={setRotation}
            style={{
              containerStyle: { background: '#121212' },
              cropAreaStyle: { border: '2px solid #D4AF37', boxShadow: '0 0 0 9999em rgba(18, 18, 18, 0.75)' }
            }}
          />
        </div>

        {/* Controls Section */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-cream-200/50 flex-1">
          
          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-2 flex items-center justify-between">
              <span>1. Choose Aspect Ratio</span>
              <span className="text-[10px] text-gold-700 font-semibold normal-case flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1:1 Square ensures best look on website
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((ratio, idx) => {
                const isSelected = aspect === ratio.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAspect(ratio.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-charcoal text-gold shadow-md ring-2 ring-gold/50' 
                        : 'bg-cream-100 text-charcoal border border-cream-300 hover:border-gold hover:bg-cream-200'
                    }`}
                  >
                    {ratio.recommended && <span className="w-2 h-2 rounded-full bg-gold inline-block animate-pulse"></span>}
                    {ratio.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom and Rotate Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-300">
            
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-gold-700" /> Zoom Level
                </span>
                <span className="text-gold-700 font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                  className="p-1.5 rounded-lg bg-cream-100 border border-cream-300 text-charcoal hover:border-gold"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-gold h-2 bg-cream-300 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                  className="p-1.5 rounded-lg bg-cream-100 border border-cream-300 text-charcoal hover:border-gold"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-gold-700" /> Rotation
                </span>
                <span className="text-gold-700 font-mono">{rotation}°</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRotation((rotation - 90) % 360)}
                  className="p-1.5 rounded-lg bg-cream-100 border border-cream-300 text-charcoal hover:border-gold"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 accent-gold h-2 bg-cream-300 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setRotation((rotation + 90) % 360)}
                  className="p-1.5 rounded-lg bg-cream-100 border border-cream-300 text-charcoal hover:border-gold"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Action Buttons (Grid toggle & Reset) */}
          <div className="flex items-center justify-between pt-2 border-t border-cream-300 text-xs">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                showGrid ? 'bg-gold/20 text-gold-800 border border-gold/40' : 'bg-cream-100 text-stone-warm hover:text-charcoal'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              {showGrid ? 'Grid Lines: ON' : 'Grid Lines: OFF'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-warm hover:text-red-600 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Adjustments
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-cream-100 px-6 py-4 border-t border-gold/30 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-warm hidden sm:block">
            💡 <span className="font-semibold text-charcoal">Tip:</span> Drag image to reposition inside frame.
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-cream-200 text-charcoal text-xs font-semibold hover:bg-cream-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-400 text-charcoal-950 font-bold text-xs tracking-wide transition-all shadow-luxury active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Crop...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Apply Crop & Save
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
