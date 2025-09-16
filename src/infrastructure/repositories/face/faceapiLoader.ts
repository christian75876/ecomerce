import * as faceapi from 'face-api.js';

let loaded = false;

export async function loadFaceApiModels(basePath = '/models/faceapi') {
  if (loaded) return;
  await faceapi.tf.setBackend('webgl');
  await faceapi.tf.ready();

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
    faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
    faceapi.nets.faceRecognitionNet.loadFromUri(basePath)
  ]);
  loaded = true;
}

export { faceapi };
