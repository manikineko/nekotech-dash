import React, { useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js'; // Import anime.js

const Header = () => {
  useEffect(() => {
    // Animation configuration
    anime({
      targets: '.header-animation',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutQuad',
      delay: 500,
    });
  }, []);

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md relative rounded-tl-lg rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 opacity-75 z-0"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-center">NekoTech Dashboard</h1>
        <div className="header-animation text-center mt-4">
          <p className="text-lg text-gray-200">Manage Your Virtual Environments</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
