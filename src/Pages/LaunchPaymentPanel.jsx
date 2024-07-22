import React from 'react';
import { HiOutlineTerminal, HiOutlineExternalLink } from 'react-icons/hi';

const LaunchPaymentPanel = () => {
  const launchConvoy = () => {
    const convoyUrl = 'https://cpanel.in-cloud.us';
    window.open(convoyUrl, '_blank');
  };
  const openPaymentDashboard = () => {
    const paymentDashboardUrl = 'https://payments.in-cloud.us';
    window.open(paymentDashboardUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg shadow-lg p-6 mt-4 mb-8 cursor-pointer hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Launch Payment</h2>
        <HiOutlineTerminal className="text-3xl" /> {/* Terminal icon */}
      </div>
      <p className="text-lg mb-4">For Payed Plan Management Visist our payment section</p>
      <div className="flex space-x-4">
        
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center"
          onClick={openPaymentDashboard}
          style={{ fontSize: '1.2rem' }} // Increase font size
        >
          Open Payment Dashboard
          <HiOutlineExternalLink className="ml-2" /> {/* External link icon */}
        </button>
      </div>
    </div>
  );
};

export default LaunchPaymentPanel;
