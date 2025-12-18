'use client'


import { Crown, Heart, Share2, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function QuotePage() {
    const [savedToFavorites, setSavedToFavorites] = useState(false);

    const handleSaveToFavorites = () => {
        setSavedToFavorites(!savedToFavorites);
    };

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
            <div className='max-w-7xl mx-auto w-full bg-[#F4F5F7] rounded-lg py-6'>
                <div className="max-w-4xl mx-auto w-full">
                    {/* Motivation Badge */}
                    <div className="flex justify-center mb-2">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                            <Sparkles size={18} className="text-gray-700" />
                            <span className="text-sm font-medium text-gray-700">Motivation</span>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl p-8 md:p-12 mb-2">
                        {/* Greeting */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                Hello Sarah,
                            </h1>
                            <p className="text-gray-500">Here's your message for today...</p>
                        </div>

                        {/* Quote Section */}
                        <div className="bg-white rounded-xl p-8 border border-gray-300 mb-8">
                            <p className="text-lg md:text-xl text-gray-800 text-center leading-relaxed mb-4">
                                "Happiness can be found even in the darkest of times, if one only remembers to turn on the light."
                            </p>
                            <p className="text-sm text-gray-500 text-center italic">— J.K. Rowling</p>
                        </div>

                        {/* Birthday Message */}
                        <div className="bg-white rounded-xl p-8 border border-gray-300">
                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                                Happy Birthday!
                            </h2>
                            <p className="text-gray-600 text-center italic leading-relaxed">
                                "Wishing you success, good health, and endless achievements in the year ahead. May your journey continue to inspire everyone around you."
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
                            <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all hover:shadow-md active:scale-[0.98]">
                                <Crown size={18} />
                                <span className="text-sm font-medium">Discover Your Archetype</span>
                            </button>

                            <button className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all hover:shadow-md active:scale-[0.98]">
                                <Sparkles size={18} />
                                <span className="text-sm font-medium">Subscribe for Daily Quotes</span>
                            </button>

                            <button
                                onClick={handleSaveToFavorites}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all hover:shadow-md active:scale-[0.98] ${savedToFavorites
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                            >
                                <Heart size={18} className={savedToFavorites ? 'fill-current' : ''} />
                                <span className="text-sm font-medium">
                                    {savedToFavorites ? 'Saved to Favorites' : 'Save to Favorites'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Links */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm mb-4">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group">
                            <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                            <span className="underline">Share this quote</span>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group">
                            <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
                            <span className="underline">Get another keychain</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}