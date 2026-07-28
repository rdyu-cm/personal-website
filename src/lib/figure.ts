export interface FigureInput {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export const validateFigure = ({
  src,
  alt,
  caption,
  width,
  height,
}: FigureInput) => {
  if (!src.trim()) throw new Error("Figure source must be nonempty.");
  if (!alt.trim()) throw new Error("Figure alt text must be nonempty.");
  if (!caption.trim()) throw new Error("Figure caption must be nonempty.");
  if (!Number.isFinite(width) || width <= 0)
    throw new Error("Figure width must be a positive finite number.");
  if (!Number.isFinite(height) || height <= 0)
    throw new Error("Figure height must be a positive finite number.");
};

export const resolveFigureSource = (src: string, base: string) => {
  if (/^https?:\/\//i.test(src)) return src;
  const baseUrl = new URL(
    base.endsWith("/") ? base : `${base}/`,
    "https://figure.local",
  );
  const resolved = new URL(src.replace(/^\/+/, ""), baseUrl);

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
};
