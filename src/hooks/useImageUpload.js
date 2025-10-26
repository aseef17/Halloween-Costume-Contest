import { useState, useCallback } from "react";

/**
 * Custom hook for managing image uploads
 */
export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImage = useCallback(async (file, onProgress) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Validate file
      if (!file) {
        throw new Error("No file selected");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error("File size must be less than 5MB");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress (replace with actual upload logic)
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        // Simulate upload (replace with actual endpoint)
        setTimeout(() => {
          resolve({
            url: URL.createObjectURL(file),
            filename: file.name,
            size: file.size,
          });
        }, 2000);
      });

      const result = await uploadPromise;
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    clearError,
  };
};

/**
 * Custom hook for managing image preview
 */
export const useImagePreview = () => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const createPreview = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setFile(file);
    } else {
      setPreview(null);
      setFile(null);
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setFile(null);
  }, []);

  return {
    preview,
    file,
    createPreview,
    clearPreview,
  };
};

/**
 * Custom hook for managing drag and drop
 */
export const useDragAndDrop = (onDrop) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev - 1);
      if (dragCounter === 1) {
        setIsDragOver(false);
      }
    },
    [dragCounter]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop(files[0]); // Only handle the first file
      }
    },
    [onDrop]
  );

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};

export default {
  useImageUpload,
  useImagePreview,
  useDragAndDrop,
};
