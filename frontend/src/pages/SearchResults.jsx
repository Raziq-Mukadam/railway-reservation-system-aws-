import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TrainCard from '../components/TrainCard'
import BookingModal from '../components/BookingModal'
import Spinner from '../components/Spinner'

const sampleTrains = [
  {name: 'Express A', number: '12001', departure: '08:00', arrival: '14:00', duration: '6h', fare: 750, seats: 12},
  {name: 'Intercity B', number: '12022', departure: '10:30', arrival: '16:30', duration: '6h', fare: 850, seats: 5},
  {name: 'Nightliner', number: '12033', departure: '22:00', arrival: '06:00', duration: '8h', fare: 600, seats: 20},
]

function useQuery(){
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults(){
  const q = useQuery()
  const [loading, setLoading] = useState(true)
  const [trains, setTrains] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    setLoading(true)
    // simulate search delay
    const t = setTimeout(()=>{
      // In a real app, use params from q to filter
      setTrains(sampleTrains.map(t=> ({...t, date: q.get('date') || new Date().toISOString().slice(0,10)})))
      setLoading(false)
    }, 700)
    return ()=>clearTimeout(t)
  }, [useLocation().search])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Search Results</h2>
      {loading ? <Spinner/> : (
        <div className="space-y-3">
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
