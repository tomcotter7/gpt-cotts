"use client";
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Navbar() {
  
  function onLoginButtonClicked() {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`).then((res) => {
      window.location = res.data.url;
    })
  }
  
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token') != null) {
      setLoggedIn(true)
    }
  }, [])


  return (
    <nav id="nav" className="bg-skyblue">
      <div className="flex flex-row gap-4 p-4">
        <div className="flex-col">
          <Image src="/imgs/for_valued_member.png" alt="logo" width="125" height="125" />
          <p className="text-sm text-black">skill issues? use me.</p>
        </div>
        <Link className="bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black mt-4 mb-1 max-h-10" href="/"><b>Home</b></Link>
        <Link className="bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black mt-4 mb-1 max-h-10" href="/notes"><b>Notes</b></Link>
        { loggedIn ? <div className="absolute right-6 bg-tangerine rounded p-2 text-center text-black m-4 max-h-10"> <b>{localStorage.getItem('initials')}</b> </div> : <button className="absolute right-6 m-4 bg-tangerine hover:tangerine-dark rounded p-2 text-center text-black max-h-10" onClick={onLoginButtonClicked}><b>Login</b></button> }
      </div>
    </nav>
  )
}
