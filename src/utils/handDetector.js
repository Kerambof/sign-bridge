import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

class HandDetector {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.onResultsCallback = null;
  }

  initialize(videoElement, canvasElement, onResults) {
    this.onResultsCallback = onResults;

    // Initialize MediaPipe Hands with local files
    this.hands = new Hands({
      locateFile: (file) => {
        return `/mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults((results) => this.processResults(results, canvasElement));

    // Initialize camera
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720
    });

    this.camera.start();
  }

  processResults(results, canvasElement) {
    const canvasCtx = canvasElement.getContext('2d');
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw hand landmarks if detected
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw connections (green lines)
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 3
        });

        // Draw landmarks (red dots)
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 4
        });
      }
    }

    canvasCtx.restore();

    // Send results to callback
    if (this.onResultsCallback) {
      this.onResultsCallback(results);
    }
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }
}

export default HandDetector;