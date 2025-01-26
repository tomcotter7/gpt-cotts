"use client";
import { ClipLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex flex-col items-center mt-6 min-h-96">
      <h1 className="text-tangerine text-5xl font-bold mb-8 mt-2 text-center">Notes</h1>
      <ClipLoader color="#fcbe6a" size="10vh" />
    </div>
  )
}



