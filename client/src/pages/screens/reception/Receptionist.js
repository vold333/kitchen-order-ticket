
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { MdLogout, MdMenu, MdClose, MdTableBar } from "react-icons/md";
import { FaUserPlus, FaClipboardList, FaSignOutAlt, FaHistory, FaRegCalendarAlt, FaComment } from "react-icons/fa";
import useLogout from "../../../services/logout";

const Receptionist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useLogout();
  const location = useLocation(); 

  // Function to close the sidebar
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-200 flex-col font-sans">
      {/* Header */}
      <header className="w-full bg-blue-50 py-2 sm:p-2 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Menu button visible on mobile and tablet */}
          <button
            className="text-blue-950 text-2xl focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MdMenu />
          </button>
          <h1 className="text-2xl sm:text-2xl font-bold text-blue-950">Reception</h1>
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

      <div className="flex flex-1 mt-2">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 bg-blue-50 w-64 p-4 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform lg:relative lg:translate-x-0 lg:w-64 flex flex-col shadow-lg z-10 lg:z-auto xl:z-auto`}
        >
          {/* Close button for mobile and tablet */}
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-blue-950 text-lg font-semibold">KOT</h2>
            <button className="text-blue-950 text-2xl" onClick={closeSidebar}>
              <MdClose />
            </button>
          </div>
          <nav className="flex-1 space-y-4 text-blue-950">
            <Link
              to="/receptionist/recep-history"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-history" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaHistory className="mr-2" /> Daily Orders
            </Link>   
            <Link
              to="/receptionist/recep-add-employee"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-add-employee" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaUserPlus className="mr-2" /> Add Employee
            </Link>
            <Link
              to="/receptionist/recep-add-table"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-add-table" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <MdTableBar className="mr-2" /> Add Table
            </Link>
            <Link
              to="/receptionist/recep-add-category-menu"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-add-category-menu" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaClipboardList className="mr-2" /> Add Category & Menu
            </Link>
            <Link
              to="/receptionist/recep-cook-comments"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-cook-comments" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaComment className="mr-2" /> Cooking Instructions
            </Link>
            <Link
              to="/receptionist/recep-calendar"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-calendar" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaRegCalendarAlt className="mr-2" /> Calendar
            </Link>            
            {/* <Link
              to="/receptionist/recep-report"
              className={`flex items-center py-2 px-4 font-semibold rounded-full ${
                location.pathname === "/receptionist/recep-report" ? "bg-blue-200 text-secondary" : "hover:bg-blue-200"
              }`}
              onClick={closeSidebar}
            >
              <FaChartBar className="mr-2" /> Report
            </Link> */}
          </nav>
          <div className="p-4">
            <button
              className="w-full flex items-center text-left py-2 px-4 font-semibold rounded-full hover:bg-red-200 text-red-600"
              onClick={logout}
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto ml-2 lg:ml-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Receptionist;
