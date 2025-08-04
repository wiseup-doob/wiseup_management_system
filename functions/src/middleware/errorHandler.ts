export const createErrorResponse = (response: any, error: unknown, message: string): void => {
  console.error(`Error: ${message}`, error);
  response.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}; 