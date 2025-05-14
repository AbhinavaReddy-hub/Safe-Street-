import React, { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';

function RecentCard({ prediction }) {


  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
   <div className="w-80 flex flex-col gap-3 items-center bg-amber-700/[10%] px-2 py-2 rounded-xl shadow-2xl">
        <img className='rounded-xl' src={prediction.src} alt="road damage" width={250} height={100} />
        <div className='w-full flex justify-around'>

        <span className="text-md font-medium">{prediction.title}</span>
        <span className={`px-3 py-1 rounded-full text-white text-sm w-fit h-fit ${getSeverityColor(prediction.severity)}`}>
          {prediction.severity}
        </span>
        </div>

      <div className="flex items-center justify-center gap-2">
        <MapPin size={18} color="#6b7280" />
        <span className="text-sm">{prediction.location}</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Calendar size={18} color="#6b7280" />
        <span className="text-sm">{prediction.timestamp.substr(0,10)}</span>
      </div>

      <div className="w-[200px] h-5 mx-auto bg-gray-100 rounded-xl overflow-hidden flex items-center">
        <div
          className="text-white text-center text-sm font-semibold py-1"
          style={{
            width: `${20*(prediction.severity_score)}px`,
            backgroundColor:
              prediction.severity_score >= 8
                ? 'green'
                : prediction.severity_score >= 7
                ? 'yellow'
                : 'red',
          }}
        >
          Confidence: {prediction.severity_score}%
        </div>
      </div>

      <div className='self-start ml-4 '>
        <h3 className="text-xl font-semibold ">Summary</h3>
        <p className="text-base">{prediction.message}</p>
      </div>

    
    </div>
  );
}

export default RecentCard;
