export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const isExtraSmallScreen = () => window.matchMedia('(max-width: 639px)').matches; // Extra small

export const isSmallScreen = () => window.matchMedia('(min-width: 640px) and (max-width: 767px)').matches; // Small

export const isMediumScreen = () => window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches; // Medium

export const isLargeScreen = () => window.matchMedia('(min-width: 1024px) and (max-width: 1279px)').matches; // Large

export const isExtraLargeScreen = () => window.matchMedia('(min-width: 1280px) and (max-width: 1535px)').matches; // Extra large

export const is2XLargeScreen = () => window.matchMedia('(min-width: 1536px)').matches; // 2X extra large