/**
 * iPhones save Photos-library originals as HEIC/HEIF, which Chrome (and most
 * non-Safari browsers) can't decode in an <img>/canvas — picking straight
 * from Photos hands the browser that HEIC file, so it must be converted to
 * JPEG first or the resize step below fails outright.
 */
function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  return type === "image/heic" || type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

async function toDecodableBlob(file: File): Promise<Blob> {
  if (!isHeic(file)) return file;

  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(converted) ? converted[0] : converted;
}

/** Client-only: downscales/compresses an uploaded photo before it's sent to the server, since it ends up base64-encoded in Redis. */
export async function resizeImageToDataUrl(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  const decodableBlob = await toDecodableBlob(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("failed to read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("failed to load image"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(decodableBlob);
  });
}
