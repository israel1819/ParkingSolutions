import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FirebaseContext } from './FirebaseProvider';

const Login = ({ setMessage }) => {
    const { auth, isAuthReady } = useContext(FirebaseContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!auth || !isAuthReady) {
            setMessage('Firebase is not ready. Please wait a moment.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setMessage('Logged in successfully!');
        } catch (error) {
            console.error("Error logging in:", error);
            setMessage(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="card max-w-md mx-auto p-8 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-color text-center mb-4">Welcome Back!</h2>
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-color-secondary mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="your.email@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-color-secondary mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary w-full py-3"
                >
                    Login to Account
                </button>
            </form>
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-border-color"></div>
                <span className="flex-shrink mx-4 text-text-color-secondary">OR</span>
                <div className="flex-grow border-t border-border-color"></div>
            </div>
            <p className="text-center text-sm text-text-color-secondary">
                Don't have an account? <span className="text-primary-color cursor-pointer hover:underline font-medium transition-colors duration-200" onClick={() => navigate('/register')}>Register here.</span>
            </p>
        </div>
    );
};

export default Login;
