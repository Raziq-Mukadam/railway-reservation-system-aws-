import React from 'react'
import Hero from '../components/Hero'

export default function Home(){
  return (
    <div className="space-y-8">
      <Hero />
      
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Why Choose RailConnect?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-200">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Fast Search</h3>
            <p className="text-gray-600">Find trains quickly with flexible filters and instant results powered by AWS Lambda.</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-200">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Secure Booking</h3>
            <p className="text-gray-600">Simple booking flow with PNR generation and secure data storage in DynamoDB.</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-200">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Manage Bookings</h3>
            <p className="text-gray-600">View and cancel bookings anytime from the My Bookings page with real-time updates.</p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">🎯 Built with AWS Cloud</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">☁️</div>
              <p className="font-semibold">S3 Hosting</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-semibold">Lambda Functions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🗄️</div>
              <p className="font-semibold">DynamoDB</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🌐</div>
              <p className="font-semibold">API Gateway</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
