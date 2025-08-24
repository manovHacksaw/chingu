import type { Metadata } from 'next'
import {  SignIn } from '@clerk/nextjs'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign In - Chingu',
  description: 'Sign in to your Chingu account to start tracking your finances.',
}

const SignInPage = () => {
  return  <SignIn/>
  
}

export default SignInPage
