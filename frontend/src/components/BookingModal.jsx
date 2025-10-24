import React, { useState } from 'react'
import { generatePNR } from '../utils/pnr'
import { toast } from 'react-toastify'

export default function BookingModal({train, onClose, onConfirm}){
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [seatPref, setSeatPref] = useState('Lower')
  const fare = train?.fare || 0

  if(!train) return null

  function handleConfirm(e){
    e.preventDefault()
    const pnr = generatePNR()
    const booking = {
      pnr, trainName: train.name, number: train.number, date: train.date || new Date().toISOString().slice(0,10), status: 'Confirmed', passenger: {name, age, gender, seatPref}, fare
    }
    // store to localStorage
    const existing = JSON.parse(localStorage.getItem('bookings')|| '[]')
    existing.unshift(booking)
    localStorage.setItem('bookings', JSON.stringify(existing))
    toast.success(`Booking confirmed — PNR: ${pnr}`)
    onConfirm && onConfirm(booking)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Book: {train.name} ({train.number})</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Passenger Name" className="p-2 border rounded" />
            <input required value={age} onChange={e=>setAge(e.target.value)} placeholder="Age" type="number" className="p-2 border rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={gender} onChange={e=>setGender(e.target.value)} className="p-2 border rounded">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <select value={seatPref} onChange={e=>setSeatPref(e.target.value)} className="p-2 border rounded">
              <option>Lower</option>
              <option>Upper</option>
              <option>Middle</option>
              <option>Side Lower</option>
              <option>Side Upper</option>
            </select>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <div className="flex justify-between"><span>Fare</span><strong>₹{fare}</strong></div>
            <div className="text-sm text-gray-500">Total payable at confirmation</div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>
  )
}
