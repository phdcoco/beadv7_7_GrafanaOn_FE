const configuredUseMocks = import.meta.env.VITE_USE_MOCKS

export const USE_MOCKS = configuredUseMocks
  ? configuredUseMocks !== "false"
  : import.meta.env.DEV
