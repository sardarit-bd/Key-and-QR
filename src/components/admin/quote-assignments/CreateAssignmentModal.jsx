import { useState, useEffect } from "react";
import { X, Search, Tag, User, Star, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

export default function CreateAssignmentModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: select type, 2: select target, 3: select quote, 4: configure
    const [assignmentType, setAssignmentType] = useState("tag");
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [priority, setPriority] = useState(0);
    const [isActive, setIsActive] = useState(true);
    
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
        if (isOpen) {
            fetchTags();
            fetchUsers();
            fetchQuotes();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            const response = await api.get("/tags?limit=100");
            setTags(response.data?.data?.data || response.data?.data || []);
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get("/admin/users?limit=100");
            setUsers(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchQuotes = async () => {
        try {
            const response = await api.get("/quotes?limit=100&isActive=true");
            setQuotes(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedQuote) {
            toast.error("Please select a quote");
            return;
        }
        
        if (assignmentType === "tag" && !selectedTag) {
            toast.error("Please select a tag");
            return;
        }
        
        if (assignmentType === "user" && !selectedUser) {
            toast.error("Please select a user");
            return;
        }
        
        setLoading(true);
        try {
            const payload = {
                quote: selectedQuote._id,
                assignmentType,
                priority,
                isActive
            };
            
            if (assignmentType === "tag") {
                payload.tag = selectedTag._id;
            } else {
                payload.user = selectedUser._id;
            }
            
            await api.post("/quote-assignments", payload);
            toast.success("Assignment created successfully");
            onSuccess();
            onClose();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setAssignmentType("tag");
        setSelectedTag(null);
        setSelectedUser(null);
        setSelectedQuote(null);
        setPriority(0);
        setIsActive(true);
        setSearchTerm("");
    };

    const filteredTags = tags.filter(tag => 
        tag.tagCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredQuotes = quotes.filter(quote =>
        quote.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create Quote Assignment</h2>
                            <p className="text-sm text-gray-500 mt-1">Assign a quote to a tag or user</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Step 1: Assignment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment Type *
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setAssignmentType("tag");
                                    setSelectedTag(null);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                                    assignmentType === "tag"
                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                        : "border-gray-200 hover:border-purple-200"
                                }`}
                            >
                                <Tag size={18} />
                                Tag Assignment
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAssignmentType("user");
                                    setSelectedUser(null);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                                    assignmentType === "user"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-200 hover:border-green-200"
                                }`}
                            >
                                <User size={18} />
                                User Assignment
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Select Target (Tag or User) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select {assignmentType === "tag" ? "Tag" : "User"} *
                        </label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${assignmentType === "tag" ? "tag code" : "user email"}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                            />
                        </div>
                        
                        <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                            {assignmentType === "tag" ? (
                                filteredTags.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No tags found</div>
                                ) : (
                                    filteredTags.map(tag => (
                                        <button
                                            key={tag._id}
                                            onClick={() => setSelectedTag(tag)}
                                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center justify-between ${
                                                selectedTag?._id === tag._id ? "bg-purple-50" : ""
                                            }`}
                                        >
                                            <span className="font-mono text-sm">{tag.tagCode}</span>
                                            {selectedTag?._id === tag._id && (
                                                <span className="text-purple-600 text-xs">Selected</span>
                                            )}
                                        </button>
                                    ))
                                )
                            ) : (
                                filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No users found</div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <button
                                            key={user._id}
                                            onClick={() => setSelectedUser(user)}
                                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition ${
                                                selectedUser?._id === user._id ? "bg-green-50" : ""
                                            }`}
                                        >
                                            <div className="font-medium text-sm">{user.name || "No name"}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </button>
                                    ))
                                )
                            )}
                        </div>
                        
                        {selectedTag && (
                            <div className="mt-2 text-sm text-purple-600">
                                ✓ Selected: {selectedTag.tagCode}
                            </div>
                        )}
                        {selectedUser && (
                            <div className="mt-2 text-sm text-green-600">
                                ✓ Selected: {selectedUser.email}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Select Quote */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Quote *
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                            {filteredQuotes.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No quotes found</div>
                            ) : (
                                filteredQuotes.map(quote => (
                                    <button
                                        key={quote._id}
                                        onClick={() => setSelectedQuote(quote)}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition ${
                                            selectedQuote?._id === quote._id ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <p className="text-sm text-gray-900 italic line-clamp-2">
                                            "{quote.text}"
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{quote.category}</span>
                                            {quote.author && quote.author !== "InspireTag" && (
                                                <span className="text-xs text-gray-400">— {quote.author}</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Step 4: Configuration */}
                    <div className="space-y-4">
                        {/* Priority Slider */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority Level: {priority}
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">Low</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-gray-500">High</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Higher priority assignments are delivered first
                            </p>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Active Status</p>
                                <p className="text-xs text-gray-500">Inactive assignments won't be used</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                    isActive ? "bg-green-600" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        isActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {/* Info Box */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                                <div className="text-xs text-blue-700">
                                    <p>This assignment will be used when a user scans:</p>
                                    <ul className="list-disc list-inside mt-1">
                                        <li>For {assignmentType === "tag" ? `tag "${selectedTag?.tagCode || 'selected tag'}"` : `user "${selectedUser?.email || 'selected user'}"`}</li>
                                        <li>Priority {priority} - {priority >= 5 ? "High priority" : priority >= 3 ? "Medium priority" : "Low priority"}</li>
                                        <li>Quote: "{selectedQuote?.text?.substring(0, 50)}..."</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedQuote || (assignmentType === "tag" && !selectedTag) || (assignmentType === "user" && !selectedUser)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Assignment"}
                    </button>
                </div>
            </div>
        </div>
    );
}