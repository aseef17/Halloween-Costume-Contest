import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Button from "./Button";
import { storage } from "../../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { costumeToasts } from "../../utils/toastUtils";
import { motion } from "motion/react";

const ImageUpload = ({
  onImageUpload,
  onImageRemove,
  onUploadStart,
  currentImageUrl = null,
  disabled = false,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      costumeToasts.uploadError();
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      costumeToasts.uploadError();
      return;
    }

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `costume-${timestamp}-${file.name}`;
      const imageRef = ref(storage, `costume-images/${fileName}`);

      // Upload the file
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onImageUpload(downloadURL);
      costumeToasts.uploadSuccess();
    } catch (error) {
      console.error("Error uploading image:", error);
      costumeToasts.uploadError();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract the file path from the URL
      const imageRef = ref(storage, currentImageUrl);
      await deleteObject(imageRef);
      onImageRemove();
    } catch (error) {
      console.error("Error removing image:", error);
      // Still remove from UI even if deletion fails
      onImageRemove();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {currentImageUrl ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl border-2 border-orange-500/30 bg-black/40">
            <img
              src={currentImageUrl}
              alt="Costume preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove Image
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-orange-400 bg-orange-500/10"
              : "border-orange-500/30 bg-black/20 hover:border-orange-500/50 hover:bg-black/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && !isUploading && fileInputRef.current?.click()
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-orange-400" />
              </motion.div>
              <p className="text-orange-300 font-medium">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-8 h-8 text-orange-400" />
              </motion.div>
              <div>
                <p className="text-orange-300 font-medium mb-2">
                  Upload Costume Image
                </p>
                <p className="text-gray-400 text-sm">
                  Drag & drop an image or click to browse
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Max size: 5MB • JPG, PNG, GIF supported
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
