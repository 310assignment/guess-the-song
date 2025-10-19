// React import for component functionality and hooks
import React, { useState } from "react";

// Props interface defining the text that should be copied to clipboard
interface CopyButtonProps {
  textToCopy: string; // The text content to copy when button is clicked
}

/**
 * CopyButton component provides a reusable button for copying text to clipboard
 * Handles both modern clipboard API and fallback methods for browser compatibility
 *
 * @param textToCopy - The text string to copy to the user's clipboard
 */
const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  // State to track whether text has been successfully copied (for UI feedback)
  const [copied, setCopied] = useState(false);

  /**
   * Handles the copy operation with fallback support
   * Tries modern clipboard API first, falls back to older execCommand method
   */
  const handleCopy = async () => {
    try {
      // Try modern clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        // Show success feedback for 2 seconds
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback method for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // Position off-screen to avoid visual flash
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          // Use deprecated but widely supported execCommand
          document.execCommand("copy");
          // Show success feedback for 2 seconds
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          console.error("Fallback copy failed: ", fallbackErr);
        } finally {
          // Always clean up the temporary textarea element
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      // Log any errors that occur during the copy process
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    // Copy button with dynamic title and alt text based on copy state
    <button
      onClick={handleCopy}
      className="copy-button"
      title={copied ? "Copied!" : "Copy room code"}
    >
      {/* Copy icon image with dynamic alt text for accessibility */}
      <img
        src="/src/assets/copy-symbol.svg"
        alt={copied ? "Copied!" : "Copy"}
      />
    </button>
  );
};

export default CopyButton;
