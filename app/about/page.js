'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar currentPage="about" />

      {/* Welcome Section with Background Overlay */}
      <section 
        className="relative py-16 lg:py-20 overflow-hidden"
        style={{ backgroundColor: '#F6F4F1' }}
      >
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/assets/aboutussection.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column - Heading */}
            <div 
              className="animate-fade-in-up"
              style={{ animationDuration: '1.5s' }}
            >
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                style={{ color: 'var(--primary-color)' }}
              >
                WELCOME TO
                <br />
                ABLEMAN GROUP
              </h2>
            </div>
            
            {/* Right Column - Content */}
            <div 
              className="animate-fade-in-up space-y-6"
              style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
            >
             <p className="text-base lg:text-lg leading-relaxed text-gray-700">
                Beginning in Lexington, Kentucky, the Ableman Group now has an international footprint with offices in the 
                United States and Europe. Our company has refined the process of acquiring discounted properties and offering 
                these deals off-market to our loyal group of real estate investors.
              </p>
              
              <p className="text-base lg:text-lg leading-relaxed text-gray-700">
                Ableman Group has more than 10 years of experience in the subtle art of property acquisition and disposition, 
                offering our clients a unique and proven solution for access to some of the best real estate deals in targeted 
                markets around the United States.
              </p>
              
              <p className="text-base lg:text-lg leading-relaxed text-gray-700">
                Whether it's single-family homes, multi-family, or commercial properties, the Ableman Group is ready to 
                serve you with a steady flow of off-market deals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work With Ableman Group Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          
          {/* Left side - Image */}
          <div 
            className="w-full lg:w-1/2 h-64 lg:h-auto order-1 lg:order-1"
            style={{
              backgroundImage: 'url(/assets/aboutussectionimage.jpg)',
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
                style={{ animationDuration: '1.5s' }}
              >
                <h2 
                  className="font-bold leading-tight text-white text-left"
                  style={{ fontSize: 'clamp(24px, 4vw, 35px)' }}
                >
                  WORK WITH ABLEMAN GROUP
                </h2>
              </div>

              {/* Paragraph */}
              <div 
                className="animate-fade-in-up mb-8 lg:mb-10"
                style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
              >
                <p 
                  className="leading-relaxed text-left mb-6"
                  style={{ fontSize: '16px', color: '#b29578' }}
                >
                  The Ableman executive team is constantly looking for dedicated and talented individuals interested in the real-estate business to 
                  fill many important roles within the company, including but not limited to:
                </p>
              </div>

              {/* Job Roles List */}
              <div className="space-y-3 lg:space-y-4">
                
                {/* List Item 1 */}
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
                    Acquisitions Agents
                  </span>
                </div>

                {/* List Item 2 */}
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
                    Disposition Agents
                  </span>
                </div>

                {/* List Item 3 */}
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
                    Lead Generation Specialists
                  </span>
                </div>

                {/* List Item 4 */}
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
                    Local Area Support Staff
                  </span>
                </div>

                {/* List Item 5 */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.8s both'
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
                    Administrative Staff
                  </span>
                </div>

                {/* List Item 6 */}
                <div 
                  className="flex items-center justify-start"
                  style={{ 
                    animation: 'zoomIn 1.2s ease-out 0.9s both'
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
                    Client Relations
                  </span>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Don't Hesitate CTA Section */}
      <section 
        className="relative py-16 lg:py-20 overflow-hidden"
        style={{ backgroundColor: '#B29578' }}
      >
        {/* Background Overlay Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/assets/overlaycta.png)',
            backgroundPosition: 'center left',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 0.5
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left side - Text Content */}
            <div className="text-center lg:text-left lg:flex-1">
              <p 
                className="text-sm sm:text-base font-medium text-white uppercase tracking-wider mb-4"
                style={{ 
                  animation: 'fadeInUp 1.2s ease-out',
                  opacity: 0.9
                }}
              >
                DON'T HESITATE TO CONTACT US
              </p>
              <h2 
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight"
                style={{ 
                  animation: 'fadeInUp 1.2s ease-out 0.2s both'
                }}
              >
                MAKE AN APPOINTMENT NOW
              </h2>
            </div>
            
            {/* Right side - CTA Button */}
            <div 
              className="lg:flex-shrink-0"
              style={{ 
                animation: 'fadeInUp 1.2s ease-out 0.4s both'
              }}
            >
              <a
                href="/contact"
                className="inline-block bg-[#022b41] hover:bg-white hover:text-[#022b41] text-white px-8 lg:px-12 py-4 lg:py-5 rounded-lg font-bold text-sm lg:text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                CONTACT US TODAY!
              </a>
            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}