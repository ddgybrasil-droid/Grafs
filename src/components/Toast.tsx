import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  tone: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => (
  <div className={`toast toast--${toast.tone}`} role="status">
    {toast.tone === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
    <div>
      <strong>{toast.title}</strong>
      <p>{toast.message}</p>
    </div>
    <button type="button" aria-label="Dismiss notification" onClick={onClose}>
      <X size={14} />
    </button>
  </div>
);
