import { useState, useEffect } from 'react'


export default function NotLoggedIn() {
  
  const [email, setEmail] = useState('')

  useEffect(() => {
    const getEmail = async () => {
      const token = localStorage.getItem('token')
      if (token == null) {
        return
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/current_user_email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        },
      })

      const data = await response.json()
      setEmail(data['email'])
    }
    getEmail()
  })


  return (
    <div className="bg-red-500 m-4 rounded border-white text-center">
      <p className="xl:text-4xl md:text-xl text-md"> 
        {email == '' ? 'You are not logged in' : `You are logged in as ${email}, however you don't have access. Please pm us on twitter @_tcotts or @luizayaara to use the beta`}
      </p>
    </div>
  )
}
