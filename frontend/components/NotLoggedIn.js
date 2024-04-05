import { useState, useEffect } from 'react'


export default function NotLoggedIn() {

    return (
        <div className="flex flex-col text-center items-center">
            <p className="text-6xl m-4 text-spearmint"><b> not logged in :(</b> </p>
            <p className="text-xl text-black"> log into to continue to gpt-cotts </p>
            <p className="text-red-400">
                <b>pm us (tcotts / luizayaara) on twitter for access</b>
            </p>
        </div>
    )
  
}
