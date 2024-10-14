import React, { useState } from 'react';

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed top-45 right-2 bg-red-400 w-1/6 rounded shadow-md p-1 cursor-pointer"
      onClick={handleClick}
    >
      <p className="text-white text-sm">
        ! A major code rewrite was just released. If you have any issues, please let me know. !
      </p>
    </div>
  );
}
