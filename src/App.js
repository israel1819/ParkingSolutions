import React, { useState, useEffect, useContext } from 'react';
import ValetDashboard from './ValetDashboard';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import Register from './Register';
import Navbar from './components/Navbar';
import { FirebaseContext } from './FirebaseProvider';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const App = () => {
    const { userId, isAuthReady, auth, userProfile } = useContext(FirebaseContext);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // IMPORTANT: App ID
    // const appId = '1:1038485808891:web:94222225baddee049e725e'; // Removed unused declaration

    useEffect(() => {
        // This effect runs when isAuthReady or userProfile changes.
        // It waits until FirebaseProvider has definitively determined userProfile (either object or null).
        if (isAuthReady && userProfile !== undefined) {
            if (!userId) {
                // User is not authenticated
                if (location.pathname !== '/register') {
                    navigate('/login');
                }
            } else if (userProfile) {
                // User is authenticated AND profile is loaded (userProfile is an object)
                if (userProfile.role === 'admin') {
                    navigate('/admin');
                } else if (userProfile.role === 'valet') {
                    navigate('/valet');
                } else {
                    // Authenticated user with an unknown role, redirect to login with message
                    setMessage('Your account has an unrecognized role. Please contact support.');
                    navigate('/login');
                }
            } else {
                // userId exists, but userProfile is null (meaning no profile found in Firestore)
                // This handles newly registered users or users without a profile document.
                // Only redirect if not on the register page, as registration creates the profile.
                if (location.pathname !== '/register') {
                    setMessage('Your user profile could not be loaded. Please register or try logging in again.');
                    navigate('/login');
                }
            }
        }
    }, [isAuthReady, userId, userProfile, navigate, location.pathname]);

    const handleLogout = async () => {
        if (auth) {
            try {
                await auth.signOut();
                setMessage('Logged out successfully.');
                navigate('/login');
            } catch (error) {
                console.error("Error logging out:", error);
                setMessage('Failed to log out. Please try again.');
            }
        }
    };

    // Show a loading screen until authentication and profile data are definitively resolved.
    // This condition now explicitly checks if userProfile is still 'undefined',
    // indicating that the FirebaseProvider is still fetching/determining the profile.
    if (!isAuthReady || (userId && userProfile === undefined)) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-25"></div>
                    <p className="mt-4 text-lg text-gray-700">Loading application data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter text-gray-800">
            <h1 className="text-4xl font-bold text-primary-color mb-4 animate-fade-in">Valet Parking System</h1>
            {userId && userProfile && ( // Only show user info if userId and userProfile are available
                <div className="text-sm text-gray-600 mb-4 flex items-center space-x-2">
                    <span>Logged in as: <span className="font-semibold">{userProfile.employeeName || 'N/A'}</span> (ID: <span className="font-semibold">{userId}</span>)</span>
                    <button onClick={handleLogout} className="btn-danger px-3 py-1 text-sm">Logout</button>
                </div>
            )}

            {message && (
                <div className="message-box mb-4 animate-slide-down">
                    {message}
                </div>
            )}

            {userId && userProfile?.role && ( // Only show Navbar if role is determined
                <Navbar userRole={userProfile.role} />
            )}

            <div className="w-full max-w-4xl mt-4">
                <Routes>
                    <Route path="/login" element={<Login setMessage={setMessage} />} />
                    <Route path="/register" element={<Register setMessage={setMessage} />} />
                    {userId && userProfile?.role === 'valet' && (
                        <Route path="/valet" element={<ValetDashboard />} />
                    )}
                    {userId && userProfile?.role === 'admin' && (
                        <Route path="/admin" element={<AdminDashboard />} />
                    )}
                    {/* Fallback route if user is authenticated but somehow lands on an unhandled path or role, or not logged in */}
                    <Route path="*" element={
                        <div className="text-center p-8 card">
                            <p className="text-xl text-gray-700">Please log in to access the application.</p>
                        </div>
                    } />
                </Routes>
            </div>
        </div>
    );
};

export default App;
