"use client"

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { useSession } from 'next-auth/react'


export default function TlDraw() {

    const { data: session, status } = useSession()

    if (status === "loading") {
        return null
    }

    return (
        <div className="tldraw__editor" style={{"height": "100vh"}}>
			<Tldraw persistenceKey={session.user.email} />
		</div>
	)
}


