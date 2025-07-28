"use client"
import React, { useState, useEffect } from 'react';
import { Home, LayoutDashboard, Search, ArrowLeft, Heart } from 'lucide-react';

const NotFound = () => {
  const [mascotMood, setMascotMood] = useState('confused');
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate mascot periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      const moods = ['confused', 'sad', 'thinking'];
      setMascotMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const ChinguMascot = ({ mood, className = "" }) => {
    const getMascotExpression = () => {
      switch(mood) {
        case 'sad': return '😢';
        case 'thinking': return '🤔';
        case 'confused':
        default: return '😵';
      }
    };

    return (
      <div className={`relative ${className}`}>
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-peach-200 to-peach-300 flex items-center justify-center text-6xl transition-all duration-500 ${isAnimating ? 'scale-110 rotate-12' : 'scale-100 rotate-0'} shadow-lg`}>
          {getMascotExpression()}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-lg animate-bounce delay-1000">
          ❓
        </div>
      </div>
    );
  };

  const navigationOptions = [
    {
      icon: Home,
      label: "Go Home",
      description: "Back to safety",
      href: "/",
      color: "from-blue-400 to-blue-500",
      hoverColor: "hover:from-blue-500 hover:to-blue-600"
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Check your finances",
      href: "/dashboard",
      color: "from-green-400 to-green-500",
      hoverColor: "hover:from-green-500 hover:to-green-600"
    },
    {
      icon: Search,
      label: "Search",
      description: "Find what you need",
      href: "/search",
      color: "from-purple-400 to-purple-500",
      hoverColor: "hover:from-purple-500 hover:to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-pink-50 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-pink-200 rounded-full animate-ping opacity-70"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-blue-200 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-80"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-green-200 rounded-full animate-ping opacity-50 delay-1000"></div>
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
          
          {/* Mascot */}
          <div className="flex justify-center mb-8">
            <ChinguMascot mood={mascotMood} />
          </div>

          {/* 404 Text */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-4 animate-pulse">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 font-rounded">
              Oops! Chingu can't find this page
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              Looks like this page went on a spending spree and disappeared! 
              Don't worry, Chingu is here to help you get back on track.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {navigationOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => window.location.href = option.href}
                className={`group relative bg-gradient-to-r ${option.color} ${option.hoverColor} text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                    <p className="text-sm opacity-90">{option.description}</p>
                  </div>
                </div>
                
                {/* Sparkle effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
                </div>
              </button>
            ))}
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-lg group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Take me back</span>
          </button>

          {/* Fun Quote */}
          <div className="mt-8 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl border border-pink-200">
            <p className="text-gray-700 italic">
              "Even the best budget trackers sometimes lose their way! 💸✨"
            </p>
            <p className="text-sm text-gray-500 mt-2">— Chingu's Philosophy</p>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 flex items-center justify-center space-x-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
            <span>by the Chingu team</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .font-rounded {
          font-family: 'Nunito', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .bg-peach-50 {
          background-color: #fef7f0;
        }
        
        .bg-peach-200 {
          background-color: #fed7aa;
        }
        
        .bg-peach-300 {
          background-color: #fdba74;
        }
        
        .from-peach-200 {
          --tw-gradient-from: #fed7aa;
        }
        
        .to-peach-300 {
          --tw-gradient-to: #fdba74;
        }
      `}</style>
    </div>
  );
};

export default NotFound;