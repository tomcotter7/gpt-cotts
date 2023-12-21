import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-fuchsia-500">
      <div className="flex flex-row gap-4 p-4">
        <div className="flex-col">
          <h1 className="text-xl font-bold text-black"><u><b>gpt-cotts</b></u></h1>
          <p className="text-sm text-lime-300">skill issues? use me.</p>
        </div>
        <Link className="bg-gray-400 hover:bg-gray-300 rounded p-2 text-center mt-1 mb-1 " href="/"><b>Home</b></Link>
        <Link className="bg-gray-400 hover:bg-gray-300 rounded p-2 text-center mt-1 mb-1" href="/notes"><b>Notes</b></Link>
      </div>
    </nav>
  )
}
