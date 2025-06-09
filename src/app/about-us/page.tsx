'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import LeadershipTeam from '../components/LeadershipTeam';
import { FiArrowRight } from 'react-icons/fi';

export default function AboutUsPage() {
  return (
    <>
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
                  AVITO Perfume started with a simple belief: everyone deserves a fragrance that feels personal, powerful, and unforgettable. What began as a spark of inspiration quickly turned into a vision—crafting high-quality, long-lasting perfumes that resonate with the Indian lifestyle without the luxury price tag.
                </p>
                <p className="text-gray-600 mb-4">
                  At the heart of this journey is Mr. Arvind Soni, a fragrance enthusiast with years of hands-on experience and a deep appreciation for the art of scent-making. He set out to create a brand that blends global sophistication with local relevance—bringing together the richness of international perfume oils with scents designed for India's climate, culture, and diverse preferences.
                </p>
                <p className="text-gray-600">
Today, AVITO stands as a reflection of that passion—a brand built on craftsmanship, creativity, and care. From bold masculine notes to delicate feminine aromas and versatile unisex blends, every AVITO fragrance is a statement of identity, elegance, and everyday luxury—made for India, inspired by the world.
                </p>
              </div>
              <div>
                <img 
                  src="/ARVIND SONI.jpeg.jpg" 
                  alt="Avito Scent Founder"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
            
            <div className="text-center">
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
    </>
  );
} 