import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ParkingSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

import { FirebaseContext } from './FirebaseProvider';
import ReceiveCarModule from './ReceiveCarModule';
// Removed SwipeButton import as it's no longer needed
// import SwipeButton from './SwipeButton';

const ValetDashboard = () => {
    const { db } = useContext(FirebaseContext);
    // IMPORTANT: App ID
    const appId = '1:1038485808891:web:94222225baddee049e725e';
    const [parkedCars, setParkedCars] = useState([]);
    const [message, setMessage] = useState('');
    const [parkingStatusData, setParkingStatusData] = useState([]);
    const [timeAnalyticsData, setTimeAnalyticsData] = useState([]);

    useEffect(() => {
        if (!db) return;

        const q = query(collection(db, `artifacts/${appId}/public/data/parkings`), where('isOccupied', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cars = [];
            snapshot.forEach(doc => {
                cars.push({ id: doc.id, ...doc.data() });
            });
            cars.sort((a, b) => {
                if (a.status === 'requested' && b.status !== 'requested') return -1;
                if (b.status === 'requested' && a.status !== 'requested') return 1;
                return 0;
            });
            setParkedCars(cars);
        }, (error) => console.error("Error fetching parked cars:", error));

        return () => unsubscribe();
    }, [db, appId]);

    useEffect(() => {
        const parkedCount = parkedCars.filter(car => car.status === 'parked').length;
        const requestedCount = parkedCars.filter(car => car.status === 'requested').length;
        const readyCount = parkedCars.filter(car => car.status === 'ready').length;

        setParkingStatusData([
            { name: 'Parked', count: parkedCount },
            { name: 'Requested', count: requestedCount },
            { name: 'Ready', count: readyCount },
        ]);

        let totalRequestToReadyTime = 0;
        let readyCarsCount = 0;

        parkedCars.forEach(car => {
            if (car.status === 'ready' && car.timestampRequested && car.timestampReady) {
                const requestedTime = new Date(car.timestampRequested).getTime();
                const readyTime = new Date(car.timestampReady).getTime();
                const durationMinutes = (readyTime - requestedTime) / (1000 * 60);
                if (durationMinutes > 0) {
                    totalRequestToReadyTime += durationMinutes;
                    readyCarsCount++;
                }
            }
        });

        const averageRequestToReady = readyCarsCount > 0 ? (totalRequestToReadyTime / readyCarsCount).toFixed(2) : 0;

        setTimeAnalyticsData([
            { name: 'Avg. Request to Ready (min)', value: parseFloat(averageRequestToReady) },
        ]);

    }, [parkedCars]);

    const handleMarkCarReady = async (parkingSpaceId) => {
        if (!db) return;
        try {
            const parkingDocRef = doc(db, `artifacts/${appId}/public/data/parkings`, parkingSpaceId);
            await updateDoc(parkingDocRef, {
                status: 'ready',
                timestampReady: new Date().toISOString(),
            });
            setMessage(`Car in ${parkingSpaceId} marked as ready.`);
        } catch (error) {
            console.error("Error marking car ready:", error);
            setMessage('Failed to mark car ready. Please try again.');
        }
    };

    const handleClearParking = async (parkingSpaceId) => {
        if (!db) return;
        try {
            const parkingDocRef = doc(db, `artifacts/${appId}/public/data/parkings`, parkingSpaceId);
            await updateDoc(parkingDocRef, {
                isOccupied: false,
                carDetails: null,
                status: null,
                timestampParked: null,
                timestampRequested: null,
                timestampReady: null,
                timestampDelivered: null,
            });
            setMessage(`Parking space ${parkingSpaceId} cleared.`);
        } catch (error) {
            console.error("Error clearing parking:", error);
            setMessage('Failed to clear parking. Please try again.');
        }
    };

    const handleEndService = async (parkingSpaceId, customerPhoneNumber) => {
        if (!db) return;
        try {
            const parkingDocRef = doc(db, `artifacts/${appId}/public/data/parkings`, parkingSpaceId);
            await updateDoc(parkingDocRef, {
                isOccupied: false,
                carDetails: null,
                status: 'delivered',
                timestampParked: null,
                timestampRequested: null,
                timestampReady: null,
                timestampDelivered: new Date().toISOString(),
            });
            setMessage(`Service ended for car in ${parkingSpaceId}. Simulated WhatsApp notification sent to customer ${customerPhoneNumber}: Your car is ready at the doorstep!`);
        } catch (error) {
            console.error("Error ending service:", error);
            setMessage('Failed to end service. Please try again.');
        }
    };

    return (
        <div className="card w-full max-w-2xl p-6 space-y-6 animate-fade-in  mx-auto">
            <h2 className="text-3xl font-bold text-center text-accent-color">Valet Dashboard</h2>

            {message && (
                <div className="message-box animate-slide-down">
                    {message}
                </div>
            )}

            <ReceiveCarModule setMessage={setMessage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="card p-4 bg-blue-50 border border-blue-200">
                    <h3 className="text-xl font-semibold text-center text-blue-700 mb-4">Cars by Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={parkingStatusData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-color-secondary)" />
                            <YAxis allowDecimals={false} stroke="var(--text-color-secondary)" />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Legend />
                            <Bar dataKey="count" fill="var(--primary-color)" name="Number of Cars" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-4 bg-purple-50 border border-purple-200">
                    <h3 className="text-xl font-semibold text-center text-purple-700 mb-4">Time Analytics</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={timeAnalyticsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-color-secondary)" />
                            <YAxis stroke="var(--text-color-secondary)" />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="var(--secondary-color)" activeDot={{ r: 8 }} name="Time in Minutes" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h3 className="text-2xl font-semibold text-center text-text-color-primary mt-6 mb-4">Current Parked Cars</h3>
            {parkedCars.length === 0 ? (
                <p className="text-center text-text-color-secondary p-4 card">No cars currently parked or requested.</p>
            ) : (
                <div className="space-y-4">
                    {parkedCars.map((car) => (
                        <div key={car.id} className="card p-4 bg-gray-50 border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex-grow space-y-1 mb-3 md:mb-0">
                                <div className="flex items-center">
                                    <ParkingSquare className="mr-2 text-primary-color" size={24} />
                                    <h3 className="text-xl font-bold text-text-color-primary">{car.id}</h3>
                                </div>
                                <p className="text-lg text-text-color-secondary"><strong>Car:</strong> {car.carDetails?.make} {car.carDetails?.model}</p>
                                <p className="text-lg text-text-color-secondary"><strong>Number:</strong> {car.carDetails?.number}</p>
                                {car.valetName && <p className="text-sm text-gray-600">Parked by: {car.valetName}</p>}
                                <p className="text-sm text-gray-500">
                                    Parked: {car.timestampParked ? new Date(car.timestampParked).toLocaleString() : 'N/A'}
                                </p>
                                {car.status === 'requested' && (
                                    <p className="text-sm text-yellow-600 font-medium flex items-center">
                                        Requested: {car.timestampRequested ? new Date(car.timestampRequested).toLocaleString() : 'N/A'}
                                    </p>
                                )}
                                {car.status === 'ready' && (
                                    <p className="text-sm text-green-600 font-medium flex items-center">
                                        Ready: {car.timestampReady ? new Date(car.timestampReady).toLocaleString() : 'N/A'}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2 w-full md:w-auto md:ml-4">
                                <span className={`px-4 py-2 rounded-full text-white font-semibold text-sm text-center
                                    ${car.status === 'parked' ? 'bg-gray-500' : ''}
                                    ${car.status === 'requested' ? 'bg-yellow-500 animate-pulse' : ''}
                                    ${car.status === 'ready' ? 'bg-green-500 animate-bounce-once' : ''}
                                `}>
                                    {car.status.toUpperCase()}
                                </span>
                                {car.status !== 'ready' && (
                                    <button
                                        onClick={() => handleMarkCarReady(car.id)}
                                        className="btn-success w-full py-2 text-sm"
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {car.status === 'ready' && car.carDetails?.customerPhoneNumber && (
                                    <button
                                        onClick={() => handleEndService(car.id, car.carDetails.customerPhoneNumber)}
                                        className="btn-primary w-full py-2 text-sm" // Changed to a regular button
                                    >
                                        End Service / Car Delivered
                                    </button>
                                )}
                                <button
                                    onClick={() => handleClearParking(car.id)}
                                    className="btn-danger w-full py-2 text-sm"
                                >
                                    Clear Parking
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ValetDashboard;
