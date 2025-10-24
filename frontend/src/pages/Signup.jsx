import React, { useState } from 'react'
import { toast } from 'react-toastify'

export default function Signup(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    toast.info('Signup placeholder — integrate AWS Cognito here')
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">Signup</button>
          <button type="button" onClick={()=>toast.info('Cognito signup placeholder')} className="text-sm text-gray-500">Signup with Cognito</button>
        </div>
      </form>
    </div>
  )
}
