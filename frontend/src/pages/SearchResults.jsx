import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TrainCard from '../components/TrainCard'
import BookingModal from '../components/BookingModal'
import Spinner from '../components/Spinner'
import { searchTrains } from '../utils/api'
import { toast } from 'react-toastify'

function useQuery(){
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults(){
  const q = useQuery()
  const [loading, setLoading] = useState(true)
  const [trains, setTrains] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    async function fetchTrains() {
      setLoading(true)
      try {
        const from = q.get('from')
        const to = q.get('to')
        const date = q.get('date') || new Date().toISOString().slice(0,10)
        
        if (!from || !to) {
          toast.error('Please specify departure and arrival stations')
          setLoading(false)
          return
        }

        const results = await searchTrains(from, to, date)
        console.log('API Response:', results)
        console.log('Setting trains:', results)
        setTrains(results)
      } catch (error) {
        console.error('Failed to search trains:', error)
        toast.error('Failed to search trains. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrains()
  }, [useLocation().search])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🔍 Search Results</h2>
        <p className="text-indigo-100">
          Found <span className="font-bold text-2xl">{trains.length}</span> trains for your journey
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner/>
          <p className="mt-4 text-gray-600">Searching for available trains...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trains.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">🚂</div>
              <p className="text-xl text-gray-600 mb-2">No trains found</p>
              <p className="text-gray-500">Try searching for a different route or date</p>
            </div>
          ) : (
            trains.map(t=> (
              <TrainCard key={t.number} train={t} onBook={setSelected} />
            ))
          )}
        </div>
      )}

      {selected && (
        <BookingModal train={selected} onClose={()=>setSelected(null)} onConfirm={(b)=>console.log('booked', b)} />
      )}
    </div>
  )
}
