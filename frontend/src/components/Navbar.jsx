import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar(){
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">RailConnect</Link>
        <div className="space-x-4 hidden md:flex items-center">
          <NavLink to="/" className={({isActive})=> isActive? 'text-indigo-600 font-semibold':'text-gray-600'}>Home</NavLink>
          <NavLink to="/search" className={({isActive})=> isActive? 'text-indigo-600 font-semibold':'text-gray-600'}>Search Trains</NavLink>
          <NavLink to="/bookings" className={({isActive})=> isActive? 'text-indigo-600 font-semibold':'text-gray-600'}>My Bookings</NavLink>
          <NavLink to="/login" className={({isActive})=> isActive? 'text-indigo-600 font-semibold':'text-gray-600'}>Login/Signup</NavLink>
        </div>
        <div className="md:hidden">
          <Link to="/search" className="px-3 py-2 bg-indigo-600 text-white rounded">Search</Link>
        </div>
      </div>
    </nav>
  )
}
