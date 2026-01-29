"use client"

import Image from "next/image"

export function Banner() {
  return (
    <div className="mx-4 overflow-hidden rounded-xl bg-brand-bg">
      <div className="relative w-full h-32 md:h-40 lg:h-48">
        <Image
          src="/zonic-banner.png"
          alt="Zonic - A inteligência comercial das maiores clínicas do Brasil"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
