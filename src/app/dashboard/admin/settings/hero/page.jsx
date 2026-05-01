"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/shared/Loader";
import { 
  Save, RefreshCw, Plus, Trash2, Eye, X, 
  ShoppingBag, QrCode, Scan, Home, Heart, Star,
  ChevronRight, Sparkles, CheckCircle, Target, List, Upload
} from "lucide-react";
import AdminHeroCustomSelect from "@/components/admin/adminheropage/AdminHeroCustomSelect";
import Image from "next/image";

// Icon options for select
const iconOptions = [
  { value: "ShoppingBag", label: "Shopping Bag", icon: <ShoppingBag size={18} />, component: ShoppingBag },
  { value: "QrCode", label: "QR Code", icon: <QrCode size={18} />, component: QrCode },
  { value: "Scan", label: "Scan", icon: <Scan size={18} />, component: Scan },
  { value: "Home", label: "Home", icon: <Home size={18} />, component: Home },
  { value: "Heart", label: "Heart", icon: <Heart size={18} />, component: Heart },
  { value: "Star", label: "Star", icon: <Star size={18} />, component: Star },
];

// Color options for select
const colorOptions = [
  { value: "bg-blue-100 text-blue-600", label: "Blue", bgColor: "bg-blue-100", iconColor: "text-blue-600" },
  { value: "bg-purple-100 text-purple-600", label: "Purple", bgColor: "bg-purple-100", iconColor: "text-purple-600" },
  { value: "bg-green-100 text-green-600", label: "Green", bgColor: "bg-green-100", iconColor: "text-green-600" },
  { value: "bg-pink-100 text-pink-600", label: "Pink", bgColor: "bg-pink-100", iconColor: "text-pink-600" },
  { value: "bg-orange-100 text-orange-600", label: "Orange", bgColor: "bg-orange-100", iconColor: "text-orange-600" },
  { value: "bg-indigo-100 text-indigo-600", label: "Indigo", bgColor: "bg-indigo-100", iconColor: "text-indigo-600" },
  { value: "bg-rose-100 text-rose-600", label: "Rose", bgColor: "bg-rose-100", iconColor: "text-rose-600" },
  { value: "bg-teal-100 text-teal-600", label: "Teal", bgColor: "bg-teal-100", iconColor: "text-teal-600" },
];

