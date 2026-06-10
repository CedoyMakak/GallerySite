export function storagePathFromPublicUrl(imageUrl: string, bucket: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/object/public/${bucket}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}
