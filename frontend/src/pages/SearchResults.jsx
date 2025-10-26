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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Search Results</h2>
      <p className="text-sm text-gray-600">Found {trains.length} trains</p>
      {loading ? <Spinner/> : (
        <div className="space-y-3">
          {trains.length === 0 && <p className="text-gray-500">No trains found</p>}
          {trains.map(t=> (
            <TrainCard key={t.number} train={t} onBook={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <BookingModal train={selected} onClose={()=>setSelected(null)} onConfirm={(b)=>console.log('booked', b)} />
      )}
    </div>
  )
}
