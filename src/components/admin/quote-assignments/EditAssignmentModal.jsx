import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

export default function EditAssignmentModal({ isOpen, onClose, assignment, onSuccess }) {
    const [priority, setPriority] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (assignment) {
            setPriority(assignment.priority || 0);
            setIsActive(assignment.isActive !== undefined ? assignment.isActive : true);
            setSelectedQuote(assignment.quote);
        }
    }, [assignment]);

    useEffect(() => {
        if (isOpen) {
            fetchQuotes();
        }
    }, [isOpen]);

    const fetchQuotes = async () => {
        try {
            const response = await api.get("/quotes?limit=100&isActive=true");
            setQuotes(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    };

    const filteredQuotes = quotes.filter(quote =>
        quote.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selectedQuote) {
            toast.error("Please select a quote");
            return;
        }
        
        setLoading(true);
        try {
            await api.patch(`/quote-assignments/${assignment._id}`, {
                quote: selectedQuote._id,
                priority,
                isActive
            });
            toast.success("Assignment updated successfully");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update assignment");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Assignment</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {assignment.assignmentType === "tag" 
                                    ? `Tag: ${assignment.tag?.tagCode}` 
                                    : `User: ${assignment.user?.email}`}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Assignment Info */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Current Quote:</span> "{assignment.quote?.text?.substring(0, 100)}..."
                        </p>
                    </div>

                    {/* Select New Quote */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Quote (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search quotes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                            />
                        </div>
                        
                        <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
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
                            Higher priority = delivered first
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
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}