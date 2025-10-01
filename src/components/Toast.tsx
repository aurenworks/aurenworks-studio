import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  type,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = window.setTimeout(() => {
        setIsVisible(false);
        window.setTimeout(() => onClose(''), 300); // Wait for animation
      }, duration);
      return () => window.clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    window.setTimeout(() => onClose(''), 300);
  };

  const Icon = type === 'success' ? CheckCircle : XCircle;
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor =
    type === 'success' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${bgColor} ${borderColor}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor} hover:opacity-75`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container component
export interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
