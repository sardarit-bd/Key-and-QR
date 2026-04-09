"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import {
    AlertCircle,
    Award,
    Calendar,
    Camera,
    CheckCircle,
    Eye,
    EyeOff,
    Heart,
    Loader2,
    LogOut,
    Mail,
    QrCode,
    Save,
    Settings,
    Shield,
    ShoppingBag,
    User,
    X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export default function UserProfilePage() {
    const router = useRouter();
    const { user, updateUser, logout } = useAuthStore();

    // Profile states
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Password change states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // File input ref
    const fileInputRef = useRef(null);

    // Stats
    const [stats, setStats] = useState({
        memberSince: "",
        totalOrders: 0,
        totalFavorites: 0,
        totalScans: 0,
    });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
            setImagePreview(user.profileImage?.url || null);
            fetchUserStats();
        }
    }, [user]);

    // Fetch user stats
    const fetchUserStats = async () => {
        try {
            const [ordersRes, favoritesRes, scansRes] = await Promise.all([
                api.get("/orders").catch(() => ({ data: { data: [] } })),
                api.get("/favorites").catch(() => ({ data: { data: [] } })),
                api.get("/scan/history").catch(() => ({ data: { data: [] } })),
            ]);

            const orders = ordersRes.data?.data || [];
            const favorites = favoritesRes.data?.data || [];
            const scans = scansRes.data?.data || [];

            setStats({
                memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                }) : "N/A",
                totalOrders: orders.length,
                totalFavorites: favorites.length,
                totalScans: scans.length,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setProfileImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Upload image to server
    const uploadImage = async () => {
        if (!profileImage) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", profileImage);

            const response = await api.post("/auth/upload-avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const imageData = response.data?.data || response.data;
            toast.success("Profile picture updated!");
            return imageData;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.response?.data?.message || "Failed to upload image");
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    // Update profile
    const handleUpdateProfile = async () => {
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        setLoading(true);
        try {
            let imageData = null;

            // Upload image if changed
            if (profileImage) {
                imageData = await uploadImage();
                if (!imageData && profileImage) {
                    setLoading(false);
                    return;
                }
            }

            // Update profile
            const updateData = {
                name: formData.name.trim(),
                ...(imageData && { profileImage: imageData }),
            };

            const response = await api.patch("/auth/update-profile", updateData);
            const updatedUser = response.data?.data || response.data;

            // Update store
            if (updateUser) {
                updateUser(updatedUser);
            }

            toast.success("Profile updated successfully!");
            setIsEditing(false);
            setProfileImage(null);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        // Validation
        if (!passwordData.oldPassword) {
            setPasswordError("Current password is required");
            return;
        }
        if (!passwordData.newPassword) {
            setPasswordError("New password is required");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setChangingPassword(true);
        setPasswordError("");

        try {
            await api.post("/auth/change-password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });

            toast.success("Password changed successfully!");
            setShowPasswordModal(false);
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError(error.response?.data?.message || "Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
        router.push("/");
        toast.success("Logged out successfully");
    };

    // Cancel editing
    const cancelEditing = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
        });
        setProfileImage(null);
        setImagePreview(user?.profileImage?.url || null);
    };

    // Get provider badge
    const getProviderBadge = () => {
        const provider = user?.provider || "local";
        if (provider === "google") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    Google Account
                </span>
            );
        }
        if (provider === "apple") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    Apple Account
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Local Account
            </span>
        );
    };

    if (!user) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-7 h-7 md:w-8 md:h-8" />
                        My Profile
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your account information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                                        <div className="w-full h-full rounded-full bg-white p-0.5">
                                            {imagePreview ? (
                                                <Image
                                                    src={imagePreview}
                                                    alt={user.name}
                                                    width={120}
                                                    height={120}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User size={48} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                                        >
                                            {uploadingImage ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Camera size={16} className="text-gray-600" />
                                            )}
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </div>

                                <h2 className="mt-4 text-xl font-semibold text-gray-900 capitalize">
                                    {user.name}
                                </h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Mail size={14} />
                                    {user.email}
                                </p>

                                <div className="mt-3">
                                    {getProviderBadge()}
                                </div>

                                {user?.role === "admin" && (
                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                        <Shield size={12} />
                                        Administrator
                                    </div>
                                )}

                                <div className="mt-6 w-full space-y-3">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                        >
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={loading || uploadingImage}
                                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {loading ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Save size={18} />
                                                )}
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                disabled={loading}
                                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                                            >
                                                <X size={18} className="inline mr-1" />
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        disabled={user?.provider !== "local"}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${user?.provider !== "local"
                                            ? "opacity-50 cursor-not-allowed bg-gray-100"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <Settings size={18} />
                                        Change Password
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Info & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User size={20} />
                                Profile Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.email}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {user?.isEmailVerified && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle size={16} />
                                        Email verified
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Statistics */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Award size={20} />
                                Account Statistics
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-sm">Member Since</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{stats.memberSince}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <ShoppingBag size={16} />
                                        <span className="text-sm">Total Orders</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Heart size={16} />
                                        <span className="text-sm">Favorites</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{stats.totalFavorites}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <QrCode size={16} />
                                        <span className="text-sm">Total Scans</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{stats.totalScans}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle size={16} />
                                {passwordError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 pr-10"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 pr-10"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 pr-10"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {changingPassword ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                Update Password
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}