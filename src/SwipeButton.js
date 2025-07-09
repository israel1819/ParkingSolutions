import React, { useState, useEffect, useRef } from 'react';

const SwipeButton = ({ onSwipeComplete, label, className }) => {
    const [isSwiping, setIsSwiping] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [swipeComplete, setSwipeComplete] = useState(false);
    const containerRef = useRef(null);
    const mounted = useRef(false);
    const SWIPE_THRESHOLD_PERCENT = 0.7;

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleStart = (e) => {
        if (swipeComplete) return;
        setIsSwiping(true);
        setStartX(e.touches ? e.touches[0].clientX : e.clientX);
        setTranslateX(0);
    };

    const handleMove = (e) => {
        if (!isSwiping || swipeComplete) return;

        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        let deltaX = currentX - startX;

        if (deltaX < 0) deltaX = 0;

        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 1;
        const maxTranslateX = containerWidth - 50;
        if (deltaX > maxTranslateX) deltaX = maxTranslateX;

        if (mounted.current) {
            setTranslateX(deltaX);
        }

        if (deltaX / containerWidth >= SWIPE_THRESHOLD_PERCENT) {
            if (mounted.current && !swipeComplete) {
                setSwipeComplete(true);
                onSwipeComplete();
            }
        }
    };

    const handleEnd = () => {
        setIsSwiping(false);
        if (!swipeComplete) {
            if (mounted.current) {
                setTranslateX(0);
            }
        }
    };

    useEffect(() => {
        const handleGlobalEnd = () => {
            if (isSwiping && !swipeComplete) {
                if (mounted.current) {
                    setTranslateX(0);
                    setIsSwiping(false);
                }
            }
        };

        window.addEventListener('mouseup', handleGlobalEnd);
        window.addEventListener('touchend', handleGlobalEnd);

        return () => {
            window.removeEventListener('mouseup', handleGlobalEnd);
            window.removeEventListener('touchend', handleGlobalEnd);
        };
    }, [isSwiping, swipeComplete]);


    return (
        <div
            ref={containerRef}
            className={`relative w-full h-12 bg-blue-500 rounded-md overflow-hidden cursor-pointer select-none transition-colors duration-300 ${className} ${swipeComplete ? 'bg-green-600' : ''}`}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseUp={handleEnd}
            onTouchEnd={handleEnd}
            onMouseLeave={handleEnd}
        >
            <div
                className="absolute top-0 left-0 h-full w-12 bg-blue-700 rounded-md flex items-center justify-center text-white text-xl shadow-md transition-transform duration-100 ease-out"
                style={{ transform: `translateX(${translateX}px)` }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg pointer-events-none">
                {swipeComplete ? 'Delivered!' : label}
            </div>
        </div>
    );
};

export default SwipeButton;