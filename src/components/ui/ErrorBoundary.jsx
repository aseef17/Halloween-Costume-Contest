import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center bg-black p-6"
        >
          <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-red-500/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-display text-white mb-4">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-300 mb-6">
              The Halloween spirits seem to have caused a glitch. Don't worry,
              this happens to the best of us!
            </p>

            {import.meta.env?.MODE === "development" && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-800 rounded-lg">
                <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