export default function AdminHeroPage() {
  const { user, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user || user.role !== "admin") return;
    fetchHeroContent();
  }, [user, isInitialized]);

  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hero");
      const data = response.data?.data;
      
      if (data && data.steps) {
        setHeroData(data);
      } else {
        setHeroData({
          title: "CREATE YOUR STORY IN A KEYCHAIN",
          subtitle: "Every keychain carries a hidden message of hope, love, or joy — revealed only when scanned.",
          buttonText: "Start Your Story Now",
          secondaryButtonText: "How It Works",
          imageUrl: "/images/hero-image.png",
          steps: [
            { 
              title: "Choose Your Keychain", 
              description: "Select from our premium collection and add an optional gift message.", 
              icon: "ShoppingBag", 
              bgColor: "bg-blue-100", 
              iconColor: "text-blue-600" 
            },
            { 
              title: "Receive Your QR Code", 
              description: "Get a unique QR code engraved on your keychain.", 
              icon: "QrCode", 
              bgColor: "bg-purple-100", 
              iconColor: "text-purple-600" 
            },
            { 
              title: "Scan & Be Inspired", 
              description: "Scan anytime to reveal your personalized motivational quote.", 
              icon: "Scan", 
              bgColor: "bg-green-100", 
              iconColor: "text-green-600" 
            },
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching hero:", error);
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data?.success && response.data?.data?.url) {
        setHeroData({ ...heroData, imageUrl: response.data.data.url });
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    if (!heroData) return;
    setSaving(true);
    try {
      const response = await api.put(`/hero/${heroData._id}`, heroData);
      if (response.data?.success) {
        toast.success("Hero content updated successfully!");
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
    
    if (field === "color") {
      updatedSteps[index].bgColor = value.bgColor;
      updatedSteps[index].iconColor = value.iconColor;
    } else if (field === "icon") {
      updatedSteps[index].icon = value.value;
    } else {
      updatedSteps[index][field] = value;
    }
    
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
    toast.success("New step added");
  };

  const removeStep = (index) => {
    const updatedSteps = heroData.steps.filter((_, i) => i !== index);
    setHeroData({ ...heroData, steps: updatedSteps });
    toast.success("Step removed");
  };

  const getIconComponent = (iconName) => {
    const icon = iconOptions.find(i => i.value === iconName);
    return icon?.component || ShoppingBag;
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
    <div className="flex-1 w-full min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hero Section Editor</h1>
            <p className="text-gray-500 mt-1">Manage homepage hero content in real-time</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchHeroContent}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
            >
              <Eye size={18} />
              Full Preview
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE - EDITOR FORMS */}
        <div className="space-y-6">
          {/* Main Content Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={20} />
              Hero Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent cursor-text"
                  placeholder="Enter main title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none cursor-text"
                  placeholder="Enter subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.buttonText}
                    onChange={(e) => setHeroData({ ...heroData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.secondaryButtonText}
                    onChange={(e) => setHeroData({ ...heroData, secondaryButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black cursor-text"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Image
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="hero-image-upload"
                      />
                      <label
                        htmlFor="hero-image-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition bg-gray-50 cursor-pointer"
                      >
                        <Upload size={18} />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: JPG, PNG, GIF, WEBP (Max 5MB)
                    </p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={heroData.imageUrl}
                      onChange={(e) => setHeroData({ ...heroData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black cursor-text"
                      placeholder="Or paste image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload or paste URL directly
                    </p>
                  </div>
                </div>
                
                {/* Image Preview */}
                {heroData.imageUrl && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={heroData.imageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <List size={20} />
                Steps ({heroData.steps.length})
              </h2>
              <button
                onClick={addStep}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {heroData.steps.map((step, index) => {
                const IconComp = getIconComponent(step.icon);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${step.bgColor} ${step.iconColor} rounded-lg flex items-center justify-center`}>
                          <IconComp size={16} />
                        </div>
                        <h3 className="font-medium text-gray-900">Step {index + 1}</h3>
                      </div>
                      {heroData.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black cursor-text"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) => handleStepChange(index, "description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black resize-none cursor-text"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="cursor-pointer">
                          <AdminHeroCustomSelect
                            label="Icon"
                            options={iconOptions}
                            value={step.icon}
                            onChange={(option) => handleStepChange(index, "icon", option)}
                            renderOption={(option) => (
                              <div className="flex items-center gap-2 cursor-pointer">
                                {option.icon}
                                <span>{option.label}</span>
                              </div>
                            )}
                            renderValue={(option) => (
                              <div className="flex items-center gap-2 cursor-pointer">
                                {option?.icon}
                                <span>{option?.label || "Select icon"}</span>
                              </div>
                            )}
                          />
                        </div>

                        <div className="cursor-pointer">
                          <AdminHeroCustomSelect
                            label="Color"
                            options={colorOptions}
                            value={{ bgColor: step.bgColor, iconColor: step.iconColor }}
                            onChange={(option) => handleStepChange(index, "color", option)}
                            renderOption={(option) => (
                              <div className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-6 h-6 ${option.bgColor} rounded-lg`} />
                                <span>{option.label}</span>
                              </div>
                            )}
                            renderValue={(option) => (
                              <div className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-6 h-6 ${option?.bgColor} rounded-lg`} />
                                <span>{option?.label || "Select color"}</span>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - LIVE PREVIEW */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium">Live Preview - Hero Section</span>
              <div className="w-16" />
            </div>

            <div className="p-0">
              {/* Hero Component Preview */}
              <div className="bg-white text-black py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-10">
                  <div className="w-full md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight">
                      {heroData.title}
                    </h1>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                      {heroData.subtitle}
                    </p>
                    <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                      <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition text-sm sm:text-base cursor-pointer">
                        {heroData.buttonText}
                      </button>
                      <button className="px-4 sm:px-6 py-2.5 sm:py-3 border border-black text-black rounded-md font-medium hover:bg-gray-700 hover:text-white transition text-sm sm:text-base cursor-pointer">
                        {heroData.secondaryButtonText}
                      </button>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 flex justify-center">
                    {heroData.imageUrl && (
                      <div className="relative w-full max-w-md">
                        <img
                          src={heroData.imageUrl}
                          alt="Hero"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Steps Preview */}
              <div className="border-t border-gray-100 pt-6 pb-8 px-4 bg-gray-50">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <Sparkles size={20} className="text-gray-600" />
                    How It Works
                  </h3>
                  <p className="text-gray-500 text-sm">Three simple steps to carry inspiration wherever you go</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {heroData.steps.map((step, idx) => {
                    const IconComp = getIconComponent(step.icon);
                    return (
                      <div key={idx} className="text-center group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition bg-white cursor-default">
                        <div className="relative mb-3">
                          <div className={`w-14 h-14 mx-auto ${step.bgColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition`}>
                            <IconComp size={24} className={step.iconColor} />
                          </div>
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {!isMobile && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-gray-100 rounded-full p-2">
                        <CheckCircle size={20} className="text-gray-600" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mt-4">
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm cursor-pointer">
                    {heroData.buttonText}
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This preview exactly matches your website's Hero component
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Full Page Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-0">
              <div className="bg-white text-black py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
                  <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight">
                      {heroData.title}
                    </h1>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {heroData.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <button className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium cursor-pointer">
                        {heroData.buttonText}
                      </button>
                      <button className="px-6 py-3 border border-black text-black rounded-md font-medium cursor-pointer">
                        {heroData.secondaryButtonText}
                      </button>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    {heroData.imageUrl && (
                      <img src={heroData.imageUrl} alt="Hero" className="w-full h-auto" />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 pb-12 px-4 bg-gray-50">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
                  <p className="text-gray-500">Three simple steps to carry inspiration wherever you go</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {heroData.steps.map((step, idx) => {
                    const IconComp = getIconComponent(step.icon);
                    return (
                      <div key={idx} className="text-center border border-gray-200 rounded-2xl p-6 bg-white cursor-default">
                        <div className="relative mb-4">
                          <div className={`w-16 h-16 mx-auto ${step.bgColor} rounded-2xl flex items-center justify-center`}>
                            <IconComp size={28} className={step.iconColor} />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-500 text-sm">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-8">
                  <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium cursor-pointer">
                    {heroData.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}