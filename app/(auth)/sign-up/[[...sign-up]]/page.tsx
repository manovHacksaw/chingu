import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign Up - Chingu',
  description: 'Create your Chingu account and start your financial journey with AI-powered insights.',
}

const page = () => {
  return <SignUp/>
    
  
}

export default page
