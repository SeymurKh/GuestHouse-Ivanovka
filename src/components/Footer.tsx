'use client'

import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 py-8 text-white border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <a href="#" className="flex items-center gap-2.5">
            <Image
              src="/vacationhomelogo.png"
              alt="ROOM Guest Houses"
              width={1107}
              height={950}
              className="h-9 w-auto rounded"
            />
            <span className="font-semibold text-[#b8ad9a]">ROOM Guest Houses</span>
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#rooms" className="text-white/70 hover:text-white transition-colors text-sm">
              {t.nav.rooms}
            </a>
            <a href="#gallery" className="text-white/70 hover:text-white transition-colors text-sm">
              {t.nav.gallery}
            </a>
            <a href="#contact" className="text-white/70 hover:text-white transition-colors text-sm">
              {t.nav.contact}
            </a>
          </nav>

          <p className="text-sm text-white/50 text-center">
            © {year} ROOM Guest Houses. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}