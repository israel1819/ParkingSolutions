import React from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Settings } from 'lucide-react';

const Navbar = ({ userRole }) => {
    return (
        <nav className="w-full max-w-4xl bg-surface-color rounded-xl shadow-lg p-4 mb-6 flex justify-center space-x-8 animate-fade-in ">
            <Link to="/valet" className="flex items-center text-primary-color hover:text-primary-dark font-semibold transition-all duration-300 transform hover:scale-105">
                <CarFront className="mr-2" /> Valet Operations
            </Link>
            {userRole === 'admin' && (
                <Link to="/admin" className="flex items-center text-secondary-color hover:text-purple-800 font-semibold transition-all duration-300 transform hover:scale-105">
                    <Settings className="mr-2" /> Admin Dashboard
                </Link>
            )}
        </nav>
    );
};

export default Navbar;
