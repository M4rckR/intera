import { TbBrandWhatsappFilled } from "react-icons/tb";

export const SocialMenu = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 my-6'>
      <nav className='bg-in-gray-ligth py-4 px-4 rounded-xl grid grid-cols-1 md:grid-cols-2'>
        <div>
          <p className="text-in-beige pb-2">Seleccione una red social</p>
          <TbBrandWhatsappFilled className="text-emerald-800 rounded-xl bg-in-beige w-12 h-12 border  p-1 cursor-pointer"/>
        </div>
        <div className="text-in-beige">
          <p>Seleccionado:</p>
          <h2 className="text-4xl font-bold">WhatsApp <span className="text-lg font-normal">(vista de usuarios)</span></h2>
        </div>
      </nav>
    </div>
  )
}
