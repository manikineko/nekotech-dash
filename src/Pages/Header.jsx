import React, { useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js'; // Import anime.js

// Loading screen component
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50">
    <div className="text-center">
      <div className="loader"></div>
       <div className="header-animation text-center mt-4"></div>
      <h1>⌛ Updating And Configuring!</h1>
       
      
    </div>
  </div>
);

const Header = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the time as needed //<p className="text-lg text-gray-200">Manage Your Virtual Environments</p>

    // Animation configuration
    anime({
      targets: '.header-animation',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutQuad',
      delay: (el, i) => 100 * i, // Delay each element slightly for staggered effect
      loop: true, // Enable looping for continuous animation
      direction: 'alternate', // Alternate animation direction
    });
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <header className="bg-gray-900 text-white p-4 shadow-md relative rounded-tl-lg rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 opacity-75 z-0"></div>
        <div className="relative z-10">
          
            <h1 className="text-4xl font-bold text-center">In-Cloud.us ☁️</h1>
          
          <div className="headers-animation text-center mt-4">

            <h1 className="text-lg text-gray-200">Manage Your Virtual Environments</h1> 
            <p className="text-lg text-gray-200 opacity-35">Version 1.0 Beta ©️2024 In-Cloud.us</p> 
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
