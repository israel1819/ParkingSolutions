import React, { useState, useContext } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FirebaseContext } from './FirebaseProvider';

const Register = ({ setMessage }) => {
    const { auth, db, isAuthReady } = useContext(FirebaseContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [role, setRole] = useState('valet'); // Default role
    const navigate = useNavigate();

    // IMPORTANT: App ID
    const appId = '1:1038485808891:web:94222225baddee049e725e';

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!auth || !db || !isAuthReady) {
            setMessage('Firebase is not ready. Please wait a moment.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/userData`, user.uid);
            await setDoc(userDocRef, {
                email: user.email,
                role: role,
                employeeName: employeeName,
                registeredAt: new Date().toISOString(),
            });

            setMessage(`Registration successful! Welcome, ${employeeName}. You are now a ${role}.`);
            navigate('/login');
        } catch (error) {
            console.error("Error registering:", error);
            setMessage(`Registration failed: ${error.message}`);
        }
    };

    return (
        <div className="card max-w-md mx-auto p-8 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary-color text-center mb-4">Create Your Account</h2>
            <form onSubmit={handleRegister} className="space-y-5">
                <div>
                    <label htmlFor="employeeName" className="block text-sm font-medium text-text-color-secondary mb-1">Employee Name</label>
                    <input
                        type="text"
                        id="employeeName"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        className="input-field"
                        placeholder="John Doe"
                        required
                    />
                </div>
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
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-text-color-secondary mb-1">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field appearance-none"
                    >
                        <option value="valet">Valet</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="btn-success w-full py-3"
                >
                    Register Account
                </button>
            </form>
            <p className="text-center text-sm text-text-color-secondary">
                Already have an account? <span className="text-primary-color cursor-pointer hover:underline font-medium transition-colors duration-200" onClick={() => navigate('/login')}>Login here.</span>
            </p>
        </div>
    );
};

export default Register;
