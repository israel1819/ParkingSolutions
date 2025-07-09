import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'; // Removed 'getDocs'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, Car, CalendarDays, User, PlusCircle } from 'lucide-react';
import { FirebaseContext } from './FirebaseProvider';

const AdminDashboard = () => {
    const { db, auth } = useContext(FirebaseContext);
    const appId = '1:1038485808891:web:94222225baddee049e725e';
    const [totalCarsDelivered, setTotalCarsDelivered] = useState(0);
    const [valetEmployees, setValetEmployees] = useState([]);
    const [message, setMessage] = useState('');
    const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

    const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
    const [newEmployeePassword, setNewEmployeePassword] = useState('');
    const [newEmployeeName, setNewEmployeeName] = useState('');

    const fetchAllCarsFromBackend = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/cars/occupied');
            if (response.ok) {
                const cars = await response.json();
                const deliveredCount = cars.filter(car => car.status === 'DELIVERED').length;
                setTotalCarsDelivered(deliveredCount);
            } else {
                console.error("Error fetching all cars from backend:", response.status, await response.text());
            }
        } catch (error) {
            console.error("Network or unexpected error fetching all cars from backend:", error);
        }
    };

    useEffect(() => {
        fetchAllCarsFromBackend();
        const interval = setInterval(fetchAllCarsFromBackend, 10000);
        return () => clearInterval(interval);

    }, []);

    useEffect(() => {
        if (!db) return;

        const valetsCollectionRef = collection(db, `artifacts/${appId}/users`);
        const unsubscribeValets = onSnapshot(valetsCollectionRef, async (snapshot) => {
            const valets = [];
            for (const userDoc of snapshot.docs) {
                const userDataRef = doc(db, `artifacts/${appId}/users/${userDoc.id}/userData`, userDoc.id);
                try {
                    const userDataSnap = await getDoc(userDataRef);
                    if (userDataSnap.exists() && userDataSnap.data().role === 'valet') {
                        valets.push({ id: userDoc.id, ...userDataSnap.data() });
                    }
                } catch (error) {
                    console.error("Error fetching user data for valet:", userDoc.id, error);
                }
            }
            setValetEmployees(valets);
        }, (error) => console.error("Error fetching valets:", error));

        return () => {
            unsubscribeValets();
        };
    }, [db, appId]);

    const getValetCarData = async (valetId) => {
        try {
            const response = await fetch('http://localhost:8080/api/cars/occupied');
            if (response.ok) {
                const allCars = await response.json();
                return allCars.filter(car => car.valetId === valetId);
            } else {
                console.error("Error fetching valet cars from backend:", response.status, await response.text());
                return [];
            }
        } catch (error) {
            console.error("Network or unexpected error fetching valet cars from backend:", error);
            return [];
        }
    };

    const aggregateValetData = (cars) => {
        const dailyData = {};
        const monthlyData = {};
        let totalValetCars = 0;

        cars.forEach(car => {
            if (car.timestampParked) {
                totalValetCars++;
                const date = new Date(car.timestampParked);
                const dayKey = date.toISOString().split('T')[0];
                const monthKey = date.toISOString().substring(0, 7);

                dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            }
        });

        const sortedDailyData = Object.keys(dailyData).sort().map(date => ({
            date: date,
            count: dailyData[date]
        }));
        const sortedMonthlyData = Object.keys(monthlyData).sort().map(month => ({
            month: month,
            count: monthlyData[month]
        }));

        return { totalValetCars, dailyData: sortedDailyData, monthlyData: sortedMonthlyData };
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!auth || !db) {
            setMessage('Firebase services are not ready.');
            return;
        }
        if (!newEmployeeEmail || !newEmployeePassword || !newEmployeeName) {
            setMessage('Please fill all fields for the new employee.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newEmployeeEmail, newEmployeePassword);
            const newUser = userCredential.user;

            const userDocRef = doc(db, `artifacts/${appId}/users/${newUser.uid}/userData`, newUser.uid);
            await setDoc(userDocRef, {
                email: newUser.email,
                role: 'valet',
                employeeName: newEmployeeName,
                registeredAt: new Date().toISOString(),
            });

            setMessage(`Successfully added new valet employee: ${newEmployeeName}`);
            setNewEmployeeEmail('');
            setNewEmployeePassword('');
            setNewEmployeeName('');
            setShowAddEmployeeForm(false);
        } catch (error) {
            console.error("Error adding new employee:", error);
            setMessage(`Failed to add employee: ${error.message}`);
        }
    };

    return (
        <div className="card w-full max-w-4xl p-6 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-secondary-color">Admin Dashboard</h2>

            {message && (
                <div className="message-box mb-4 animate-slide-down">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-4 bg-green-50 border border-green-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-green-700">Total Cars Delivered</h3>
                        <p className="text-4xl font-bold text-green-800">{totalCarsDelivered}</p>
                    </div>
                    <Car size={48} className="text-green-500" />
                </div>
                <div className="card p-4 bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-700">Total Valet Employees</h3>
                        <p className="text-4xl font-bold text-blue-800">{valetEmployees.length}</p>
                    </div>
                    <Users size={48} className="text-blue-500" />
                </div>
                <div className="card p-4 bg-purple-50 border border-purple-200 flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                     onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}>
                    <PlusCircle size={48} className="text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-700">Add New Employee</h3>
                </div>
            </div>

            {showAddEmployeeForm && (
                <div className="card p-6 mt-6 animate-fade-in-down">
                    <h3 className="text-2xl font-semibold text-center text-primary-color mb-4">Add New Valet Employee</h3>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                        <div>
                            <label htmlFor="newEmployeeName" className="block text-sm font-medium text-text-color-secondary mb-1">Employee Name</label>
                            <input
                                type="text"
                                id="newEmployeeName"
                                value={newEmployeeName}
                                onChange={(e) => setNewEmployeeName(e.target.value)}
                                className="input-field"
                                placeholder="Valet Employee Name"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newEmployeeEmail" className="block text-sm font-medium text-text-color-secondary mb-1">Email</label>
                            <input
                                type="email"
                                id="newEmployeeEmail"
                                value={newEmployeeEmail}
                                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                                className="input-field"
                                placeholder="employee@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newEmployeePassword" className="block text-sm font-medium text-text-color-secondary mb-1">Temporary Password</label>
                            <input
                                type="password"
                                id="newEmployeePassword"
                                value={newEmployeePassword}
                                onChange={(e) => setNewEmployeePassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 flex items-center justify-center"
                        >
                            <PlusCircle className="inline-block mr-2" /> Create Employee Account
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddEmployeeForm(false)}
                            className="btn-danger w-full py-3 mt-2"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <h3 className="text-2xl font-semibold text-text-color-primary mt-6 mb-4">Valet Employee Performance</h3>
            {valetEmployees.length === 0 ? (
                <p className="text-center text-text-color-secondary p-4 card">No valet employees registered yet.</p>
            ) : (
                <div className="space-y-6">
                    {valetEmployees.map(valet => (
                        <ValetPerformanceCard key={valet.id} valet={valet} getValetCarData={getValetCarData} aggregateValetData={aggregateValetData} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ValetPerformanceCard = ({ valet, getValetCarData, aggregateValetData }) => {
    const [valetCarsData, setValetCarsData] = useState({ totalValetCars: 0, dailyData: [], monthlyData: [] });

    useEffect(() => {
        const fetchAndAggregate = async () => {
            const cars = await getValetCarData(valet.id);
            setValetCarsData(aggregateValetData(cars));
        };
        fetchAndAggregate();
    }, [valet.id, getValetCarData, aggregateValetData]);

    return (
        <div className="card p-4 bg-gray-50 border border-gray-200 space-y-4">
            <h4 className="text-xl font-bold text-text-color-primary flex items-center">
                <User className="mr-2 text-secondary-color" size={20} />
                {valet.employeeName || 'Unknown Valet'} (ID: {valet.id})
            </h4>
            <p className="text-lg text-text-color-secondary">Total Cars Parked: <span className="font-semibold">{valetCarsData.totalValetCars}</span></p>

            {valetCarsData.dailyData.length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-text-color-secondary mb-2 flex items-center"><CalendarDays className="mr-1" size={16} /> Daily Parking Activity</h5>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={valetCarsData.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="date" stroke="var(--text-color-secondary)" />
                            <YAxis allowDecimals={false} stroke="var(--text-color-secondary)" />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Legend />
                            <Bar dataKey="count" fill="var(--primary-color)" name="Cars Parked" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {valetCarsData.monthlyData.length > 0 && (
                <div>
                    <h5 className="text-md font-semibold text-text-color-secondary mb-2 flex items-center"><CalendarDays className="mr-1" size={16} /> Monthly Parking Activity</h5>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={valetCarsData.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-color-secondary)" />
                            <YAxis allowDecimals={false} stroke="var(--text-color-secondary)" />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="var(--secondary-color)" name="Cars Parked" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
            {valetCarsData.totalValetCars === 0 && (
                <p className="text-sm text-gray-500">No parking activity recorded for this valet yet.</p>
            )}
        </div>
    );
};

export default AdminDashboard;
