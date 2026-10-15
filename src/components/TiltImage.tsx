import { useRef } from "react";

const MAX_TILT = 8;

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
};

export function TiltImage({ src, alt, width, height, className = "tilt", imgClassName = "project-image" }: Props) {
  const frame = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 80ms linear";
    el.style.transform = `perspective(900px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg) scale(1.02)`;
  };

  const onLeave = () => {
    const el = frame.current;
    if (!el) return;
    el.style.transition = "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "";
  };

  return (
    <div className={className} ref={frame} onPointerMove={onMove} onPointerLeave={onLeave}>
      <img className={imgClassName} src={src} alt={alt} width={width} height={height} loading="lazy" />
    </div>
  );
}
