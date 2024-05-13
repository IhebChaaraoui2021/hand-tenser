import { useEffect, useRef } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import {
  drawConnectors,
  drawLandmarks,
  drawRectangle,
} from '@mediapipe/drawing_utils';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import useKeyPointClassifier from '../hooks/useKeyPointClassifier';
import CONFIGS from '../../../constants';
import Webcam from 'react-webcam'; // Import Webcam component

const maxVideoWidth: number = 960;
const maxVideoHeight: number = 540;

function useLogic() {
  const webcamRef = useRef<Webcam>(null); // Ref for Webcam component
  const hands = useRef<Hands | null>(null);
  const camera = useRef<Camera | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const handsGesture = useRef<any[]>([]); // Define appropriate type for handsGesture array

  const { processLandmark } = useKeyPointClassifier();

  async function onResults(results: any) {
    if (canvasEl.current && results.multiHandLandmarks.length) {
      const ctx = canvasEl.current.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
        ctx.drawImage(webcamRef.current.video, 0, 0, maxVideoWidth, maxVideoHeight); // Use webcamRef to access video

        results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
          processLandmark(landmarks, results.image).then((val) => {
            handsGesture.current[index] = val;
          });

          const landmarksX = landmarks.map((landmark: any) => landmark.x);
          const landmarksY = landmarks.map((landmark: any) => landmark.y);
          ctx.fillStyle = '#ff0000';
          ctx.font = '24px serif';
          ctx.fillText(
            CONFIGS.keypointClassifierLabels[handsGesture.current[index]],
            maxVideoWidth * Math.min(...landmarksX),
            maxVideoHeight * Math.min(...landmarksY) - 15
          );

          drawRectangle(
            ctx,
            {
              xCenter:
                Math.min(...landmarksX) +
                (Math.max(...landmarksX) - Math.min(...landmarksX)) / 2,
              yCenter:
                Math.min(...landmarksY) +
                (Math.max(...landmarksY) - Math.min(...landmarksY)) / 2,
              width: Math.max(...landmarksX) - Math.min(...landmarksX),
              height: Math.max(...landmarksY) - Math.min(...landmarksY),
              rotation: 0,
            },
            {
              fillColor: 'transparent',
              color: 'transparent',
              lineWidth: 0,
            }
          );

          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: '#00ffff',
            lineWidth: 2,
          });

          drawLandmarks(ctx, landmarks, {
            color: '#ffff29',
            lineWidth: 1,
          });

          // Draw circle between hands
          drawCircle(ctx, results.multiHandLandmarks);
        });

        ctx.restore();
      }
    }
  }

  // Function to draw a circle between hand landmarks
  const drawCircle = (ctx: CanvasRenderingContext2D, handLandmarks: any[]) => {
    if (handLandmarks.length === 2 && handLandmarks[0].length > 8 && handLandmarks[1].length > 8) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const [x1, y1] = [handLandmarks[0][8].x * width, handLandmarks[0][8].y * height];
      const [x2, y2] = [handLandmarks[1][8].x * width, handLandmarks[1][8].y * height];
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      const r = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2;

      ctx.strokeStyle = '#0082cf';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.stroke();
    }
  };

  const loadHands = () => {
    hands.current = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.current.onResults(onResults);
  };

  useEffect(() => {
    async function initCamera() {
      camera.current = new Camera(webcamRef.current.video!, { // Use webcamRef to access video
        onFrame: async () => {
          await hands.current!.send({ image: webcamRef.current.video! }); // Use webcamRef to access video
        },
        width: maxVideoWidth,
        height: maxVideoHeight,
      });
      camera.current.start();
    }

    initCamera();
    loadHands();
  }, []);

  return { maxVideoHeight, maxVideoWidth, canvasEl, webcamRef };
}

export default useLogic;
