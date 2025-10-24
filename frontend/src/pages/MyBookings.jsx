import React, { useEffect, useState } from 'react'

export default function MyBookings(){
  const [bookings, setBookings] = useState([])

  useEffect(()=>{
    setBookings(JSON.parse(localStorage.getItem('bookings') || '[]'))
  }, [])

  function cancel(pnr){
    const updated = bookings.map(b=> b.pnr===pnr? {...b, status: 'Cancelled'}: b)
    setBookings(updated)
    localStorage.setItem('bookings', JSON.stringify(updated))
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {bookings.length===0 ? (
        <div className="p-6 bg-white rounded shadow-sm text-gray-600">No bookings yet.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">PNR</th>
                <th className="text-left p-3">Train</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b=> (
                <tr key={b.pnr} className="border-t">
                  <td className="p-3 font-mono text-sm">{b.pnr}</td>
                  <td className="p-3">{b.trainName}</td>
                  <td className="p-3">{b.date}</td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3">
                    {b.status!=='Cancelled' && (
                      <button onClick={()=>cancel(b.pnr)} className="px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
