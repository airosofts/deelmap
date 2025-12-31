'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 6

  // Auto-scroll functionality with proper infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= totalSlides - 1) {
          return 0 // Reset to first slide
        }
        return prev + 1
      })
    }, 6000) // 6 seconds per slide for slower auto-scroll

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Main Container with background and overlay */}
      <section 
        className="relative py-16 min-h-[80vh] flex items-center overflow-hidden"
        style={{ backgroundColor: '#F6F4F1' }}
      >
        {/* Main Container Background Pattern (6.png) */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/home/6.png)',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto 100%',
            opacity: 0.7
          }}
        />

        {/* Main Container Background Overlay (7.png) */}
        <div 
          className="absolute inset-0 z-1"
          style={{
            backgroundImage: 'url(/assets/home/7.png)',
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat', 
            backgroundSize: 'auto 100%',
            opacity: 0.5
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          
          {/* Top Section - Text Content (50/50 split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
            {/* Left Column - Heading */}
            <div 
              className="animate-fade-in-up text-left"
              style={{ animationDuration: '2s' }}
            >
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight"
                style={{ color: 'var(--secondary-color)' }}
              >
                SELL WITH SIMPLICITY. BUY WITH CERTAINTY.
              </h2>
            </div>
            
            {/* Right Column - Description */}
            <div 
              className="animate-fade-in-up text-left"
              style={{ animationDuration: '2s' }}
            >
              <p className="text-sm sm:text-base leading-relaxed text-gray-700 font-normal">
                The Ableman Group is a collective of real-estate experts who have perfected 
                the process of property acquisition and disposition, providing simplicity for 
                sellers and targeted investment opportunities for buyers nationwide.
              </p>
            </div>
          </div>

          {/* Bottom Section - Four Cards (25% each) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Card 1 - Property Sales */}
            <div 
              className="bg-white p-8 lg:p-10 text-center property-card shadow-lg"
              style={{ 
                animationDelay: '0.1s',
                animation: 'zoomIn 2s ease-out 0.1s both'
              }}
            >
              <div className="mb-4 lg:mb-6 flex justify-center">
                <div className="transition-transform duration-300 hover:scale-110">
                  <Image
                    src="/assets/home/1.png"
                    alt="Property Sales"
                    width={83}
                    height={62}
                    className="w-[83px] h-[62px] object-contain"
                  />
                </div>
              </div>
              <h4 
                className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 leading-tight uppercase tracking-wide"
                style={{ color: 'var(--primary-color)' }}
              >
                Property<br />Sales
              </h4>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Looking to sell your property?
              </p>
            </div>

            {/* Card 2 - Investment Opportunities */}
            <div 
              className="bg-white p-8 lg:p-10 text-center property-card shadow-lg"
              style={{ 
                animationDelay: '0.2s',
                animation: 'zoomIn 2s ease-out 0.2s both'
              }}
            >
              <div className="mb-4 lg:mb-6 flex justify-center">
                <div className="transition-transform duration-300 hover:scale-110">
                  <Image
                    src="/assets/home/2.png"
                    alt="Investment Opportunities"
                    width={81}
                    height={64}
                    className="w-[81px] h-[64px] object-contain"
                  />
                </div>
              </div>
              <h4 
                className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 leading-tight uppercase tracking-wide"
                style={{ color: 'var(--primary-color)' }}
              >
                Investment Opportunities
              </h4>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Interested in real estate investment?
              </p>
            </div>

            {/* Card 3 - Property Acquisitions (with background and overlay) */}
            <div 
              className="relative text-center property-card shadow-lg overflow-hidden"
              style={{ 
                animationDelay: '0.3s',
                animation: 'zoomIn 2s ease-out 0.3s both'
              }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: 'url(/assets/home/5.jpg)',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Dark Overlay with theme color */}
              <div 
                className="absolute inset-0 z-1"
                style={{ 
                  backgroundColor: '#022b41',
                  opacity: 0.85
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-8 lg:p-10">
                <div className="mb-4 lg:mb-6 flex justify-center">
                  <div className="transition-transform duration-300 hover:scale-110">
                    <Image
                      src="/assets/home/3.png"
                      alt="Property Acquisitions"
                      width={83}
                      height={62}
                      className="w-[83px] h-[62px] object-contain brightness-0 invert"
                    />
                  </div>
                </div>
                <h4 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 leading-tight text-white uppercase tracking-wide">
                  Property Acquisitions
                </h4>
                <p className="text-sm lg:text-base text-gray-200 leading-relaxed">
                  Ready to find your dream property?
                </p>
              </div>
            </div>

            {/* Card 4 - Commercial Solutions */}
            <div 
              className="bg-white p-8 lg:p-10 text-center property-card shadow-lg"
              style={{ 
                animationDelay: '0.4s',
                animation: 'zoomIn 2s ease-out 0.4s both'
              }}
            >
              <div className="mb-4 lg:mb-6 flex justify-center">
                <div className="transition-transform duration-300 hover:scale-110">
                  <Image
                    src="/assets/home/4.png"
                    alt="Commercial Solutions"
                    width={85}
                    height={64}
                    className="w-[85px] h-[64px] object-contain"
                  />
                </div>
              </div>
              <h4 
                className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 leading-tight uppercase tracking-wide"
                style={{ color: 'var(--primary-color)' }}
              >
                Commercial Solutions
              </h4>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Commercial space for your business?
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Mobile Optimized */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[60vh] lg:min-h-[60vh]">
          
          {/* Left side - Background Image */}
          <div 
            className="w-full lg:w-1/2 h-64 lg:h-auto order-1 lg:order-1"
            style={{
              backgroundImage: 'url(/assets/home/8.jpg)',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>

          {/* Right side - Content */}
          <div className="w-full lg:w-1/2 bg-[#022b41] flex items-center order-2 lg:order-2">
            <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 w-full">
              
              {/* Heading */}
              <div 
                className="animate-fade-in-up mb-6 lg:mb-8"
                style={{ animationDuration: '2s' }}
              >
                <h2 
                  className="font-bold leading-tight text-white text-left"
                  style={{ fontSize: 'clamp(24px, 4vw, 35px)' }}
                >
                  WHY CHOOSE US AT ABLEMAN GROUP
                </h2>
              </div>

              {/* Paragraph */}
              <div 
                className="animate-fade-in-up mb-8 lg:mb-10"
                style={{ animationDuration: '2s', animationDelay: '0.2s' }}
              >
                <p 
                  className="leading-relaxed text-left"
                  style={{ fontSize: '16px', color: '#b29578' }}
                >
                  At Ableman Group, we pride ourselves on our deep understanding of the real estate landscape. Our 
                  team is made up of experienced professionals who are not just experts in real estate, but also have 
                  an intimate knowledge of the local markets we serve. Whether you're buying or selling, our insights 
                  into neighborhood trends, property values, and market dynamics ensure that you're making informed 
                  decisions every step of the way.
                </p>
              </div>

              {/* Icon List */}
              <div className="space-y-3 lg:space-y-4">
                
                {/* List Item 1 - Personalized Service */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.4s both'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#b29578] flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span 
                    className="text-white"
                    style={{ fontSize: '16px', fontWeight: '500' }}
                  >
                    Personalized Service
                  </span>
                </div>

                {/* List Item 2 - Comprehensive Support */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.5s both'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#b29578] flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span 
                    className="text-white"
                    style={{ fontSize: '16px', fontWeight: '500' }}
                  >
                    Comprehensive Support
                  </span>
                </div>

                {/* List Item 3 - Cutting-Edge Technology */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.6s both'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#b29578] flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span 
                    className="text-white"
                    style={{ fontSize: '16px', fontWeight: '500' }}
                  >
                    Cutting-Edge Technology
                  </span>
                </div>

                {/* List Item 4 - Integrity and Transparency */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.7s both'
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#b29578] flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span 
                    className="text-white"
                    style={{ fontSize: '16px', fontWeight: '500' }}
                  >
                    Integrity and Transparency
                  </span>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Recent Projects Slider Section */}
      <section 
        className="relative py-16 lg:py-20 overflow-hidden"
        style={{ backgroundColor: '#F6F4F1' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <p 
              className="text-sm font-semibold tracking-wider uppercase mb-4"
              style={{ color: 'var(--secondary-color)' }}
            >
              WHAT'S HAPPENING
            </p>
            <h2 
              className="text-3xl lg:text-4xl xl:text-5xl font-bold"
              style={{ color: 'var(--primary-color)' }}
            >
              RECENT PROJECTS
            </h2>
          </div>
        </div>

        {/* Full Width Slider Container - Desktop Only */}
        <div className="relative w-full hidden lg:block">
          {/* Slider Wrapper */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 20}%)`
              }}
            >
              {/* Generate slider items with duplicates for infinite loop */}
              {Array.from({ length: totalSlides * 2 }, (_, index) => {
                const imageIndex = (index % totalSlides) + 1
                return (
                  <div 
                    key={`slide-${index}`}
                    className="w-1/5 flex-shrink-0"
                  >
                    <div className="relative h-64 lg:h-80 overflow-hidden property-card">
                      <Image
                        src={`/assets/slider/${imageIndex}.webp`}
                        alt={`Recent Project ${imageIndex}`}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          console.error(`Failed to load image: /assets/slider/${imageIndex}.webp`)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Arrows - Desktop */}
          <button
            onClick={() => {
              setCurrentSlide((prev) => {
                if (prev <= 0) {
                  return totalSlides - 1
                }
                return prev - 1
              })
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              setCurrentSlide((prev) => {
                if (prev >= totalSlides - 1) {
                  return 0
                }
                return prev + 1
              })
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile Slider - Show 1 image at a time */}
        <div className="block lg:hidden px-4">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 100}%)`
              }}
            >
              {Array.from({ length: totalSlides }, (_, index) => (
                <div 
                  key={index + 1}
                  className="w-full flex-shrink-0"
                >
                  <div className="relative h-64">
                    <Image
                      src={`/assets/slider/${index + 1}.webp`}
                      alt={`Recent Project ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: /assets/slider/${index + 1}.webp`)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile Navigation Arrows - Centered on image */}
            <button
              onClick={() => {
                setCurrentSlide((prev) => {
                  if (prev <= 0) {
                    return totalSlides - 1
                  }
                  return prev - 1
                })
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                setCurrentSlide((prev) => {
                  if (prev >= totalSlides - 1) {
                    return 0
                  }
                  return prev + 1
                })
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </section>
      <Footer /> 

    </div>
    
  )
  
}
