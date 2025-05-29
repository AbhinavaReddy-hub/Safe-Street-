import React, { useState } from 'react';
import { MapPin, Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

function RecentCard({ prediction }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          text: 'text-red-600',
          border: 'border-red-200',
          glow: 'shadow-red-100'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          text: 'text-amber-600',
          border: 'border-amber-200',
          glow: 'shadow-amber-100'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          glow: 'shadow-emerald-100'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-200',
          glow: 'shadow-gray-100'
        };
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'medium':
        return <Clock size={16} className="text-amber-600" />;
      case 'low':
        return <CheckCircle size={16} className="text-emerald-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const severityColors = getSeverityColor(prediction.severity);
  const confidenceScore = prediction.severity_score || prediction.confidenceScore || 0;

  return (
    <div className="group w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      {/* Image Section with Overlay */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
        <img 
          className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={prediction.src} 
          alt="road damage" 
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        {/* Severity Badge - Floating */}
        <div className="absolute top-3 right-3 z-20">
          <div className={`${severityColors.bg} ${severityColors.glow} shadow-lg px-3 py-1.5 rounded-full text-white text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm`}>
            {getSeverityIcon(prediction.severity)}
            <span className="capitalize">{prediction.severity}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-amber-800 transition-colors duration-200">
            {prediction.title}
          </h3>
        </div>

        {/* Meta Information */}
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <MapPin size={16} className="text-amber-700" />
            </div>
            <span className="text-sm font-medium truncate">{prediction.location}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Calendar size={16} className="text-amber-800" />
            </div>
            <span className="text-sm font-medium">{formatDate(prediction.timestamp)}</span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-800" />
              <span className="text-sm font-semibold text-gray-700">Priority</span>
            </div>
            <span className="text-sm font-bold text-amber-800">{(confidenceScore)}</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                confidenceScore >=8
                  ? 'bg-gradient-to-r from-red-400 to-red-600'
                  : confidenceScore>=5 && confidenceScore<8
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{ width: `${confidenceScore * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-700 rounded-full"></div>
            Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {prediction.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecentCard;