import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaBook } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700/50 shadow-2xl backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img
              src="https://i.imgur.com/QSWSGYz.png"
              alt="ShulHub Logo"
              className="h-10 w-10 drop-shadow-lg group-hover:scale-110 transition-transform"
            />
            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              ShulHub
            </h1>
            <FaBook className="text-3xl text-blue-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              Начало
            </Link>
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              Уроци
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              За нас
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              Контакти
            </a>
          </nav>

          <button className="md:hidden text-white hover:text-yellow-400 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
