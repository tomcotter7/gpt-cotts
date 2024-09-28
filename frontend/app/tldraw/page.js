"use client"

import { useState, useEffect } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { useSession } from 'next-auth/react'


export default function TlDraw() {
    
    const [adjustedHeight, setAdjustedHeight] = useState('93vh')
    const { data: session, status } = useSession()

    useEffect(() => {
        const nav = document.getElementById('nav')
        if (nav) {
          const vh = (nav.offsetHeight / screen.height) * 100
          setAdjustedHeight((95 - vh) + 'vh')
        }

    }, [])

    if (status === "loading") {
        return null
    }

    return (
        <div className="tldraw__editor m-1" style={{"height": adjustedHeight}}>
			<Tldraw persistenceKey={session.user.email} />
		</div>
	)
}
