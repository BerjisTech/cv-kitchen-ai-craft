
// Note: In a production environment, you should use environment variables,
// not hardcode API keys in your source code

// Get the API key from environment variables
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Add a helper function to check if the API key is configured
export const isApiKeyConfigured = (): boolean => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0 && OPENAI_API_KEY.startsWith('sk-');
};
