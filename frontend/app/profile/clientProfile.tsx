"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { ClipLoader } from "react-spinners";

import { ShowIcon, HideIcon } from '@/components/Icons'

interface Usage {
    admin: boolean
    available_credits: number
    total_input_tokens: number
    total_output_tokens: number
}

export default function ClientProfile() {

    const {data: session, status} = useSession()
    const [usage, setUsage] = useState<Usage>()
    const [detailsOpen, setDetailsOpen] = useState(false)

    
    useEffect(() => {
        async function getUsageData() {
            if (!session) {
                return
            }
        
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_data/usage`, requestOptions)
            const usage: Usage = await response.json()
            setUsage(usage)
        }
        getUsageData()
    }, [status])

    if (status === "loading" || usage === undefined) {
        return <ClipLoader className="text-tangerine" />
    } else {
        return (
            <div className="text-black my-2 flex flex-col items-center">
                <hr className="border-black pb-2" />
                <p> Available Credits: <b>{usage?.admin ? "Admin" :  "$" + usage?.available_credits} </b> </p>
                <button
                    className="bg-tangerine hover:bg-tangerine-dark hover:border-tangerine text-black p-2 mt-2 rounded-md"
                    onClick={() => setDetailsOpen(!detailsOpen)}>
                    { detailsOpen ? <HideIcon /> : <ShowIcon /> }
                </button>
                { detailsOpen ? 
                    <div className="mt-6 border border-black p-2">
                        <p> Total Input Tokens: <b> {usage?.total_input_tokens} </b> </p>
                        <p> Total Output Tokens: <b> {usage?.total_output_tokens} </b> </p>
                    </div>
                : null }
            </div>
        )
    }
}
