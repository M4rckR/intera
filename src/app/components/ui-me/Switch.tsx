'use client'
export const Switch = () => {

  const handleChecked = ( ) => {
    console.log('Switch toggled');
  }

  return (
    <div 
        className='w-12 h-7 bg-in-beige p-1 rounded-3xl cursor-pointer'
        onClick={handleChecked}
    >
        <div className=' bg-in-gray left-0 w-1/2 h-full rounded-full'></div>
    </div>
  )
}
