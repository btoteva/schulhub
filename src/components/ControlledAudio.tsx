import React, { useRef, useEffect } from "react";
import { useAudioVolume } from "../contexts/AudioVolumeContext";

interface ControlledAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
  children?: React.ReactNode;
}

/** Audio element whose volume is synced with the global AudioVolume context. */
const ControlledAudio: React.FC<ControlledAudioProps> = ({ src, className, children, ...rest }) => {
  const ref = useRef<HTMLAudioElement>(null);
  const { volume } = useAudioVolume();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = volume;
  }, [volume, src]);

  return (
    <audio ref={ref} controls className={className} src={src} {...rest}>
      {children}
    </audio>
  );
};

export default ControlledAudio;
