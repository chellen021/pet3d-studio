declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean;
        "disable-zoom"?: boolean;
        "disable-pan"?: boolean;
        "disable-tap"?: boolean;
        "touch-action"?: string;
        "shadow-intensity"?: string;
        "shadow-softness"?: string;
        "exposure"?: string;
        "environment-image"?: string;
        "skybox-image"?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "ios-src"?: string;
        "camera-orbit"?: string;
        "camera-target"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        "interpolation-decay"?: string;
        "animation-name"?: string;
        "animation-crossfade-duration"?: string;
        autoplay?: boolean;
      },
      HTMLElement
    >;
  }
}
