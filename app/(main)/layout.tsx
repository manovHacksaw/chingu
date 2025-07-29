import React from 'react'

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='min-h-screen mx-auto container'>
        {children}
    </div>
  )
}

export default MainLayout