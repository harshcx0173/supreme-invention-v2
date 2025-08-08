// Utility function to proxy Google profile images
export const getProxiedImageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  
  // If it's already a Google profile image URL, proxy it
  if (originalUrl.startsWith('https://lh3.googleusercontent.com/')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/proxy/google-image/${encodedUrl}`;
  }
  
  // Return the original URL for other images
  return originalUrl;
};
