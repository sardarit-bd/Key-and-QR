"use client";

import { useState, useRef, useEffect } from "react";
import { X, RefreshCw, ChevronLeft, Check, Upload, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

// Custom Select Component
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 flex items-center justify-between cursor-pointer"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronLeft size={14} className={`transform transition ${isOpen ? "-rotate-90" : "rotate-0"}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between cursor-pointer"
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-green-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function CreateNewQuoteModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    text: "",
    category: "motivation",
    author: "",
    description: "",
    allowReuse: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const categoryOptions = [
    { value: "faith", label: "Faith" },
    { value: "love", label: "Love" },
    { value: "hope", label: "Hope" },
    { value: "success", label: "Success" },
    { value: "motivation", label: "Motivation" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      text: "",
      category: "motivation",
      author: "",
      description: "",
      allowReuse: true,
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error("Please enter quote text");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("text", formData.text);
      formDataToSend.append("category", formData.category);
      
      if (formData.author && formData.author.trim()) {
        formDataToSend.append("author", formData.author);
      }
      
      if (formData.description && formData.description.trim()) {
        formDataToSend.append("description", formData.description);
      }
      
      // Convert boolean to string for FormData
      formDataToSend.append("allowReuse", String(formData.allowReuse));
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const res = await api.post("/quotes", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const newQuote = res.data?.data;
      
      // toast.success("Quote created successfully!");
      onSuccess(newQuote);
      handleClose();
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error(error.response?.data?.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Quote</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new quote to the library</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quote Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter the quote text..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              required
            />
          </div>

          {/* Category - Custom Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={categoryOptions}
              value={formData.category}
              onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              placeholder="Select a category"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="e.g., Rumi, Confucius, Anonymous (default: InspireTag)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a short description or context for this quote..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (Optional)
            </label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative cursor-pointer rounded-md font-medium text-gray-900 hover:text-gray-700">
                    Upload an image
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative inline-block">
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Quote preview"
                    className="h-32 w-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Allow Reuse Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Reuse</label>
              <p className="text-xs text-gray-500">If disabled, this quote can only be used once per user per tag</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, allowReuse: !prev.allowReuse }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                formData.allowReuse ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                formData.allowReuse ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Selected Quote Preview */}
          {formData.text && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-medium mb-1">Quote Preview:</p>
              <p className="text-sm text-gray-800">“{formData.text.substring(0, 150)}{formData.text.length > 150 ? "..." : ""}”</p>
              {formData.author && (
                <p className="text-xs text-gray-500 mt-1">— {formData.author}</p>
              )}
              <p className="text-xs text-green-600 mt-1">
                Category: {categoryOptions.find(c => c.value === formData.category)?.label}
              </p>
              {imagePreview && (
                <p className="text-xs text-green-600 mt-1">✓ Image attached</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.text.trim()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              {loading ? "Creating..." : "Create Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}