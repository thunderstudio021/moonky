import { useEffect } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useTheme } from "@/components/ThemeProvider";

// Convert HEX to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Format HSL for CSS variable (without hsl() wrapper)
function formatHSL(hsl: { h: number; s: number; l: number }): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

// Adjust lightness for variants
function adjustLightness(hsl: { h: number; s: number; l: number }, amount: number): { h: number; s: number; l: number } {
  return {
    ...hsl,
    l: Math.max(0, Math.min(100, hsl.l + amount)),
  };
}

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useStoreSettings();
  const { setTheme } = useTheme();

  // Apply default theme from settings on first load
  useEffect(() => {
    if (settings?.default_theme) {
      const savedTheme = localStorage.getItem('moonky-theme');
      // Only set default theme if user hasn't explicitly chosen one
      if (!savedTheme) {
        setTheme(settings.default_theme as 'light' | 'dark' | 'system');
      }
    }
  }, [settings?.default_theme, setTheme]);

  // Apply dynamic colors
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply primary color
    if (settings.primary_color) {
      const primaryHSL = hexToHSL(settings.primary_color);
      if (primaryHSL) {
        const primaryStr = formatHSL(primaryHSL);
        const primaryLightStr = formatHSL(adjustLightness(primaryHSL, 10));
        const primaryDarkStr = formatHSL(adjustLightness(primaryHSL, -10));

        root.style.setProperty('--primary', primaryStr);
        root.style.setProperty('--primary-light', primaryLightStr);
        root.style.setProperty('--primary-dark', primaryDarkStr);
        root.style.setProperty('--ring', primaryStr);
        root.style.setProperty('--sidebar-primary', primaryStr);
        root.style.setProperty('--sidebar-ring', primaryStr);

        // Update gradients
        root.style.setProperty(
          '--gradient-primary',
          `linear-gradient(135deg, hsl(${primaryStr}) 0%, hsl(${primaryLightStr}) 100%)`
        );
        root.style.setProperty(
          '--shadow-glow',
          `0 0 0 3px hsl(${primaryStr} / 0.15)`
        );
      }
    }

    // Apply secondary color if set
    if (settings.secondary_color) {
      const secondaryHSL = hexToHSL(settings.secondary_color);
      if (secondaryHSL) {
        // Use secondary color for accent elements
        const secondaryStr = formatHSL(secondaryHSL);
        root.style.setProperty('--accent', secondaryStr);
      }
    }
  }, [settings?.primary_color, settings?.secondary_color]);

  return <>{children}</>;
}
