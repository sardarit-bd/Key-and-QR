import { useState } from 'react';

export default function Avatar({ user, size = 'md', className = '' }) {
    const [imgError, setImgError] = useState(false);
    
    const getInitials = () => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    
    const getImageUrl = () => {
        if (!user?.profileImage) return null;
        if (typeof user.profileImage === 'string') return user.profileImage;
        if (user.profileImage?.url) return user.profileImage.url;
        return null;
    };
    
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-14 h-14 text-lg',
        lg: 'w-24 h-24 text-2xl',
        xl: 'w-32 h-32 text-3xl'
    };
    
    const imageUrl = getImageUrl();
    
    if (imageUrl && !imgError) {
        return (
            <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 ${sizeClasses[size]} ${className}`}>
                <img
                    src={imageUrl}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }
    
    return (
        <div className={`rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${className}`}>
            {getInitials()}
        </div>
    );
}