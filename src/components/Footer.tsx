'use client'

import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative z-10 py-4 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/vacationhomelogo.png"
            alt="ROOM Guest Houses"
            width={1107}
            height={950}
            className="h-7 w-auto rounded"
          />
          <span className="font-semibold">ROOM Guest Houses © 2026</span>
        </div>
      </div>
    </footer>
  )
}
