
import React from 'react';
import XIcon from './icons/XIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all animate-scale-in" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex items-center justify-center p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl gap-4">
          <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg w-full">انصراف</button>
          <button type="button" onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full">تایید و حذف</button>
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
