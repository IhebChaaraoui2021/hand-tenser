import React from 'react';
import useLogic from './hooks/index';
import { css } from '@emotion/css';
import Webcam from 'react-webcam'; // Import Webcam component

function FeetCapture() {
  const { webcamRef, maxVideoWidth, maxVideoHeight, canvasEl } = useLogic(); // Change variable names
  return (
    <div className={styles.container}>
      <Webcam
        style={{ display: 'none' }}
        className='video'
        playsInline
        ref={webcamRef} // Use webcamRef instead of videoElement
      />
      <canvas ref={canvasEl} width={maxVideoWidth} height={maxVideoHeight} />
    </div>
  );
}

const styles = {
  container: css`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    background: #213547;
    justify-content: center;
    align-items: center;
  `,
  canvas: css`
    position: absolute;
    width: 1280px;
    height: 720px;
    background-color: #fff;
  `,
};

export default FeetCapture;
