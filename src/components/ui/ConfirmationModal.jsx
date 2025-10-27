import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "destructive",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-900/40 via-gray-900/60 to-red-900/40 border-red-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-halloween text-red-300">
                      {title}
                    </h2>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {message}
                </p>

                {/* Warning Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-300 font-semibold mb-1">
                        This action cannot be undone
                      </h4>
                      <p className="text-gray-300 text-sm">
                        All costumes, votes, and user data will be permanently
                        deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    disabled={isLoading}
                    className="text-gray-300 border-gray-500/50 hover:bg-gray-500/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    variant={confirmVariant}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        {confirmText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
