"use client";

import { useState, useRef } from "react";
import { X, Edit3, Tag, User, AlignLeft, Palette, Image as ImageIcon, RefreshCw, Power, Save, Smartphone, Upload, Trash2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import MobilePreview from "./MobilePreview";
import api from "@/lib/api";
import { MdTipsAndUpdates } from "react-icons/md";

const CATEGORIES = [
  { value: "faith", label: "Faith", icon: "☾" },
  { value: "love", label: "Love", icon: "♥" },
  { value: "hope", label: "Hope", icon: "✦" },
  { value: "success", label: "Success", icon: "☆" },
  { value: "motivation", label: "Motivation", icon: "◐" },
];

// File validation helper
const validateImageFile = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, message: "No file selected" };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: "Only JPG, PNG, GIF, or WEBP images are allowed" };
  }

  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      message: `File size (${sizeInMB}MB) exceeds 5MB limit. Please compress or use a smaller image.` 
    };
  }

  return { valid: true, message: null };
};

export default function QuoteEditModal({ quote, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    text: quote.text,
    category: quote.category,
    author: quote.author || "",
    description: quote.description || "",
    theme: quote.theme || "",
    allowReuse: quote.allowReuse !== false,
    isActive: quote.isActive !== false,
  });
  
  // Image state
  const [currentImage, setCurrentImage] = useState(quote.image?.url || null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imageAction, setImageAction] = useState("keep"); // "keep", "remove", "replace"
  const [imageError, setImageError] = useState(null);

  // Handle image selection with proper validation
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    // Clear previous error
    setImageError(null);
    
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      setImageError(validation.message);
      toast.error(validation.message, { duration: 5000 });
      // Clear file input
      e.target.value = "";
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentImage(event.target.result);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file");
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);

    // Set new image file and action
    setNewImageFile(file);
    setImageAction("replace");
    setImageError(null);
    
    // Show success message
    const sizeInKB = (file.size / 1024).toFixed(2);
    toast.success(`Selected: ${file.name} (${sizeInKB} KB)`);
    
    // Clear file input
    e.target.value = "";
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Create a fake event for validation
    const fakeEvent = { target: { files: [file], value: "" } };
    handleImageSelect(fakeEvent);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setCurrentImage(null);
    setNewImageFile(null);
    setImageAction("remove");
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image will be removed when you save");
  };

  // Handle image reset (revert to original)
  const handleResetImage = () => {
    setCurrentImage(quote.image?.url || null);
    setNewImageFile(null);
    setImageAction("keep");
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image reset to original");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast.error("Quote text is required");
      return;
    }

    setLoading(true);
    setImageError(null);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          submitData.append(key, String(formData[key]));
        }
      });

      // Handle image based on action
      if (imageAction === "replace" && newImageFile) {
        // Double-check file size before upload
        if (newImageFile.size > 5 * 1024 * 1024) {
          throw new Error("Image file exceeds 5MB limit");
        }
        submitData.append("image", newImageFile);
        console.log("📸 Uploading new image:", newImageFile.name, `(${(newImageFile.size / 1024).toFixed(2)} KB)`);
      } else if (imageAction === "remove") {
        submitData.append("removeImage", "true");
        console.log("🗑️ Removing image");
      }

      const response = await api.patch(`/quotes/${quote._id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add timeout for large files
        timeout: 30000,
      });

      if (response.data?.success || response.status === 200) {
        toast.success("Quote updated successfully");
        onSave(response.data?.data || response.data);
      } else {
        throw new Error(response.data?.message || "Failed to update");
      }
    } catch (error) {
      console.error("Update error:", error);
      
      // Handle network timeout errors
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again with a smaller image.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update quote");
      }
    } finally {
      setLoading(false);
    }
  };

  const previewQuote = {
    ...formData,
    image: currentImage ? { url: currentImage } : null,
    _id: quote._id,
  };

  // Check if image has been modified
  const isImageModified = imageAction !== "keep";
  const originalImageUrl = quote.image?.url;

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Edit3 size={20} className="text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Edit Quote</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Quote Text */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <AlignLeft size={14} />
                Quote Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Enter quote text..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag size={14} />
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.category === cat.value
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User size={14} />
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Author name (optional)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <AlignLeft size={14} />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Additional context (optional)"
              />
            </div>

            {/* Theme */}
            {/* <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Palette size={14} />
                Theme / Mood
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., sunset, ocean, forest (optional)"
              />
            </div> */}

            {/* Image Upload Section with Drag & Drop */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <ImageIcon size={14} />
                Quote Image
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (Max 5MB, JPG/PNG/GIF/WEBP)
                </span>
              </label>

              {/* Error Message Display */}
              {imageError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{imageError}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Please compress your image or choose a smaller file.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Image Preview Area */}
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage}
                    alt="Quote preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                  />
                  
                  {/* Image Action Buttons */}
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    {/* Change Image Button */}
                    <label className="cursor-pointer bg-white rounded-lg px-3 py-1.5 text-xs font-medium shadow-md hover:bg-gray-50 transition flex items-center gap-1">
                      <Upload size={12} />
                      Change
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    
                    {/* Remove Image Button */}
                    {originalImageUrl && imageAction !== "remove" && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium shadow-md hover:bg-red-600 transition flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    )}
                    
                    {/* Reset Button (when image is modified) */}
                    {isImageModified && (
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="bg-gray-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium shadow-md hover:bg-gray-600 transition flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Upload Area with Drag & Drop
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-gray-400 transition bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={40} className="text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click or drag & drop to upload</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF, WEBP (Max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Image Status Message */}
              {imageAction === "remove" && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 bg-amber-50 p-2 rounded">
                  <Trash2 size={12} />
                  Image will be removed when you save
                </p>
              )}
              {imageAction === "replace" && newImageFile && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 bg-green-50 p-2 rounded">
                  <Upload size={12} />
                  New image ready to upload: {newImageFile.name} ({formatFileSize(newImageFile.size)})
                </p>
              )}

              {/* File size recommendation */}
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <MdTipsAndUpdates className="text-yellow-400" size={12} /> Tip: For best performance, use images under 1MB. Large images may take longer to upload.
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {/* Allow Reuse */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Allow Reuse</p>
                    <p className="text-xs text-gray-500">Can be shown multiple times to same user</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowReuse: !formData.allowReuse })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    formData.allowReuse ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      formData.allowReuse ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Power size={14} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active Status</p>
                    <p className="text-xs text-gray-500">Show this quote in random rotation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    formData.isActive ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      formData.isActive ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <Smartphone size={16} />
                Preview
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <MobilePreview quote={previewQuote} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}