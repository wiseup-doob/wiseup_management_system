export const UI_CONSTANTS = {
  ANIMATION: {
    DURATION: 200,
    EASING: 'ease-in-out'
  },
  DEBOUNCE: {
    SEARCH: 300,
    RESIZE: 150,
    SCROLL: 100
  },
  NOTIFICATION: {
    TIMEOUT: 5000,
    POSITION: 'top-right'
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },
  Z_INDEX: {
    MODAL: 1000,
    TOOLTIP: 1100,
    NOTIFICATION: 1200,
    DROPDOWN: 1300
  }
} as const

export const THEME_CONSTANTS = {
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#dc004e',
    SUCCESS: '#4caf50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196f3'
  },
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px'
  },
  BORDER_RADIUS: {
    SM: '4px',
    MD: '8px',
    LG: '12px',
    XL: '16px'
  }
} as const

export const LAYOUT_CONSTANTS = {
  SIDEBAR: {
    WIDTH: 250,
    COLLAPSED_WIDTH: 64
  },
  HEADER: {
    HEIGHT: 64
  },
  CONTENT: {
    PADDING: 20
  }
} as const 