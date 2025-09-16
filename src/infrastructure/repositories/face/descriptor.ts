import { faceapi } from './faceapiLoader';

export async function getFaceDescriptorFromCanvas(
  canvas: HTMLCanvasElement,
  minScore = 0.6
) {
  const opts = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: minScore
  });

  const det = await faceapi
    .detectSingleFace(canvas, opts)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!det) return null;

  const area = det.detection.box.width * det.detection.box.height;
  if (area < 80 * 80) return null; // heurística de calidad

  return Array.from(det.descriptor); // número[] (128 floats)
}
