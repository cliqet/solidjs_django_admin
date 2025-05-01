export const useScreenWidth = () => {
  const isExtraSmallScreen = () => window.matchMedia('(max-width: 639px)').matches; // Extra small

  const isSmallScreen = () => window.matchMedia('(min-width: 640px) and (max-width: 767px)').matches; // Small

  const isMediumScreen = () => window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches; // Medium

  const isLargeScreen = () => window.matchMedia('(min-width: 1024px) and (max-width: 1279px)').matches; // Large

  const isExtraLargeScreen = () => window.matchMedia('(min-width: 1280px) and (max-width: 1535px)').matches; // Extra large

  const is2XLargeScreen = () => window.matchMedia('(min-width: 1536px)').matches; // 2X extra large

  return {
    isExtraSmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    is2XLargeScreen
  }
}

