/**
 * Flying Fox Solutions - Theme Provider
 *
 * Comprehensive theming system for diverse visual appearances.
 * Supports multiple themes, custom branding, and dynamic theme switching.
 *
 * Features:
 * - Multiple built-in themes (modern, classic, minimal, vibrant)
 * - Custom color schemes and branding
 * - Dark/light mode support
 * - Typography customization
 * - Spacing and layout variations
 * - CSS custom properties integration
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider, useTheme } from "@ffx/sdk";
 *
 * function App() {
 *   return (
 *     <ThemeProvider theme="modern" colorScheme="blue">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeVariant =
  | "modern"
  | "classic"
  | "minimal"
  | "vibrant"
  | "corporate"
  | "creative";
export type ColorScheme =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "pink"
  | "gray"
  | "custom";
export type ColorMode = "light" | "dark" | "auto";

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingConfig {
  scale: number; // Multiplier for spacing values
  unit: string; // Base unit (rem, px, etc.)
}

export interface ThemeConfig {
  variant: ThemeVariant;
  colorScheme: ColorScheme;
  colorMode: ColorMode;
  customColors?: Partial<CustomColors>;
  typography?: Partial<TypographyConfig>;
  spacing?: Partial<SpacingConfig>;
  borderRadius?: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows?: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  animations?: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleColorMode: () => void;
  applyTheme: (themeName: string) => void;
  getComputedColors: () => CustomColors;
  cssVariables: Record<string, string>;
}

const defaultTheme: ThemeConfig = {
  variant: "modern",
  colorScheme: "blue",
  colorMode: "light",
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      serif: ["Georgia", "serif"],
      mono: ["Fira Code", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    scale: 1,
    unit: "rem",
  },
  borderRadius: {
    sm: "0.25rem",
    base: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      linear: "linear",
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },
};

// Built-in color schemes
const colorSchemes: Record<ColorScheme, Partial<CustomColors>> = {
  blue: {
    primary: "#3B82F6",
    secondary: "#6366F1",
    accent: "#06B6D4",
  },
  green: {
    primary: "#10B981",
    secondary: "#059669",
    accent: "#34D399",
  },
  purple: {
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#A78BFA",
  },
  orange: {
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#FBBF24",
  },
  red: {
    primary: "#EF4444",
    secondary: "#DC2626",
    accent: "#F87171",
  },
  pink: {
    primary: "#EC4899",
    secondary: "#DB2777",
    accent: "#F472B6",
  },
  gray: {
    primary: "#6B7280",
    secondary: "#4B5563",
    accent: "#9CA3AF",
  },
  custom: {}, // Will be overridden by customColors
};

// Theme variants with different styling approaches
const themeVariants: Record<ThemeVariant, Partial<ThemeConfig>> = {
  modern: {
    borderRadius: {
      sm: "0.375rem",
      base: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
  },
  classic: {
    borderRadius: {
      sm: "0.125rem",
      base: "0.25rem",
      lg: "0.375rem",
      xl: "0.5rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      base: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
      lg: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
      xl: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
    },
  },
  minimal: {
    borderRadius: {
      sm: "0",
      base: "0",
      lg: "0.125rem",
      xl: "0.25rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
      base: "0 2px 4px rgba(0, 0, 0, 0.1)",
      lg: "0 4px 8px rgba(0, 0, 0, 0.1)",
      xl: "0 8px 16px rgba(0, 0, 0, 0.1)",
    },
  },
  vibrant: {
    borderRadius: {
      sm: "0.5rem",
      base: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
      base: "0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
      lg: "0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)",
      xl: "0 16px 32px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.15)",
    },
  },
  corporate: {
    typography: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Times New Roman", "serif"],
        mono: ["Courier New", "monospace"],
      },
    },
    borderRadius: {
      sm: "0.125rem",
      base: "0.25rem",
      lg: "0.375rem",
      xl: "0.5rem",
      full: "9999px",
    },
  },
  creative: {
    borderRadius: {
      sm: "0.75rem",
      base: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 4px 8px rgba(0, 0, 0, 0.15)",
      base: "0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)",
      lg: "0 16px 32px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.15)",
      xl: "0 24px 48px rgba(0, 0, 0, 0.3), 0 12px 24px rgba(0, 0, 0, 0.2)",
    },
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: ThemeVariant;
  colorScheme?: ColorScheme;
  colorMode?: ColorMode;
  customColors?: Partial<CustomColors>;
  initialTheme?: Partial<ThemeConfig>;
}

export function ThemeProvider({
  children,
  theme = "modern",
  colorScheme = "blue",
  colorMode = "light",
  customColors,
  initialTheme,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const merged = {
      ...defaultTheme,
      variant: theme,
      colorScheme,
      colorMode,
      customColors,
      ...initialTheme,
    };
    return merged;
  });

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setCurrentTheme((prev) => ({ ...prev, ...newTheme }));
  };

  const toggleColorMode = () => {
    setCurrentTheme((prev) => ({
      ...prev,
      colorMode: prev.colorMode === "light" ? "dark" : "light",
    }));
  };

  const applyTheme = (themeName: string) => {
    const variant = themeName as ThemeVariant;
    if (themeVariants[variant]) {
      setCurrentTheme((prev) => ({
        ...prev,
        variant,
        ...themeVariants[variant],
      }));
    }
  };

  const getComputedColors = (): CustomColors => {
    const baseColors = colorSchemes[currentTheme.colorScheme] || {};
    const customColors = currentTheme.customColors || {};
    const isDark = currentTheme.colorMode === "dark";

    return {
      primary: customColors.primary || baseColors.primary || "#3B82F6",
      secondary: customColors.secondary || baseColors.secondary || "#6366F1",
      accent: customColors.accent || baseColors.accent || "#06B6D4",
      success: customColors.success || "#10B981",
      warning: customColors.warning || "#F59E0B",
      error: customColors.error || "#EF4444",
      info: customColors.info || "#3B82F6",
      background: customColors.background || (isDark ? "#111827" : "#FFFFFF"),
      surface: customColors.surface || (isDark ? "#1F2937" : "#F9FAFB"),
      text: customColors.text || (isDark ? "#F9FAFB" : "#111827"),
      textSecondary:
        customColors.textSecondary || (isDark ? "#D1D5DB" : "#6B7280"),
      border: customColors.border || (isDark ? "#374151" : "#E5E7EB"),
    };
  };

  const cssVariables = React.useMemo(() => {
    const colors = getComputedColors();
    const typography = {
      ...defaultTheme.typography,
      ...currentTheme.typography,
    };
    const spacing = { ...defaultTheme.spacing, ...currentTheme.spacing };
    const borderRadius = {
      ...defaultTheme.borderRadius,
      ...currentTheme.borderRadius,
    };
    const shadows = { ...defaultTheme.shadows, ...currentTheme.shadows };
    const animations = {
      ...defaultTheme.animations,
      ...currentTheme.animations,
    };

    return {
      // Colors
      "--ffx-color-primary": colors.primary,
      "--ffx-color-secondary": colors.secondary,
      "--ffx-color-accent": colors.accent,
      "--ffx-color-success": colors.success,
      "--ffx-color-warning": colors.warning,
      "--ffx-color-error": colors.error,
      "--ffx-color-info": colors.info,
      "--ffx-color-background": colors.background,
      "--ffx-color-surface": colors.surface,
      "--ffx-color-text": colors.text,
      "--ffx-color-text-secondary": colors.textSecondary,
      "--ffx-color-border": colors.border,

      // Typography
      "--ffx-font-sans": typography.fontFamily!.sans.join(", "),
      "--ffx-font-serif": typography.fontFamily!.serif.join(", "),
      "--ffx-font-mono": typography.fontFamily!.mono.join(", "),
      "--ffx-text-xs": typography.fontSize!.xs,
      "--ffx-text-sm": typography.fontSize!.sm,
      "--ffx-text-base": typography.fontSize!.base,
      "--ffx-text-lg": typography.fontSize!.lg,
      "--ffx-text-xl": typography.fontSize!.xl,
      "--ffx-text-2xl": typography.fontSize!["2xl"],
      "--ffx-text-3xl": typography.fontSize!["3xl"],
      "--ffx-text-4xl": typography.fontSize!["4xl"],

      // Border radius
      "--ffx-radius-sm": borderRadius!.sm || "0.25rem",
      "--ffx-radius-base": borderRadius!.base || "0.5rem",
      "--ffx-radius-lg": borderRadius!.lg || "0.75rem",
      "--ffx-radius-xl": borderRadius!.xl || "1rem",
      "--ffx-radius-full": borderRadius!.full || "9999px",

      // Shadows
      "--ffx-shadow-sm": shadows!.sm || "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "--ffx-shadow-base":
        shadows!.base ||
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      "--ffx-shadow-lg":
        shadows!.lg ||
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      "--ffx-shadow-xl":
        shadows!.xl ||
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",

      // Animations
      "--ffx-duration-fast": animations!.duration!.fast,
      "--ffx-duration-normal": animations!.duration!.normal,
      "--ffx-duration-slow": animations!.duration!.slow,
      "--ffx-easing-linear": animations!.easing!.linear,
      "--ffx-easing-ease": animations!.easing!.ease,
      "--ffx-easing-ease-in": animations!.easing!.easeIn,
      "--ffx-easing-ease-out": animations!.easing!.easeOut,
      "--ffx-easing-ease-in-out": animations!.easing!.easeInOut,

      // Spacing scale
      "--ffx-spacing-scale": spacing!.scale!.toString(),
      "--ffx-spacing-unit": spacing!.unit!,
    };
  }, [currentTheme]);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(key, value);
      }
    });

    // Apply theme class to body
    document.body.className =
      document.body.className
        .replace(/ffx-theme-\w+/g, "")
        .replace(/ffx-mode-\w+/g, "") +
      ` ffx-theme-${currentTheme.variant} ffx-mode-${currentTheme.colorMode}`;

    return () => {
      // Cleanup on unmount
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVariables, currentTheme.variant, currentTheme.colorMode]);

  const contextValue: ThemeContextValue = {
    theme: currentTheme,
    setTheme,
    toggleColorMode,
    applyTheme,
    getComputedColors,
    cssVariables,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Utility hook for getting computed styles
export function useThemeStyles() {
  const { getComputedColors, theme, cssVariables } = useTheme();

  return {
    colors: getComputedColors(),
    theme,
    cssVariables,

    // Utility functions for common styling needs
    getButtonStyles: (
      variant: "primary" | "secondary" | "outline" | "ghost" = "primary"
    ) => {
      const colors = getComputedColors();
      const baseStyles = {
        borderRadius: `var(--ffx-radius-base)`,
        transition: `all var(--ffx-duration-normal) var(--ffx-easing-ease-in-out)`,
        fontWeight: theme.typography?.fontWeight?.medium || 500,
      };

      switch (variant) {
        case "primary":
          return {
            ...baseStyles,
            backgroundColor: colors.primary,
            color: "white",
            border: `1px solid ${colors.primary}`,
          };
        case "secondary":
          return {
            ...baseStyles,
            backgroundColor: colors.secondary,
            color: "white",
            border: `1px solid ${colors.secondary}`,
          };
        case "outline":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: colors.primary,
            border: `1px solid ${colors.border}`,
          };
        case "ghost":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: colors.text,
            border: "1px solid transparent",
          };
        default:
          return baseStyles;
      }
    },

    getCardStyles: () => ({
      backgroundColor: `var(--ffx-color-surface)`,
      borderRadius: `var(--ffx-radius-lg)`,
      boxShadow: `var(--ffx-shadow-base)`,
      border: `1px solid var(--ffx-color-border)`,
    }),

    getInputStyles: () => ({
      backgroundColor: `var(--ffx-color-background)`,
      borderRadius: `var(--ffx-radius-base)`,
      border: `1px solid var(--ffx-color-border)`,
      color: `var(--ffx-color-text)`,
      fontSize: `var(--ffx-text-base)`,
      transition: `all var(--ffx-duration-fast) var(--ffx-easing-ease-in-out)`,
    }),
  };
}

export default ThemeProvider;
