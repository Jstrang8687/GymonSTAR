export function CoachAvatar({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small local pixel-art sprites, no need for next/image optimization
    <img
      src={src}
      alt={alt}
      className={`rounded-lg border border-white/10 object-cover [image-rendering:pixelated] ${className}`}
    />
  );
}
