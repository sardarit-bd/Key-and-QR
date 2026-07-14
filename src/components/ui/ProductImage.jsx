"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER_IMAGE = "/placeholder.png";

/**
 * Product Image component with fallback
 */
export function ProductImage({ 
    src, 
    alt, 
    width, 
    height, 
    className = "",
    fill = false,
    priority = false,
    ...props 
}) {
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Prevent infinite error loops
    const handleError = (e) => {
        if (retryCount >= 1) {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
            return;
        }
        setRetryCount(prev => prev + 1);
        setError(true);
    };

    const imageSrc = error ? PLACEHOLDER_IMAGE : src || PLACEHOLDER_IMAGE;

    if (fill) {
        return (
            <Image
                src={imageSrc}
                alt={alt || "Product image"}
                fill
                className={className}
                onError={handleError}
                priority={priority}
                {...props}
            />
        );
    }

    return (
        <Image
            src={imageSrc}
            alt={alt || "Product image"}
            width={width}
            height={height}
            className={className}
            onError={handleError}
            priority={priority}
            {...props}
        />
    );
}