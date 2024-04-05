"use client";
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { StopSign } from '@/utils/svgs'

const LoginLink = () => {

    return (
        <Link className="absolute right-6 m-1 bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black max-h-10" href="/auth">
            <div className="flex flex-col">
                <b>go to login page</b>
            </div>
        </Link>
    )
}

const ProfileButton = ({ onClick }) => {

    return (
        <button
            className="absolute right-6 m-1 bg-spearmint hover:bg-spearmint-dark rounded p-2 text-center text-black"
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <b>{localStorage.getItem('username')}</b>
                </div>
            </div>
        </button>
    )
}

export default function Navbar() {
  
  function onLoginButtonClicked() {
      window.history.pushState({}, '', '/auth');
  }
    
    function onLogoutButtonClicked() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = '/';
    }
  
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('authToken') !== null) {
        setLoggedIn(true)
    }
  }, [])


  return (
    <nav id="nav" className="bg-skyblue">
      <div className="flex flex-row gap-4 p-1">
        <div className="flex flex-col items-center">
          <Image src="/imgs/for_valued_member.png" alt="logo" width="75" height="75"/>
          <p className="text-sm text-black">skill issues? use me.</p>
        </div>
        { loggedIn ? <Link className="bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black mt-1 mb-1 max-h-10" href="/"><b>home</b></Link> : <span className="bg-gray rounded p-2 text-center text-white mt-1 mb-1 max-h-10">home</span> }
      { loggedIn ? <Link className="bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black mt-1 mb-1 max-h-10" href="/notes"><b>notes</b></Link> : <span className="bg-gray rounded p-2 text-center text-white mt-1 mb-1 max-h-10">notes</span> }
        { loggedIn ? <ProfileButton onClick={() => onLogoutButtonClicked()} /> : <LoginLink /> }
      </div>
    </nav>
  )
}
