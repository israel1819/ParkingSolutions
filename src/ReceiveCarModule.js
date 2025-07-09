import React, { useState, useContext } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { QrCode, CarFront } from 'lucide-react';
import { FirebaseContext } from './FirebaseProvider';

const ReceiveCarModule = ({ setMessage }) => {
    const { db, userId, userProfile } = useContext(FirebaseContext);
    const appId = '1:1038485808891:web:94222225baddee049e725e';

    const [newCarDetails, setNewCarDetails] = useState({
        parkingSpaceId: '',
        make: '',
        model: '',
        number: '',
        customerPhoneNumber: ''
    });
    const [generatedQrId, setGeneratedQrId] = useState('');

    const handleNewCarDetailsChange = (e) => {
        const { name, value } = e.target;
        setNewCarDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateQrId = () => {
        const newId = `P${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        setGeneratedQrId(newId);
        setNewCarDetails(prev => ({ ...prev, parkingSpaceId: newId }));
        setMessage(`New QR ID generated: ${newId}. Customer should scan this.`);
    };

    const handleReceiveCar = async (e) => {
        e.preventDefault();
        if (!db || !userId || !userProfile || !newCarDetails.parkingSpaceId || !newCarDetails.make || !newCarDetails.model || !newCarDetails.number || !newCarDetails.customerPhoneNumber) {
            setMessage('Please ensure you are logged in as a valet and fill all car details.');
            return;
        }

        try {
            const parkingDocRef = doc(db, `artifacts/${appId}/public/data/parkings`, newCarDetails.parkingSpaceId);
            const parkingSnap = await getDoc(parkingDocRef);

            if (parkingSnap.exists() && parkingSnap.data().isOccupied) {
                setMessage('This parking space is already occupied. Please choose another or clear it.');
                return;
            }

            await setDoc(parkingDocRef, {
                isOccupied: true,
                carDetails: {
                    make: newCarDetails.make,
                    model: newCarDetails.model,
                    number: newCarDetails.number,
                    customerPhoneNumber: newCarDetails.customerPhoneNumber,
                },
                status: 'parked',
                timestampParked: new Date().toISOString(),
                timestampRequested: new Date().toISOString(),
                valetId: userId,
                valetName: userProfile.employeeName || 'Unknown Valet',
            });

            setMessage(`Car ${newCarDetails.number} parked in ${newCarDetails.parkingSpaceId} by ${userProfile.employeeName || 'Unknown Valet'}.`);
            setNewCarDetails({
                parkingSpaceId: '',
                make: '',
                model: '',
                number: '',
                customerPhoneNumber: ''
            });
            setGeneratedQrId('');
        } catch (error) {
            console.error("Error receiving car:", error);
            setMessage('Failed to receive car. Please try again.');
        }
    };

    return (
        <div className="card p-6 space-y-6 animate-fade-in">
            <h3 className="text-2xl font-semibold text-center text-primary-color">Receive New Car</h3>
            <button
                onClick={handleGenerateQrId}
                className="btn-secondary w-full flex items-center justify-center py-3"
            >
                <QrCode className="inline-block mr-2" /> Generate New Parking QR (for Customer)
            </button>
            {generatedQrId && (
                <div className="message-box bg-yellow-100 text-yellow-800 border-yellow-300 font-bold animate-slide-down">
                    Display this QR ID to customer: <span className="text-xl">{generatedQrId}</span>
                </div>
            )}

            <form onSubmit={handleReceiveCar} className="space-y-4">
                <div>
                    <label htmlFor="parkingSpaceId" className="block text-sm font-medium text-text-color-secondary mb-1">Parking Space ID</label>
                    <input
                        type="text"
                        id="parkingSpaceId"
                        name="parkingSpaceId"
                        value={newCarDetails.parkingSpaceId}
                        onChange={handleNewCarDetailsChange}
                        className="input-field"
                        placeholder="e.g., P001"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="make" className="block text-sm font-medium text-text-color-secondary mb-1">Car Make</label>
                    <input
                        type="text"
                        id="make"
                        name="make"
                        value={newCarDetails.make}
                        onChange={handleNewCarDetailsChange}
                        className="input-field"
                        placeholder="Toyota"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-text-color-secondary mb-1">Car Model</label>
                    <input
                        type="text"
                        id="model"
                        name="model"
                        value={newCarDetails.model}
                        onChange={handleNewCarDetailsChange}
                        className="input-field"
                        placeholder="Camry"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="number" className="block text-sm font-medium text-text-color-secondary mb-1">Car Number</label>
                    <input
                        type="text"
                        id="number"
                        name="number"
                        value={newCarDetails.number}
                        onChange={handleNewCarDetailsChange}
                        className="input-field"
                        placeholder="ABC 1234"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="customerPhoneNumber" className="block text-sm font-medium text-text-color-secondary mb-1">Customer Phone Number</label>
                    <input
                        type="tel"
                        id="customerPhoneNumber"
                        name="customerPhoneNumber"
                        value={newCarDetails.customerPhoneNumber}
                        onChange={handleNewCarDetailsChange}
                        className="input-field"
                        placeholder="+91XXXXXXXXXX"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center py-3"
                >
                    <CarFront className="inline-block mr-2" /> Park Car
                </button>
            </form>
        </div>
    );
};

export default ReceiveCarModule;
