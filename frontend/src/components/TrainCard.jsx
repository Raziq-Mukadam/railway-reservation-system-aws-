import React from 'react'

export default function TrainCard({train, onBook}){
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚂</span>
            <h3 className="text-xl font-bold text-gray-800">{train.name}</h3>
          </div>
          <p className="text-sm text-gray-500 font-mono bg-gray-50 inline-block px-2 py-1 rounded">{train.number}</p>
        </div>
        <div className="text-right">
          <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg shadow-md">
            ₹{train.fare}
          </div>
          <p className="text-xs text-gray-500 mt-1">Base fare</p>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600 mb-1">From</p>
            <p className="font-bold text-gray-800 text-lg">{train.from}</p>
            <p className="text-sm text-indigo-600 font-semibold mt-1">{train.departure}</p>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <div className="text-gray-400 text-2xl">→</div>
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded mt-1 whitespace-nowrap">
              {train.duration}
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600 mb-1">To</p>
            <p className="font-bold text-gray-800 text-lg">{train.to}</p>
            <p className="text-sm text-indigo-600 font-semibold mt-1">{train.arrival}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">💺</span>
          <span className={`text-sm font-semibold ${train.seats < 10 ? 'text-red-600' : train.seats < 30 ? 'text-orange-600' : 'text-green-600'}`}>
            {train.seats} seats
          </span>
          <span className="text-xs text-gray-500">available</span>
        </div>
        <button 
          onClick={()=>onBook(train)} 
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Book Now →
        </button>
      </div>
    </div>
  )
}
