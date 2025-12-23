import { useEffect, useRef } from "react";
import "@google/model-viewer";

interface ModelViewerProps {
  src: string;
  alt?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  shadowIntensity?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ModelViewer({
  src,
  alt = "3D Model",
  autoRotate = true,
  cameraControls = true,
  shadowIntensity = "1",
  className,
  style,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Create model-viewer element
      const modelViewer = document.createElement("model-viewer");
      modelViewer.setAttribute("src", src);
      modelViewer.setAttribute("alt", alt);
      if (autoRotate) modelViewer.setAttribute("auto-rotate", "");
      if (cameraControls) modelViewer.setAttribute("camera-controls", "");
      modelViewer.setAttribute("shadow-intensity", shadowIntensity);
      modelViewer.style.width = "100%";
      modelViewer.style.height = "100%";
      
      // Clear and append
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(modelViewer);
    }
  }, [src, alt, autoRotate, cameraControls, shadowIntensity]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
