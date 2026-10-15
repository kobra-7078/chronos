/**
 * Dynamic Favicon Generator for Chronos
 * Uses the uploaded astronomical Chronos mechanism image asset,
 * renders it dynamically into an offscreen canvas with circular mask and theme accent glow,
 * and sets it as the browser tab favicon.
 */

export interface ThemeColors {
  accent: string;
  accentLight: string;
}

export const THEME_COLOR_MAP: Record<string, ThemeColors> = {
  'warm-amber': { accent: '#d97736', accentLight: '#f39c55' },
  'terracotta': { accent: '#dd6247', accentLight: '#f78b74' },
  'warm-sepia': { accent: '#c98a4c', accentLight: '#e0a66c' },
  'warm-sage': { accent: '#6f9c79', accentLight: '#93bd9c' },
  'warm-midnight': { accent: '#d2946c', accentLight: '#ebb08a' },
  'light-parchment': { accent: '#c86a27', accentLight: '#df7e38' },
  'light-sand': { accent: '#b8682a', accentLight: '#d17f3d' },
  'light-sage': { accent: '#4a7c59', accentLight: '#629c73' },
  'light-terracotta': { accent: '#c94e34', accentLight: '#e0654b' },
  'light-clean': { accent: '#d97706', accentLight: '#f59e0b' },
};

let cachedLogoImg: HTMLImageElement | null = null;

export function updateFavicon(themeId: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const colors = THEME_COLOR_MAP[themeId] || THEME_COLOR_MAP['warm-amber'];

  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Generate dynamic canvas favicon with the actual astronomical logo
  const renderFavicon = (img: HTMLImageElement) => {
    try {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        link!.href = '/chronos-logo.jpg';
        return;
      }

      ctx.clearRect(0, 0, size, size);

      // Outer theme accent glow
      const radius = size / 2 - 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the uploaded logo
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();

      // Draw outer accent border ring
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.accent;
      ctx.stroke();

      link!.type = 'image/png';
      link!.href = canvas.toDataURL('image/png');
    } catch {
      link!.href = '/chronos-logo.jpg';
    }
  };

  if (cachedLogoImg && cachedLogoImg.complete) {
    renderFavicon(cachedLogoImg);
  } else {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/chronos-logo.jpg';
    img.onload = () => {
      cachedLogoImg = img;
      renderFavicon(img);
    };
    img.onerror = () => {
      link!.href = '/chronos-logo.jpg';
    };
  }
}
