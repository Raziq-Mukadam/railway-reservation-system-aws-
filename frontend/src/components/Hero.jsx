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
    <section className="hero-bg rounded-lg overflow-hidden shadow-md">
      <div className="container mx-auto px-4 py-20 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find and Book Trains Easily</h1>
        <p className="mb-6 max-w-2xl">Search trains by route and date, compare fares, and book in a few clicks.</p>

        <form onSubmit={onSearch} className="bg-white bg-opacity-10 p-4 rounded flex flex-col md:flex-row gap-3 max-w-4xl">
          <input className="flex-1 p-3 rounded bg-white/90 text-black" placeholder="From (e.g., Delhi, Mumbai)" value={from} onChange={e=>setFrom(e.target.value)} required />
          <input className="flex-1 p-3 rounded bg-white/90 text-black" placeholder="To (e.g., Bangalore, Chennai)" value={to} onChange={e=>setTo(e.target.value)} required />
          <input type="date" className="p-3 rounded bg-white/90 text-black" value={date} onChange={e=>setDate(e.target.value)} min={today} required />
          <button className="px-6 py-3 bg-indigo-600 rounded text-white font-semibold" type="submit">Search Trains</button>
        </form>
      </div>
    </section>
  )
}
