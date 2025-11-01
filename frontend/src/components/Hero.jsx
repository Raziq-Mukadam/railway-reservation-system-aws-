import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero(){
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const navigate = useNavigate()
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().slice(0, 10)

  function onSearch(e){
    e.preventDefault()
    const params = new URLSearchParams({from,to,date}).toString()
    navigate(`/search?${params}`)
  }

  return (
    <section className="hero-bg rounded-xl overflow-hidden shadow-2xl">
      <div className="container mx-auto px-4 py-24 text-white">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            🚂 Find and Book Trains Easily
          </h1>
          <p className="text-xl mb-2 text-white/90 max-w-2xl mx-auto">
            Search trains by route and date, compare fares, and book in a few clicks.
          </p>
          <p className="text-white/75 text-sm">Powered by AWS Cloud Services</p>
        </div>

        <form onSubmit={onSearch} className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl max-w-5xl mx-auto border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold mb-2 text-white/90">From</label>
              <input 
                className="w-full p-3 rounded-lg bg-white/95 text-black font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                placeholder="e.g., Delhi, Mumbai" 
                value={from} 
                onChange={e=>setFrom(e.target.value)} 
                required 
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-semibold mb-2 text-white/90">To</label>
              <input 
                className="w-full p-3 rounded-lg bg-white/95 text-black font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                placeholder="e.g., Bangalore, Chennai" 
                value={to} 
                onChange={e=>setTo(e.target.value)} 
                required 
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-semibold mb-2 text-white/90">Travel Date</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-lg bg-white/95 text-black font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                value={date} 
                onChange={e=>setDate(e.target.value)} 
                min={today} 
                required 
              />
            </div>
            
            <div className="flex items-end">
              <button 
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                type="submit"
              >
                🔍 Search Trains
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
