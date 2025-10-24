import React from 'react'

export default function TrainCard({train, onBook}){
  return (
    <div className="bg-white rounded shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
      <div>
        <div className="text-lg font-semibold">{train.name}</div>
        <div className="text-sm text-gray-500">No: {train.number}</div>
      </div>
      <div>
        <div className="font-medium">{train.departure}</div>
        <div className="text-sm text-gray-500">{train.arrival}</div>
      </div>
      <div className="text-sm text-gray-600">Duration: {train.duration}<br/>Seats: {train.seats}</div>
      <div className="flex items-center justify-end space-x-3">
        <div className="text-xl font-bold text-indigo-600">₹{train.fare}</div>
        <button onClick={()=>onBook(train)} className="px-4 py-2 bg-indigo-600 text-white rounded">Book Now</button>
      </div>
    </div>
  )
}
