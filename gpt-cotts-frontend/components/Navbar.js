import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav id="nav" className="bg-fuchsia-500">
      <div className="flex flex-row gap-4 p-4">
        <div className="flex-col">
          <Image src="/imgs/for_valued_member.png" alt="logo" width="125" height="125" />
          <p className="text-sm">skill issues? use me.</p>
        </div>
        <Link className="bg-gray-400 hover:bg-gray-300 rounded p-2 text-center mt-4 mb-1 max-h-10" href="/"><b>Home</b></Link>
        <Link className="bg-gray-400 hover:bg-gray-300 rounded p-2 text-center mt-4 mb-1 max-h-10" href="/notes"><b>Notes</b></Link>
      </div>
    </nav>
  )
}
