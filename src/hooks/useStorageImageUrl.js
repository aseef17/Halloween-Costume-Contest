import { useState, useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

/**
 * Hook to convert a Firebase Storage path to a download URL
 * Handles both Storage paths and existing download URLs for backward compatibility
 *
 * @param {string} imagePathOrUrl - Storage path (e.g., "costume-images/file.jpg") or existing download URL
 * @returns {string|null} - Download URL or null if loading/error
 */
export const useStorageImageUrl = (imagePathOrUrl) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imagePathOrUrl) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    // Check if it's already a full URL (backward compatibility)
    if (
      imagePathOrUrl.startsWith("http://") ||
      imagePathOrUrl.startsWith("https://")
    ) {
      setImageUrl(imagePathOrUrl);
      setIsLoading(false);
      return;
    }

    // It's a Storage path, convert to download URL
    setIsLoading(true);
    setError(null);

    const imageRef = ref(storage, imagePathOrUrl);

    getDownloadURL(imageRef)
      .then((url) => {
        setImageUrl(url);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Error getting download URL:", err);
        setError(err);
        setImageUrl(null);
        setIsLoading(false);
      });
  }, [imagePathOrUrl]);

  return { imageUrl, isLoading, error };
};
