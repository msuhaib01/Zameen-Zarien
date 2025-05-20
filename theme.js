export const COLORS = {
  // Primary colors - Enhanced agricultural greens
  primary: "#2E7D32", // Dark green for headers and primary buttons
  primaryLight: "#4CAF50", // Medium green
  primaryLighter: "#81C784", // Light green
  primaryDark: "#1B5E20", // Very dark green
  primaryGradient: ["#2E7D32", "#388E3C", "#43A047"], // Green gradient

  // Secondary colors - Earthy tones
  secondary: "#FFC107", // Amber for accents
  secondaryLight: "#FFD54F", // Light amber
  secondaryDark: "#FFA000", // Dark amber
  earth: "#8D6E63", // Brown earth tone
  earthLight: "#A1887F", // Light earth tone
  earthDark: "#6D4C41", // Dark earth tone

  // Accent colors
  accent: "#8B0000", // Dark red for alerts and important actions
  success: "#2E8B57", // Sea green for success messages
  warning: "#FF9800", // Orange for warnings
  error: "#D32F2F", // Red for errors
  info: "#0288D1", // Blue for information

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#757575",
  lightGray: "#E0E0E0",

  // Text colors
  text: {
    primary: "#212121", // Almost black
    secondary: "#424242", // Dark gray
    light: "#FFFFFF", // White
    muted: "#757575", // Medium gray
    green: "#2E7D32", // Green text for emphasis
  },

  // Background colors
  background: {
    primary: "#F9FBF9", // Very light green tint
    secondary: "#FFFFFF", // White
    tertiary: "#F5F5F5", // Light gray
    green: "rgba(76, 175, 80, 0.05)", // Very light green
    greenGradient: "linear-gradient(to right, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.1))", // Green gradient
    earthTone: "rgba(141, 110, 99, 0.05)", // Light earth tone
  },

  // Border colors
  border: "#E0E0E0",
  borderGreen: "rgba(76, 175, 80, 0.3)", // Green border

  // Chart colors - Agricultural theme
  chart: {
    green: "#4CAF50", // Primary green
    darkGreen: "#2E7D32", // Dark green
    lightGreen: "#81C784", // Light green
    brown: "#8D6E63", // Earth brown
    amber: "#FFC107", // Wheat/crop color
    red: "#F44336", // For negative values
    blue: "#2196F3", // Water/irrigation
  }
}

export const FONT = {
  regular: "System",
  medium: "System",
  bold: "System",
  sizes: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 18,
    xxl: 22,
    xxxl: 24,
    title: 28,
  },
}

export const SPACING = {
  xs: 4,
  small: 8,
  medium: 12,
  large: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const SHADOWS = {
  // Subtle shadow for cards and containers
  subtle: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2.0,
    elevation: 1,
  },
  // Small shadow for buttons and smaller elements
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 2,
  },
  // Medium shadow for cards and containers that need to stand out
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  // Large shadow for modals and prominent elements
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    elevation: 6,
  },
  // Extra large shadow for elements that need to appear floating
  xl: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 8,
  },
  // Green-tinted shadow for primary elements
  primary: {
    shadowColor: "#2E7D32",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
}

export const SIZES = {
  width: {
    full: "100%",
    half: "50%",
    quarter: "25%",
    threeQuarters: "75%",
  },
  height: {
    full: "100%",
    half: "50%",
    quarter: "25%",
    threeQuarters: "75%",
  },
}

