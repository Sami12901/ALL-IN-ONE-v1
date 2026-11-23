/**
 * TypeScript definitions for ALL-IN-ONE-v1 Media Removal Engine
 */

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BoundingBoxResult extends BoundingBox {
  normalized: BoundingBox;
}

export interface SelectionControllerOptions {
  mode?: 'box' | 'brush';
  brushSize?: number;
  initialBox?: BoundingBox;
  onSelectionChange?: () => void;
}

export interface SelectionController {
  setMode(mode: 'box' | 'brush'): void;
  getMode(): 'box' | 'brush';
  setBrushSize(px: number): void;
  getBrushSize(): number;
  setEraser(enabled: boolean): void;
  isEraser(): boolean;
  setBoundingBox(normalizedBox: BoundingBox): void;
  getBoundingBox(targetWidth?: number, targetHeight?: number): BoundingBoxResult;
  getBinaryMask(targetWidth?: number, targetHeight?: number): Uint8Array;
  clear(): void;
  setMask?(binaryMask: Uint8Array, maskWidth?: number, maskHeight?: number): void;
  undo(): void;
  onSelectionChange(callback: () => void): void;
  render(): void;
  destroy(): void;
}

export interface TemporalSmoothResult {
  imageData: ImageData;
  isSceneCut: boolean;
}

export interface ProcessVideoProgress {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  currentTime: number;
  duration: number;
}

export interface ProcessVideoResult {
  blob: Blob;
  url: string;
}

export interface ProcessVideoOptions {
  videoElement: HTMLVideoElement;
  renderCanvas: HTMLCanvasElement;
  region: BoundingBox;
  algorithm?: 'delogo' | 'telea' | 'ns' | 'exemplar';
  fps?: number;
  temporalSmoothing?: boolean;
  onProgress?: (progress: ProcessVideoProgress) => void;
  onComplete?: (result: ProcessVideoResult) => void;
  onError?: (error: Error) => void;
}

export interface VideoController {
  cancel(): void;
}

export interface SampleImageResult {
  canvas: HTMLCanvasElement | null;
  imageData: ImageData;
  binaryMask: Uint8Array;
  box: BoundingBox;
  dataUrl: string | null;
  getBlob: ((callback: (blob: Blob | null) => void) => void) | null;
}

export interface DetectedRegion extends BoundingBox {
  confidence: number;
  type: 'text' | 'logo' | 'watermark';
}

export interface AutoDetectOptions {
  type?: 'text' | 'logo' | 'watermark' | 'all';
  sensitivity?: number;
  minArea?: number;
  maxRegions?: number;
  returnMask?: boolean;
  padding?: number;
}

export interface SampleVideoResult {
  blob: Blob | null;
  url: string | null;
  width: number;
  height: number;
  duration: number;
  box: BoundingBox;
}

export interface MediaRemovalEngine {
  version: string;
  createImageData(width: number, height: number, data?: ArrayLike<number>): ImageData;
  cloneImageData(src: ImageData): ImageData;
  inpaintTelea(imageData: ImageData, binaryMask: Uint8Array, radius?: number): ImageData;
  inpaintNavierStokes(imageData: ImageData, binaryMask: Uint8Array, iterations?: number, dt?: number): ImageData;
  inpaintExemplar(imageData: ImageData, binaryMask: Uint8Array, patchRadius?: number, searchWindow?: number): ImageData;
  delogoBilinear(imageData: ImageData, box: BoundingBox, blurRadius?: number): ImageData;
  temporalSmooth(currentImageData: ImageData, prevImageData: ImageData | null, box: BoundingBox, alpha?: number, sceneCutThreshold?: number): TemporalSmoothResult;
  createSelectionController(containerOrCanvas: HTMLElement | HTMLCanvasElement, options?: SelectionControllerOptions): SelectionController;
  processVideo(options: ProcessVideoOptions): VideoController;
  processVideoFrames(options: ProcessVideoOptions): VideoController;
  generateSampleImage(type?: 'photo' | 'text' | 'logo' | 'watermark', options?: { width?: number; height?: number; text?: string }): SampleImageResult;
  generateSampleVideo(type?: 'animated' | 'static', options?: { width?: number; height?: number; duration?: number }): Promise<SampleVideoResult>;
  autoDetectRegions(imageData: ImageData, options?: AutoDetectOptions): DetectedRegion[] | { regions: DetectedRegion[]; binaryMask: Uint8Array };
  autoDetectText(imageData: ImageData, options?: AutoDetectOptions): DetectedRegion[];
  autoDetectLogos(imageData: ImageData, options?: AutoDetectOptions): DetectedRegion[];
  autoDetectWatermarks(imageData: ImageData, options?: AutoDetectOptions): DetectedRegion[];
  createMaskFromRegions(regions: DetectedRegion[], width: number, height: number, padding?: number): Uint8Array;
}

declare const MediaRemovalEngine: MediaRemovalEngine;
export default MediaRemovalEngine;

declare global {
  interface Window {
    MediaRemovalEngine: MediaRemovalEngine;
  }
}
