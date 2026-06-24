import React, { useRef, useEffect } from 'react';
import { initThreeScene } from '../utils/threeScene';

export default function Canvas3D({ onProgress, onReady, onSpeedChange, onZoneChange, onToast, isNight, panelOpen }) {
  const canvasRef = useRef(null);
  const sceneControllerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize the Three.js scene and save the controller
    sceneControllerRef.current = initThreeScene(canvasRef.current, {
      onProgress,
      onReady,
      onSpeedChange,
      onZoneChange,
      onToast
    });

    return () => {
      // Cleanup on unmount
      if (sceneControllerRef.current) {
        sceneControllerRef.current.cleanup();
      }
    };
  }, []); // Run once on mount

  // Sync React state down to Three.js imperative code
  useEffect(() => {
    if (sceneControllerRef.current) {
      sceneControllerRef.current.setTheme(isNight);
    }
  }, [isNight]);

  useEffect(() => {
    if (sceneControllerRef.current) {
      sceneControllerRef.current.setPause(panelOpen);
    }
  }, [panelOpen]);

  return <canvas id="canvas" ref={canvasRef}></canvas>;
}
