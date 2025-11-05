
import React, { useState, useEffect } from 'react';
import MenuIcon from './icons/MenuIcon';
import SearchIcon from './icons/SearchIcon';
import UserCircleIcon from './icons/UserCircleIcon';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden text-slate-600 mr-2 p-2 rounded-full hover:bg-slate-200">
          <MenuIcon />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1 hidden md:block">
            {formattedDate} - ساعت {formattedTime}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-grow">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="جستجو..."
                className="w-full p-2.5 pr-10 text-sm text-slate-900 border-none rounded-xl bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                aria-label="جستجو"
            />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
          <UserCircleIcon />
        </div>
      </div>
       <p className="text-sm text-slate-500 mt-1 md:hidden w-full text-center">
            {formattedDate} - ساعت {formattedTime}
        </p>
    </header>
  );
};

export default Header;
