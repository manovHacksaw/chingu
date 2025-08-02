import { Button } from '@react-email/components'
import { Github, Twitter } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
 
      <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-100 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">Chingu</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Your friendly AI-powered finance buddy that makes expense tracking fun and effortless.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-transparent border border-gray-300 p-2 hover:bg-orange-50 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-transparent border border-gray-300 p-2 hover:bg-orange-50 transition-colors"
                  aria-label="Github"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-orange-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© 2024 Chingu. Made with love for better financial habits.</p>
            <div className="mt-4 md:mt-0">
              <img src="/placeholder.svg?height=40&width=40" alt="Sleeping Chingu" className="w-10 h-10" />
              <p className="text-xs text-gray-500 mt-1">See you soon 💤</p>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer