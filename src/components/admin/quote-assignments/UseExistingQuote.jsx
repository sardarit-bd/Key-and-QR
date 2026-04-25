"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Check, Tag, User, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function UseExistingQuote({ editingAssignment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    quote: "",
    assignmentType: "tag",
    tag: "",
    user: "",
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
    fetchQuotes();
    fetchTags();
    fetchUsers();
    
    if (editingAssignment) {
      setFormData({
        quote: editingAssignment.quote?._id || "",
        assignmentType: editingAssignment.assignmentType,
        tag: editingAssignment.tag?._id || "",
        user: editingAssignment.user?._id || "",
        priority: editingAssignment.priority,
        isActive: editingAssignment.isActive,
      });
    }
  }, [editingAssignment]);

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

      if (editingAssignment) {
        await api.patch(`/quote-assignments/${editingAssignment._id}`, payload);
        toast.success("Assignment updated successfully!");
      } else {
        await api.post("/quote-assignments", payload);
        toast.success("Assignment created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save assignment");
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

  const getTagOwnerText = (tag) => {
    if (tag.owner) {
      const ownerName = tag.owner?.name || "Unknown";
      const ownerEmail = tag.owner?.email || "";
      return `${tag.tagCode} — ${ownerName}${ownerEmail ? ` (${ownerEmail})` : ""}`;
    }
    return `${tag.tagCode} — Unassigned`;
  };

  // Get selected quote text
  const getSelectedQuoteText = () => {
    const quote = quotes.find(q => q._id === formData.quote);
    return quote ? quote.text : "";
  };

  return (
    <div className="flex-1 w-full min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Assign a quote to a specific tag or user
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredQuotes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No quotes found</div>
              ) : (
                filteredQuotes.map((q) => (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quote: q._id }))}
                    className={`w-full p-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${
                      formData.quote === q._id ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 line-clamp-2">“{q.text}”</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">— {q.author || "Unknown"}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{q.category}</span>
                          {!q.allowReuse && (
                            <span className="text-xs text-orange-600">(One-time use)</span>
                          )}
                        </div>
                      </div>
                      <div className="min-w-[20px]">
                        {formData.quote === q._id && (
                          <Check size={18} className="text-green-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {formData.quote && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Check size={14} className="text-green-600" />
                  Selected: {getSelectedQuoteText().substring(0, 100)}...
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign To <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignmentType: "tag", tag: "", user: "" }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition cursor-pointer ${
                  formData.assignmentType === "tag"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Tag size={16} />
                <span className="font-medium">Tag</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignmentType: "user", tag: "", user: "" }))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition cursor-pointer ${
                  formData.assignmentType === "user"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <User size={16} />
                <span className="font-medium">User</span>
              </button>
            </div>
          </div>

          {formData.assignmentType === "tag" && (
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
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredTags.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No tags found</div>
                ) : (
                  filteredTags.map((t) => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tag: t._id }))}
                      className={`w-full p-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${
                        formData.tag === t._id ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="font-mono text-sm font-medium">{getTagOwnerText(t)}</span>
                          {!t.isActive && (
                            <span className="ml-2 text-xs text-red-500">(Inactive)</span>
                          )}
                        </div>
                        {formData.tag === t._id && (
                          <Check size={18} className="text-green-600 min-w-[18px]" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3b. Select User (conditional) */}
          {formData.assignmentType === "user" && (
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
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, user: u._id }))}
                      className={`w-full p-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${
                        formData.user === u._id ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name || "Unnamed User"}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        {formData.user === u._id && (
                          <Check size={18} className="text-green-600 min-w-[18px]" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. Priority & Status - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-400 mt-1">Higher = shown first in rotation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                  formData.isActive ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.isActive ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
              <p className="text-xs text-gray-400 mt-1">
                {formData.isActive ? "Active - Assignment will be used" : "Inactive - Assignment is disabled"}
              </p>
            </div>
          </div>

          {/* Submit Button */}
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
              disabled={
                loading || 
                !formData.quote || 
                (formData.assignmentType === "tag" && !formData.tag) || 
                (formData.assignmentType === "user" && !formData.user)
              }
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              {loading ? "Saving..." : editingAssignment ? "Update Assignment" : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}