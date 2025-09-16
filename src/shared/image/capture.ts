export function captureSquare(video: HTMLVideoElement, size = 720) {
  const canvas = document.createElement('canvas');
  const minSide = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - minSide) / 2;
  const sy = (video.videoHeight - minSide) / 2;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, sx, sy, minSide, minSide, 0, 0, size, size);
  return canvas;
}
