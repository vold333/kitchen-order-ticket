// src/pages/KitchenStaff.js

import React, { useState } from 'react';
import { MdLogout, MdMenu } from "react-icons/md";
import useLogout from '../../services/logout';

const KitchenStaff = () => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const logout = useLogout();

  return (
    <div className="flex h-screen bg-gray-200 flex-col font-sans">
          {/* Header */}
          <header className="w-full bg-blue-50 py-4 px-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Menu button visible on mobile and tablet */}
              <button
                className="text-blue-950 text-2xl focus:outline-none lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <MdMenu />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">KOT Kitchen</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="flex items-center justify-center w-12 h-12 bg-white text-blue-950 rounded-full hover:text-red-600 transition duration-300"
              >
                <MdLogout className="text-2xl" />
              </button>
            </div>
          </header>

          <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
              <h1 className="text-3xl font-semibold text-center text-blue-500 mb-6">Kitchen Dashboard</h1>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h2 className="text-xl font-medium text-gray-700">Order list</h2>
                  <p className="text-gray-600">Check-in incoming food orders</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h2 className="text-xl font-medium text-gray-700">Delivered list</h2>
                  <p className="text-gray-600">Manage the deliver foods</p>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
}

export default KitchenStaff;
