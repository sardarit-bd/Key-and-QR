// components/admin/quote-assignments/EditAssignmentModal.js
"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function EditAssignmentModal({ isOpen, onClose, assignment, onSuccess }) {
    const [formData, setFormData] = useState({
        quote: "",
        tag: "",
        user: "",
        assignmentType: "tag",
        priority: 0,
        isActive: true,
    });
    const [quotes, setQuotes] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuote, setSearchQuote] = useState("");
    const [searchTag, setSearchTag] = useState("");
    const [searchUser, setSearchUser] = useState("");

    useEffect(() => {
        if (isOpen && assignment) {
            fetchQuotes();
            fetchTags();
            fetchUsers();

            setFormData({
                quote: assignment.quote?._id || "",
                tag: assignment.tag?._id || "",
                user: assignment.user?._id || "",
                assignmentType: assignment.assignmentType,
                priority: assignment.priority,
                isActive: assignment.isActive,
            });
        }
    }, [isOpen, assignment]);

    const fetchQuotes = async () => {
        try {
            const res = await api.get("/quotes?limit=500");
            const quoteData = res.data?.data?.data || res.data?.data || [];
            setQuotes(Array.isArray(quoteData) ? quoteData : []);
        } catch (error) {
            console.error("Failed to fetch quotes:", error);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await api.get("/tags?limit=500");
            const tagData = res.data?.data?.data || [];
            setTags(Array.isArray(tagData) ? tagData : []);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                quote: formData.quote,
                assignmentType: formData.assignmentType,
                priority: parseInt(formData.priority),
                isActive: formData.isActive,
            };

            if (formData.assignmentType === "tag") {
                payload.tag = formData.tag;
            } else {
                payload.user = formData.user;
            }

            await api.patch(`/quote-assignments/${assignment._id}`, payload);
            toast.success("Assignment updated successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update assignment");
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.text?.toLowerCase().includes(searchQuote.toLowerCase()) ||
        q.author?.toLowerCase().includes(searchQuote.toLowerCase())
    );

    const filteredTags = tags.filter(t =>
        t.tagCode?.toLowerCase().includes(searchTag.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Edit Assignment</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.assignmentType === "tag" ? "Editing tag assignment" : "Editing user assignment"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Assignment Type Display (readonly) */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                            Assignment Type: <span className="font-medium">
                                {formData.assignmentType === "tag" ? "Tag Assignment" : "User Assignment"}
                            </span>
                        </p>
                    </div>

                    {/* Select Quote */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Quote <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mb-2">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by quote text or author..."
                                value={searchQuote}
                                onChange={(e) => setSearchQuote(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                            {filteredQuotes.length === 0 ? (
                                <div className="p-3 text-center text-gray-500 text-sm">No quotes found</div>
                            ) : (
                                filteredQuotes.map((q) => (
                                    <button
                                        key={q._id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, quote: q._id }))}
                                        className={`w-full p-2 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${formData.quote === q._id ? "bg-gray-100" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 w-4">
                                                {formData.quote === q._id && <Check size={12} className="text-gray-900" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm line-clamp-1">“{q.text.substring(0, 60)}...”</p>
                                                <p className="text-xs text-gray-500">— {q.author || "Unknown"} · {q.category}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Target Selection */}
                    {formData.assignmentType === "tag" ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Tag <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mb-2">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by tag code..."
                                    value={searchTag}
                                    onChange={(e) => setSearchTag(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                {filteredTags.length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">No tags found</div>
                                ) : (
                                    filteredTags.map((t) => (
                                        <button
                                            key={t._id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tag: t._id }))}
                                            className={`w-full p-2 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${formData.tag === t._id ? "bg-gray-100" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-mono text-sm">{t.tagCode}</span>
                                                    {t.owner && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            → {t.owner?.name || "Unknown"}
                                                        </span>
                                                    )}
                                                </div>
                                                {formData.tag === t._id && <Check size={14} className="text-gray-900" />}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select User <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mb-2">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">No users found</div>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <button
                                            key={u._id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, user: u._id }))}
                                            className={`w-full p-2 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${formData.user === u._id ? "bg-gray-100" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">{u.name || "Unnamed User"}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                                {formData.user === u._id && <Check size={14} className="text-gray-900" />}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Higher = shown first in rotation</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${formData.isActive ? "bg-gray-900" : "bg-gray-300"
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.isActive ? "translate-x-6" : "translate-x-1"
                                    }`} />
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.isActive ? "Active - This assignment will be used" : "Inactive - This assignment is disabled"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.quote || (formData.assignmentType === "tag" && !formData.tag) || (formData.assignmentType === "user" && !formData.user)}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                        >
                            {loading && <RefreshCw size={16} className="animate-spin" />}
                            {loading ? "Updating..." : "Update Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}