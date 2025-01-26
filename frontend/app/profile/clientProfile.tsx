"use client";
import { useState } from "react";
import { ShowIcon, HideIcon } from '@/components/Icons'


interface Usage {
  admin: boolean
  available_credits: number
  total_input_tokens: number
  total_output_tokens: number
}

export default function ClientProfile({ admin, available_credits, total_input_tokens, total_output_tokens }: Usage) {

  const [detailsOpen, setDetailsOpen] = useState(false)


  return (
    <div className="text-black my-2 flex flex-col items-center">
      <hr className="border-black pb-2" />
      <div className="flex justify-between items-center bg-skyblue rounded-lg border border-gray-200 shadow-md p-4 m-2 transition-all hover:shadow-lg p-4 w-64">
        <span className="text-gray-600"> Available Credits: </span>
        <span className="font-semibold text-black">{admin ? "Admin" : "$" + available_credits} </span>
      </div>
      <button
        className="relative inline-flex h-8 m-2 justify-center items-center px-4 mx-1 text-black before:absolute before:-z-10 before:inset-0 before:block before:rounded before:bg-tangerine-light before:disabled:opacity-50 before:shadow before:shadow-[0_4px_3px_0_rgba(236,182,109,0.1),inset_0_-5px_0_0_#ecb66d] hover:before:bg-tangerine hover:before:border hover:before:border-tangerine-dark active:border-t-4 active:border-transparent active:py-1 active:before:shadow-none"
        onClick={() => setDetailsOpen(!detailsOpen)}>
        {detailsOpen ? <HideIcon /> : <ShowIcon />}
      </button>
      {detailsOpen ?
        <div className="mt-6 bg-skyblue rounded-lg border border-gray-200 shadow-md p-4 w-64 transition-all hover:shadow-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Input Tokens:</span>
              <span className="font-semibold text-black">{total_input_tokens}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Output Tokens:</span>
              <span className="font-semibold text-black">{total_output_tokens}</span>
            </div>
          </div>
        </div>

        : null}
    </div>
  )
}
