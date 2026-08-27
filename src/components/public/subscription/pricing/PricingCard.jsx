"use client";

import { FaCrown, FaCheck, FaArrowRight, FaSpinner } from "react-icons/fa";
import { FiZap } from "react-icons/fi";
import { PiSparkleFill } from "react-icons/pi";

export default function PricingCard({ 
    title, 
    price, 
    period, 
    description, 
    features, 
    isPopular, 
    buttonText, 
    onSubscribe, 
    loading,
    disabled 
}) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${isPopular ? 'border-2 border-purple-400' : 'border border-gray-200'}`}>
            {isPopular && (
                <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                        <FaCrown size={12} />
                        POPULAR
                    </div>
                </div>
            )}

            <div className={`p-6 text-center ${isPopular ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'} border-b border-gray-200`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`}>
                    {isPopular ? (
                        <FaCrown size={28} className="text-white" />
                    ) : (
                        <PiSparkleFill size={28} className="text-gray-500" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>

            <div className="p-6">
                <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">{price}</span>
                    <span className="text-gray-500">/{period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-600">
                            <FaCheck size={16} className="text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={onSubscribe}
                    disabled={disabled || loading}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <FaSpinner size={16} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {buttonText}
                            {isPopular && <FaArrowRight size={14} />}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}