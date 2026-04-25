"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/shared/Loader";
import { Save, RefreshCw, Plus, Trash2, GripVertical } from "lucide-react";

const iconOptions = [
  { value: "ShoppingBag", label: "Shopping Bag", icon: "🛍️" },
  { value: "QrCode", label: "QR Code", icon: "📱" },
  { value: "Scan", label: "Scan", icon: "📷" },
];

const colorOptions = [
  { value: "bg-blue-100 text-blue-600", label: "Blue" },
  { value: "bg-purple-100 text-purple-600", label: "Purple" },
  { value: "bg-green-100 text-green-600", label: "Green" },
  { value: "bg-pink-100 text-pink-600", label: "Pink" },
  { value: "bg-orange-100 text-orange-600", label: "Orange" },
];

export default function AdminHeroPage() {
  const { user, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user || user.role !== "admin") return;

    fetchHeroContent();
  }, [user, isInitialized]);

  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hero");
      setHeroData(response.data?.data);
    } catch (error) {
      console.error("Error fetching hero:", error);
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!heroData?._id) return;

    setSaving(true);
    try {
      const response = await api.put(`/hero/${heroData._id}`, heroData);
      if (response.data?.success) {
        toast.success("Hero content updated successfully");
        fetchHeroContent();
      }
    } catch (error) {
      console.error("Error updating hero:", error);
      toast.error(error.response?.data?.message || "Failed to update hero content");
    } finally {
      setSaving(false);
    }
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...heroData.steps];
    updatedSteps[index][field] = value;
    setHeroData({ ...heroData, steps: updatedSteps });
  };

  const addStep = () => {
    const newStep = {
      title: "New Step",
      description: "Step description",
      icon: "ShoppingBag",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    };
    setHeroData({ ...heroData, steps: [...heroData.steps, newStep] });
  };

  const removeStep = (index) => {
    const updatedSteps = heroData.steps.filter((_, i) => i !== index);
    setHeroData({ ...heroData, steps: updatedSteps });
  };

  if (loading) {
    return <Loader text="Loading..." size={50} fullScreen />;
  }

  if (!heroData) {
    return (
      <div className="flex-1 w-full p-8">
        <div className="text-center text-red-600">Failed to load hero content</div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-3">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hero Section Editor</h1>
            <p className="text-gray-500 mt-1">Manage homepage hero content</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchHeroContent}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Main Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={heroData.buttonText}
                  onChange={(e) => setHeroData({ ...heroData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                <input
                  type="text"
                  value={heroData.secondaryButtonText}
                  onChange={(e) => setHeroData({ ...heroData, secondaryButtonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={heroData.imageUrl}
                onChange={(e) => setHeroData({ ...heroData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-gray-500 mt-1">Path to image in public folder or external URL</p>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Steps</h2>
            <button
              onClick={addStep}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Plus size={16} />
              Add Step
            </button>
          </div>

          <div className="space-y-4">
            {heroData.steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">Step {index + 1}</h3>
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select
                      value={step.icon}
                      onChange={(e) => handleStepChange(index, "icon", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {iconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
                    <select
                      value={`${step.bgColor} ${step.iconColor}`}
                      onChange={(e) => {
                        const [bgColor, iconColor] = e.target.value.split(" ");
                        handleStepChange(index, "bgColor", bgColor);
                        handleStepChange(index, "iconColor", iconColor);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {colorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}