/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Light and soft pastel theme colors
const tintColorLight = '#A8D8EA'; // Soft Sky Blue
const tintColorDark = '#B5E5CF'; // Soft Mint

export const Colors = {
  light: {
    text: '#2D3748',
    background: '#F7FAFC',
    tint: tintColorLight,
    icon: '#718096',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: tintColorLight,
    // Soft pastel theme colors
    primary: '#A8D8EA', // Soft Sky Blue
    secondary: '#B5E5CF', // Soft Mint
    success: '#C8E6C9', // Soft Green
    warning: '#FFF9C4', // Soft Yellow
    error: '#FFCCBC', // Soft Peach
    accent: '#E1BEE7', // Soft Lavender
    card: '#FFFFFF',
    border: '#E2E8F0',
    // Additional soft pastel colors for badges
    badge1: '#A8D8EA', // Soft Sky Blue
    badge2: '#B5E5CF', // Soft Mint
    badge3: '#C8E6C9', // Soft Green
    badge4: '#FFF9C4', // Soft Yellow
    badge5: '#E1BEE7', // Soft Lavender
    badge6: '#FFCCBC', // Soft Peach
    badge7: '#BBDEFB', // Soft Blue
    badge8: '#F8BBD0', // Soft Pink
  },
  dark: {
    text: '#E2E8F0',
    background: '#1A202C',
    tint: tintColorDark,
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorDark,
    // Soft pastel theme colors (slightly brighter for dark mode)
    primary: '#B5E5CF', // Soft Mint
    secondary: '#A8D8EA', // Soft Sky Blue
    success: '#C8E6C9', // Soft Green
    warning: '#FFF9C4', // Soft Yellow
    error: '#FFCCBC', // Soft Peach
    accent: '#E1BEE7', // Soft Lavender
    card: '#2D3748',
    border: '#4A5568',
    // Additional soft pastel colors for badges
    badge1: '#B5E5CF', // Soft Mint
    badge2: '#A8D8EA', // Soft Sky Blue
    badge3: '#C8E6C9', // Soft Green
    badge4: '#FFF9C4', // Soft Yellow
    badge5: '#E1BEE7', // Soft Lavender
    badge6: '#FFCCBC', // Soft Peach
    badge7: '#BBDEFB', // Soft Blue
    badge8: '#F8BBD0', // Soft Pink
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
