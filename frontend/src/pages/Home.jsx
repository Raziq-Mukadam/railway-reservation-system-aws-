import React from 'react'
import Hero from '../components/Hero'

export default function Home(){
  return (
    <div className="space-y-6">
      <Hero />
      <section>
        <h2 className="text-2xl font-semibold mb-3">Why RailConnect?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow-sm">
            <h3 className="font-semibold">Fast Search</h3>
            <p className="text-sm text-gray-600">Find trains quickly with flexible filters and instant results.</p>
          </div>
          <div className="p-4 bg-white rounded shadow-sm">
            <h3 className="font-semibold">Secure Booking</h3>
            <p className="text-sm text-gray-600">Simple booking flow and PNR generation for your records.</p>
          </div>
          <div className="p-4 bg-white rounded shadow-sm">
            <h3 className="font-semibold">Manage Bookings</h3>
            <p className="text-sm text-gray-600">View and cancel bookings from the My Bookings page.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
