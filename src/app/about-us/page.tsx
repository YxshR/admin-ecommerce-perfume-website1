'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import LeadershipTeam from '../components/LeadershipTeam';
import { FiArrowRight } from 'react-icons/fi';
import { AuthProvider } from '../components/AuthProvider';

export default function AboutUsPage() {
  return (
    <AuthProvider>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <img 
            src="https://placehold.co/1200x600/272420/FFFFFF?text=About+Avito+Scent" 
            alt="About Us"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="text-center px-4 z-20 relative text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Story</h1>
            <p className="text-lg md:text-xl max-w-lg mx-auto">
              Crafting memorable fragrances since 2015
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Our Story Content */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-4">How It All Began</h2>
                <p className="text-gray-600 mb-4">
                  Avito Scent was born in 1993 when our founder, Arvind Soni, realized that the Indian fragrance market lacked truly premium, locally-made perfumes that could compete with international brands.
                </p>
                <p className="text-gray-600 mb-4">
                  Driven by his passion for scents and with a background in chemistry, Rajan started experimenting with creating unique fragrances in his Mumbai apartment. What began as a personal project quickly gained attention among friends and family.
                </p>
                <p className="text-gray-600">
                  By 1993, Avito Scent launched its first collection of three signature scents, which sold out within weeks. This remarkable response fueled our commitment to crafting exceptional fragrances that celebrate Indian heritage while appealing to global sensibilities.
                </p>
              </div>
              <div>
                <img 
                  src="https://placehold.co/500x600/272420/FFFFFF?text=Founder" 
                  alt="Avito Scent Founder"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
            
            {/* Our Journey Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Our Journey</h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
              </div>
            </div>
            
            {/* Collections Link */}
            <div className="text-center mb-16">
              <Link 
                href="/collection"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Discover Our Collections <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Leadership Team Section */}
        <LeadershipTeam />
        
        {/* Careers Section */}
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
              <p className="text-gray-600 mb-4">
                We're always looking for passionate individuals to join our growing team. If you share our love for fragrances and our commitment to quality and sustainability, we'd love to hear from you.
              </p>
              <p className="text-gray-600 mb-6">
                Explore current opportunities and discover what it's like to be part of the Avito Scent family.
              </p>
              <Link 
                href="/careers"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                View Open Positions <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div>
              <img 
                src="https://placehold.co/600x400/272420/FFFFFF?text=Join+Our+Team" 
                alt="Career Opportunities"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </AuthProvider>
  );
} 