import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Download } from "lucide-react";
import Button from "./Button";

const ImageViewerModal = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt = "Costume Image",
  ownerName = "",
  costumeName = "",
}) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="image-viewer-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 rounded-3xl z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Header with owner name and costume name */}
          {(ownerName || costumeName) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-md text-white text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {ownerName && costumeName ? (
                <span>
                  {ownerName} - {costumeName}
                </span>
              ) : (
                <span>{ownerName || costumeName}</span>
              )}
            </motion.div>
          )}

          {/* Image container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="max-w-full max-h-full object-contain shadow-2xl"
              style={{
                maxWidth: "95vw",
                maxHeight: "95vh",
              }}
            />
          </motion.div>

          {/* Zoom indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full text-white text-sm"
          >
            <ZoomIn className="h-4 w-4" />
            <span>Click outside to close</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageViewerModal;
