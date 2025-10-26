import React, { useEffect, useState } from 'react'
import { getBookings, cancelBooking } from '../utils/api'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'

export default function MyBookings(){
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function fetchBookings() {
      try {
        const data = await getBookings()
        setBookings(data)
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [])

  async function cancel(pnr){
    try {
      await cancelBooking(pnr)
      const updated = bookings.map(b=> b.pnr===pnr? {...b, status: 'CANCELLED'}: b)
      setBookings(updated)
      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {loading ? (
        <Spinner />
      ) : bookings.length===0 ? (
        <div className="p-6 bg-white rounded shadow-sm text-gray-600">No bookings yet.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">PNR</th>
                <th className="text-left p-3">Passenger Name</th>
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
                  <td className="p-3">{b.passengerName}</td>
                  <td className="p-3">{b.trainName}</td>
                  <td className="p-3">{b.travelDate || b.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {b.status}
                    </span>
                    {b.status === 'PENDING' && <span className="ml-2 text-xs text-yellow-600">Payment Remaining</span>}
                  </td>
                  <td className="p-3">
                    {b.status!=='CANCELLED' && (
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
