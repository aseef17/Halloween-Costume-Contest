import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 121, 0, 0.3)",
          color: "#fff",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
        },
        className: "font-sans",
        duration: 4000,
      }}
      richColors
      closeButton
    />
  );
}
