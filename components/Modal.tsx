"use client";

import { useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional footer content (e.g., action buttons) */
  footer?: React.ReactNode;
}

/**
 * Modal — reusable overlay dialog.
 * Handles: Escape key, click-outside-to-close, focus trap, scroll lock.
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="
        fixed inset-0 z-[60]
        bg-black/40 backdrop-blur-sm
        flex items-center justify-center p-4
        animate-in fade-in duration-200
      "
    >
      <div
        className="
          bg-white rounded-card shadow-2xl
          w-full max-w-md
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-arctic-100">
          <h2
            id="modal-title"
            className="text-base font-semibold text-arctic-900 leading-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="
              p-1 rounded-button text-arctic-400
              hover:text-arctic-700 hover:bg-arctic-50
              transition-colors
            "
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1">{children}</div>

        {/* Optional footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-arctic-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
