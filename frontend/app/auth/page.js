"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Auth() {

  //const params = useSearchParams()
  const [auth, setAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  function validatesParams() {
    const data = {
      "state": params.get('state'),
      "code": params.get('code'),
      "scope": params.get('scope'),
      "authuser": params.get('authuser'),
      "prompt": params.get('prompt')
    }
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, data).then((res) => {
      
      const token = res.data.access_token
      localStorage.setItem('token', token)
      localStorage.setItem('initials', res.data.initials)
      setAuth(true)

    })
  }

  useEffect(() => {
    validatesParams()
  }, [])

  useEffect(() => {
    if (auth) {
      window.location = '/'
    }
  }, [auth])

  if (!auth) {
    return (
      <div className="flex flex-col items-center">
        <h1>Authenticating...</h1>
      </div>
    )
  }

  else {
    return (
      <div className="flex flex-col items-center">
        <h1>Authenticated! Redirecting to home</h1>
      </div>
    )
  }
}

