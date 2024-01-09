"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Auth() {

  const params = useSearchParams()
  const [auth, setAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  function validatesParams() {
    const data = {
      "code": params.get('code'),
      "scope": params.get('scope'),
      "authuser": params.get('authuser'),
      "prompt": params.get('prompt')
    }
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, data).then((res) => {
      if (res.data.error != null) {
        setError(res.data.error)
        setAuth(false)
        return
      }
      
      setUser({email: res.data.email, notes: res.data.notes})
      setAuth(true)
    })
  }

  useEffect(() => {
    validatesParams()
  }, [])
  
  if (!auth && error == null) {
    return (
      <div> Authorizing </div>
    )
  }

  if (error != null) {
    return (
      <div> {error} </div>
    )
  }

  return (
    <div> {user.email} - Your notes are found here: {user.notes} </div>
  )
}

