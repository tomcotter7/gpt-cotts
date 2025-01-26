"use client";
import { ClipLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex flex-col items-center mt-6 min-h-96">
      <ClipLoader color="#fcbe6a" size="10vh" />
    </div>
  );
}
