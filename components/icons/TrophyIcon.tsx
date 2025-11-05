
import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.023 9.023 0 00-2.845 1.072m14.69 0A9.023 9.023 0 017.5 18.75m9 0V9A2.25 2.25 0 0014.25 6.75h-4.5A2.25 2.25 0 007.5 9v9.75M12 15V9" />
    </svg>
);

export default TrophyIcon;
