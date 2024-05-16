import React, { useEffect, useRef, useState } from 'react';
import useLogic from './hooks/index';
import { css } from '@emotion/css';
import Webcam from 'react-webcam'; // Import Webcam component
import '../hands-capture/style.css';

function FeetCapture() {
  const { webcamRef, maxVideoWidth, maxVideoHeight, canvasEl, cameraReady, modelReady } = useLogic(); 
  const [loading, setLoading] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  useEffect(() => {
    const storedPermission = sessionStorage.getItem('cameraPermissionGranted');
    
    if (storedPermission !== null) {
      setCameraPermissionGranted(storedPermission === 'true');
    } else {
      async function checkCameraPermission() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermissionGranted(true);
          sessionStorage.setItem('cameraPermissionGranted', 'true');
          stream.getTracks().forEach(track => track.stop()); // Close the stream to release resources
        } catch (error) {
          console.error('Failed to access the camera', error);
          setCameraPermissionGranted(false);
          sessionStorage.setItem('cameraPermissionGranted', 'false');
        }
      }
      checkCameraPermission();
    }
  }, []);
  useEffect(() => {
    if (cameraReady && modelReady && !!canvasEl && cameraPermissionGranted) {
      setTimeout(()=>setLoading(false),3000)
      
    } else {
      setLoading(true);
    }
    console.log('Model Ready:', modelReady, 'Camera Ready:', cameraReady, 'Camera Ready:', !!canvasEl);
  }, [modelReady, cameraReady, cameraPermissionGranted]);

  return (
    <div className={styles.container}>
       {loading && cameraPermissionGranted === true && ( // Display loading only when camera permission is granted
        <div className={styles.loading}>Loading... </div>
      )}
      {cameraPermissionGranted === false && ( // Display camera permission denied message
        <div className={styles.permissionDenied}>Camera permission denied. Please allow access to the camera.</div>
      )}
      <Webcam
        style={{ display: 'none' }}
        className='video'
        playsInline
        ref={webcamRef} // Use webcamRef instead of videoElement
      />
      <canvas ref={canvasEl} style={{ minWidth: '50%' }} width={maxVideoWidth} height={maxVideoHeight} />
    </div>
  );
}

const styles = {
  container: css`
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  canvas: css`
    position: absolute;
    max-width: 100vw; 
    min-width: 50%;
    height: auto;
    width: 60vw !important;
    background-color: #fff;
  `,
  loading: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    color: #000;
    background-color: rgba(255, 255, 255, 100);
  `,
  permissionDenied: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    color: #f00;
    background-color: rgba(255, 255, 255,100);
  `,
};

export default FeetCapture;
