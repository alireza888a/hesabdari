import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Note } from '../types';

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: 'بررسی فاکتورهای ماه گذشته', completed: false },
    { id: 2, text: 'تماس با مشتری جدید - شرکت آلفا', completed: true },
    { id: 3, text: 'آماده‌سازی گزارش مالی سه ماهه', completed: false },
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() === '') return;
    setNotes([
      ...notes,
      { id: Date.now(), text: newNote, completed: false },
    ]);
    setNewNote('');
  };

  const toggleNote = (id: number) => {
    setNotes(
      notes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    );
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">یادداشت‌ها</h2>
      <form onSubmit={handleAddNote} className="flex items-center mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="یادداشت جدید..."
          className="w-full bg-gray-50 rounded-lg py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-start)]"
        />
        <button type="submit" className="mr-3 p-2 rounded-full bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white hover:opacity-90 transition-opacity focus:outline-none">
          <PlusIcon className="h-5 w-5" />
        </button>
      </form>
      <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: '420px'}}>
        {notes.length > 0 ? (
          <ul className="space-y-3">
            {notes.map(note => (
              <li
                key={note.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={note.completed}
                    onChange={() => toggleNote(note.id)}
                    className="h-5 w-5 ml-3 rounded border-gray-300 text-[var(--color-primary-start)] focus:ring-[var(--color-primary-start)]"
                  />
                  <span className={`text-gray-700 ${note.completed ? 'line-through text-gray-400' : ''}`}>
                    {note.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="حذف یادداشت"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400 mt-8">یادداشتی برای نمایش وجود ندارد.</p>
        )}
      </div>
    </div>
  );
};

export default Notepad;
