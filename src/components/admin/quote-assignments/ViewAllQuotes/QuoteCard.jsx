"use client";

import { Edit, Trash2, Eye, Smartphone } from "lucide-react";

export default function QuoteCard({ quote, onEdit, onDelete, onPreview }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {quote.image?.url && (
        <div className="h-32 overflow-hidden">
          <img
            src={quote.image.url}
            alt={quote.text}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4">
        {/* Quote Text */}
        <p className="text-gray-900 text-sm mb-3 line-clamp-3 italic">
          "{quote.text}"
        </p>
        
        {/* Author & Category */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quote.author && quote.author !== "InspireTag" && (
            <span className="text-xs text-gray-500">— {quote.author}</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            quote.category === 'faith' ? 'bg-purple-100 text-purple-700' :
            quote.category === 'love' ? 'bg-pink-100 text-pink-700' :
            quote.category === 'hope' ? 'bg-green-100 text-green-700' :
            quote.category === 'success' ? 'bg-blue-100 text-blue-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {quote.category}
          </span>
          {!quote.allowReuse && (
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              One-time use
            </span>
          )}
          {!quote.isActive && (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              Inactive
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onPreview}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
            title="Mobile Preview"
          >
            <Smartphone size={16} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition cursor-pointer"
            title="Edit quote"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
            title="Delete quote"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}