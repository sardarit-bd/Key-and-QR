"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const TableTooltip = ({ children, content }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    const updatePosition = () => {
        if (triggerRef.current && show) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 8,
                left: rect.left + rect.width / 2
            });
        }
    };

    useEffect(() => {
        if (show) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [show]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="inline-flex cursor-help"
            >
                {children}
            </div>
            
            {show && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{ 
                        top: position.top, 
                        left: position.left,
                        transform: 'translateX(-50%) translateY(-100%)'
                    }}
                >
                    <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                        {content}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};