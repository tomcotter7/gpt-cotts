"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const LoginLink = ({ status }: { status: string }) => {
  if (status === "loading") {
    return <span className="text-gray py-1 px-2 text-center my-1 max-h-10 rounded">login</span>
  }

  return (
    <Link
      className="relative inline-flex h-8 m-2 justify-center items-center px-4 mx-1 text-black before:absolute  before:z-1 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
      href="/api/auth/signin/google">
      <div className="flex flex-col z-[10]">
        <b>login</b>
      </div>
    </Link>
  )
}

const ProfileButton = () => {
  return (
    <Link
      href="/profile"
    >
      <div className="flex flex-col m-1 p-1">
        <div className="flex flex-row">
          <div className="relative inline-flex h-8 justify-center items-center px-4 mx-1 text-black before:absolute  before:z-1 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
          >
            <Image
              className="z-[10]"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5klEQVR4nO2Tvw7BUByFP5FglGBBZw/Bzs5reAbPU5F0QryBXRMGBmaExsJCmpwmzQ0NccXSLzlDf3/OaXNvIcUSDjACAskDGjbND8Dd0FG9rxnJcAzUpYlqQxsBgcxC4whHtfOvA042AjyZTWQcaqqaayOgoQM1D3lvfNVXODrQs+TaNE95SRZoAQOg/KRfUa+p2bcpAH1gF7sxa6ALFKUesIn1t9oJdxOpAb5h7D+5opF8zUTPC6CaFDDT4BJoAxkgr7ebAxdprlpOMx1gpd3wJ3zJTUMlPqek3WvS0N2S/heQgskDvs9xQtZ6LkgAAAAASUVORK5CYII="
              alt="Profile"
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Navbar() {

  const { data: session, status } = useSession()
  void session;
  const [isNavOpen, setIsNavOpen] = useState(false)
  const validLinkTailwind = 'text-black hover:text-tangerine-light text-center py-1 px-2 max-h-10 shadow-xs'
  const invalidLinkTailwind = 'text-gray py-1 px-2 text-center max-h-10'

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  }

  return (
    <nav id="nav" className="flex-no-wrap relative flex w-full bg-skyblue">
      <div className="flex w-full flex-wrap items-center justify-between px-3">
        <button
          className="block border-0 bg-transparent md:hidden"
          type="button"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={toggleNav}
        >
          <span className="[&>svg]:w-7 [&>svg]:stroke-black/50 dark:[&>svg]:stroke-neutral-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd" />
            </svg>
          </span>
        </button>
        <div className="relative flex items-center md:hidden">
          {status === 'authenticated' ? <ProfileButton /> : <LoginLink status={status} />}
        </div>
        <div id="navContent" className={`${isNavOpen ? 'block pb-2' : 'hidden'} flex-grow basis-[100%] items-center md:!flex md:basis-auto`}>
          <div className="flex flex-col mr-2 mb-2 md:mb-0">
            <Image src="/imgs/for_valued_member.png" alt="logo" width="50" height="50" />
          </div>
          <ul
            className="list-style-none flex flex-col md:flex-row"
            data-twe-navbar-nav-ref
          >
            <li className="md:mb-0" data-twe-nav-item-ref>
              {status === 'authenticated' ? <Link className={validLinkTailwind} href="/">home</Link> : <span className={invalidLinkTailwind}>home</span>}
            </li>
            <li className="md:mb-0" data-twe-nav-item-ref>
              {status === 'authenticated' ? <Link className={validLinkTailwind} href="/notes">notes</Link> : <span className={invalidLinkTailwind}>notes</span>}
            </li>
            <li className="md:mb-0" data-twe-nav-item-ref>
              {status === 'authenticated' ? <Link className={validLinkTailwind} href="/tldraw">tldraw</Link> : <span className={invalidLinkTailwind}>tldraw</span>}
            </li>
            <li className="md:mb-0" data-twe-nav-item-ref>
              <Link className={validLinkTailwind} href="/userguide">userguide</Link>
            </li>
          </ul>
        </div>
        <div className="relative flex items-center hidden md:flex">
          {status === 'authenticated' ? <ProfileButton /> : <LoginLink status={status} />}
        </div>
      </div>
    </nav>
  )


}

