
import React from 'react';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import XIcon from './icons/XIcon';

interface ActionBarProps {
  selectedCount: number;
  onDeleteClick: () => void;
  onClear: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ selectedCount, onDeleteClick, onClear }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-30 transition-all duration-300 animate-fade-in-up">
        <div className="flex items-center gap-4 bg-slate-800 text-white rounded-2xl shadow-2xl p-3 px-5 backdrop-blur-sm bg-opacity-80">
            <span className="font-bold text-sm bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">{selectedCount}</span>
            <span className="font-semibold text-slate-300">مورد انتخاب شده</span>
            <div className="w-px h-6 bg-slate-600"></div>
            <button onClick={onDeleteClick} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="حذف موارد انتخاب شده">
                <TrashIcon />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-500 cursor-not-allowed" title="کپی کردن (غیرفعال)">
                <DocumentDuplicateIcon />
            </button>
            <div className="w-px h-6 bg-slate-600"></div>
            <button onClick={onClear} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="پاک کردن انتخاب">
                <XIcon />
            </button>
        </div>
         <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translate(50%, 20px); }
                100% { opacity: 1; transform: translate(50%, 0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default ActionBar;
