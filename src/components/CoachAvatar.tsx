// Coach sprites are portrait (128x175). object-contain + the real aspect
// ratio keeps the whole image visible (no cropped heads/name banners);
// block + mx-auto centers it regardless of the parent's text alignment.
export function CoachAvatar({
  src,
  alt,
  width = "5rem",
}: {
  src: string;
  alt: string;
  width?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small local pixel-art sprites, no need for next/image optimization
    <img
      src={src}
      alt={alt}
      style={{ width }}
      className="mx-auto block aspect-[128/175] rounded-lg border border-white/10 object-contain [image-rendering:pixelated]"
    />
  );
}
