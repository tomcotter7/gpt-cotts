"use client";
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios';

const LoginLink = () => {

    return (
        <Link className="absolute right-6 m-1 bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black max-h-10" href="/api/auth/signin/google">
            <div className="flex flex-col">
                <b>go to login page</b>
            </div>
        </Link>
    )
}

const ProfileButton = ({ onClick, username }) => {

    return (
        <button
            className="absolute right-6 m-1 bg-spearmint hover:bg-spearmint-dark rounded p-2 text-center text-black"
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <b>{username}</b>
                </div>
            </div>
        </button>
    )
}

export default function Navbar() {

    const { data: session, status } = useSession()
    const validLinkTailwind = 'bg-tangerine hover:bg-tangerine-dark rounded p-2 text-center text-black mt-1 mb-1 max-h-10'
    const invalidLinkTailwind = 'bg-gray rounded p-2 text-center text-white mt-1 mb-1 max-h-10'
    
    function onLogoutButtonClicked() {
        window.location.href = '/api/auth/signout/google';
    }

    return (
        <nav id="nav" className="bg-skyblue">
            <div className="flex flex-row gap-4 p-1">
                <div className="flex flex-col items-center">
                    <Image src="/imgs/for_valued_member.png" alt="logo" width="75" height="75"/>
                    <p className="text-sm text-black">skill issues? use me.</p>
                </div>
            { status === 'authenticated' ? <Link className={validLinkTailwind} href="/"><b>home</b></Link> : <span className={invalidLinkTailwind}>home</span> }
            { status === 'authenticated' ? <Link className={validLinkTailwind} href="/notes"><b>notes</b></Link> : <span className={invalidLinkTailwind}>notes</span> }
            { status === 'authenticated' ? <ProfileButton onClick={() => onLogoutButtonClicked()} username={session.user?.name} /> : <LoginLink /> }
            </div>
        </nav>
    )
}
