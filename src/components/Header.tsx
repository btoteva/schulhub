import React from 'react';
import { Link } from 'react-router-dom';

const CatLogo: React.FC = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cat body */}
      <ellipse cx="24" cy="28" rx="14" ry="10" fill="#6B7280"/>
      {/* Cat head */}
      <circle cx="24" cy="18" r="10" fill="#6B7280"/>
      {/* Left ear */}
      <path d="M16 12 L14 4 L20 10 Z" fill="#EF4444"/>
      {/* Right ear */}
      <path d="M32 12 L34 4 L28 10 Z" fill="#EF4444"/>
      {/* Left eye */}
      <circle cx="20" cy="17" r="2" fill="white"/>
      <circle cx="20.5" cy="17" r="1" fill="#1F2937"/>
      {/* Right eye */}
      <circle cx="28" cy="17" r="2" fill="white"/>
      <circle cx="28.5" cy="17" r="1" fill="#1F2937"/>
      {/* Mouth/smile */}
      <path d="M 20 21 Q 24 23 28 21" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Nose */}
      <circle cx="24" cy="20" r="1" fill="#1F2937"/>
      {/* Legs */}
      <rect x="18" y="35" width="3" height="6" rx="1.5" fill="#6B7280"/>
      <rect x="27" y="35" width="3" height="6" rx="1.5" fill="#6B7280"/>
    </svg>
  );
};

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-xl">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CatLogo />
            <h1 className="text-3xl font-bold text-white">SchulHub</h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              Начало
            </Link>
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              Уроци
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              За нас
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              Контакти
            </a>
          </nav>

          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
