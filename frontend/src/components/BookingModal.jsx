import React, { useState } from 'react'
import { createBooking } from '../utils/api'
import { toast } from 'react-toastify'

export default function BookingModal({train, onClose, onConfirm}){
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [seatPref, setSeatPref] = useState('Lower')
  const [trainClass, setTrainClass] = useState('Sleeper')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMode, setPaymentMode] = useState('') // 'online' or 'offline'
  const [showQR, setShowQR] = useState(false)
  
  // Calculate fare based on base fare and class multiplier
  const baseFare = train?.fare || 0
  const classMultiplier = {
    'Sleeper': 1,
    'AC 3-Tier': 2,
    'AC 2-Tier': 2.5,
    'AC 1-Tier': 3.5,
    'First Class': 4
  }
  const fare = Math.round(baseFare * (classMultiplier[trainClass] || 1))

  if(!train) return null

  async function handlePaymentChoice(mode) {
    // Validate form first
    if (!name || !age) {
      toast.error('Please fill all passenger details')
      return
    }
    
    // Validate travel date is not in the past
    const travelDate = train.date || new Date().toISOString().slice(0,10)
    const today = new Date().toISOString().slice(0,10)
    
    if (travelDate < today) {
      toast.error('Cannot book tickets for past dates. Please search for a future date.')
      return
    }
    
    setPaymentMode(mode)
    
    if (mode === 'online') {
      setShowQR(true)
    } else {
      // Pay offline - book with PENDING status
      await processBooking('PENDING')
    }
  }

  async function processBooking(status = 'CONFIRMED') {
    setLoading(true)
    
    try {
      const bookingData = {
        trainId: train.trainId,
        trainNumber: train.number,
        trainName: train.name,
        from: train.from,
        to: train.to,
        travelDate: train.date || new Date().toISOString().slice(0,10),
        passengerName: name,
        passengerAge: parseInt(age),
        passengerGender: gender,
        seatPreference: seatPref,
        trainClass: trainClass,
        fare: fare,
        paymentStatus: status
      }

      const result = await createBooking(bookingData)
      
      // Send notification if email or phone provided
      if (email || phone) {
        try {
          const notificationData = {
            booking: {
              pnr: result.pnr,
              passengerName: name,
              trainName: train.name,
              trainNumber: train.number,
              from: train.from,
              to: train.to,
              travelDate: train.date || new Date().toISOString().slice(0,10),
              trainClass: trainClass,
              seatPreference: seatPref,
              fare: fare,
              status: status,
              transactionId: result.transactionId
            },
            email: email || undefined,
            phone: phone || undefined
          }
          
          // Send notification (don't wait for it)
          fetch(`${import.meta.env.VITE_API_ENDPOINT}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData)
          }).catch(err => console.log('Notification failed:', err))
        } catch (err) {
          console.log('Notification error:', err)
        }
      }
      
      if (status === 'PENDING') {
        toast.success(`Booking created — PNR: ${result.pnr}. Payment pending!`)
      } else {
        toast.success(`Booking confirmed — PNR: ${result.pnr}`)
      }
      
      onConfirm && onConfirm(result)
      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
      toast.error(error.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleQRPayment() {
    // Simulate payment processing
    setLoading(true)
    setTimeout(async () => {
      await processBooking('CONFIRMED')
    }, 2000)
  }

  // QR Code Payment Screen
  if (showQR) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">Scan QR Code to Pay</h3>
          
          {/* Fake QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="text-white text-6xl font-bold">QR</div>
            </div>
            <div className="mt-3 text-gray-600">
              <p className="font-semibold">Amount: ₹{fare}</p>
              <p className="text-sm">UPI ID: railway@paytm</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">Scan this QR code with any UPI app to complete payment</p>

          <div className="flex gap-2">
            <button 
              onClick={() => { setShowQR(false); setPaymentMode('') }} 
              className="flex-1 px-4 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleQRPayment}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'I Have Paid'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Book: {train.name} ({train.number})</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-sm mb-2">Passenger Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Passenger Name" className="p-2 border rounded" />
              <input required value={age} onChange={e=>setAge(e.target.value)} placeholder="Age" type="number" min="1" max="120" className="p-2 border rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <select value={gender} onChange={e=>setGender(e.target.value)} className="p-2 border rounded">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" className="p-2 border rounded" />
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone with country code (optional, e.g., +919876543210)" className="p-2 border rounded" />
            </div>
            <p className="text-xs text-gray-500 mt-2">📧 Email & 📱 Phone are optional but recommended for booking confirmations</p>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-sm mb-2">Travel Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Class</label>
                <select value={trainClass} onChange={e=>setTrainClass(e.target.value)} className="w-full p-2 border rounded">
                  <option value="Sleeper">Sleeper (1x)</option>
                  <option value="AC 3-Tier">AC 3-Tier (2x)</option>
                  <option value="AC 2-Tier">AC 2-Tier (2.5x)</option>
                  <option value="AC 1-Tier">AC 1-Tier (3.5x)</option>
                  <option value="First Class">First Class (4x)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Seat Preference</label>
                <select value={seatPref} onChange={e=>setSeatPref(e.target.value)} className="w-full p-2 border rounded">
                  <option value="Lower">Lower</option>
                  <option value="Upper">Upper</option>
                  <option value="Middle">Middle</option>
                  <option value="Side Lower">Side Lower</option>
                  <option value="Side Upper">Side Upper</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Fare</span>
              <strong className="text-indigo-600">₹{fare}</strong>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Base: ₹{baseFare} × {trainClass} multiplier
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2">Select Payment Option:</p>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => handlePaymentChoice('offline')} 
                className="flex-1 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 disabled:opacity-50"
                disabled={loading}
              >
                <div className="font-semibold">Pay Offline</div>
                <div className="text-xs">Book now, pay later</div>
              </button>
              <button 
                type="button" 
                onClick={() => handlePaymentChoice('online')} 
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                <div className="font-semibold">Pay Online</div>
                <div className="text-xs">Pay via UPI/Card</div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded" disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
