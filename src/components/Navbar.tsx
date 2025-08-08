import Image from 'next/image'
import React from 'react'

export const Navbar = () => {
  return (
    <div className="py-6 bg-in-gray">
        <header className="max-w-7xl px-4 mx-auto">
          <Image
            src={"/logos/logo-insalud.png"}
            alt="Logo INtera"
            width={200}
            height={35} 
          />

        </header>
    </div>
  )
}
