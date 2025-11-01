import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar(){
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-4xl">🚂</span>
          <span>RailConnect</span>
        </Link>
        <div className="space-x-2 hidden md:flex items-center">
          <NavLink 
            to="/" 
            className={({isActive})=> isActive 
              ? 'px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md' 
              : 'px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all'}
          >
            🏠 Home
          </NavLink>
          <NavLink 
            to="/search" 
            className={({isActive})=> isActive 
              ? 'px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md' 
              : 'px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all'}
          >
            🔍 Search Trains
          </NavLink>
          <NavLink 
            to="/bookings" 
            className={({isActive})=> isActive 
              ? 'px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md' 
              : 'px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all'}
          >
            🎫 My Bookings
          </NavLink>
          <NavLink 
            to="/login" 
            className={({isActive})=> isActive 
              ? 'px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md' 
              : 'px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all'}
          >
            👤 Login/Signup
          </NavLink>
        </div>
        <div className="md:hidden">
          <Link to="/search" className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md">
            🔍 Search
          </Link>
        </div>
      </div>
    </nav>
  )
}
