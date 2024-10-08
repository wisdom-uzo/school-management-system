"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, AcademicCapIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    className="bg-white p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Icon className="h-12 w-12 text-indigo-600 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const ProgramSlider = () => {
  const programs = [
    "Computer Science",
    "Business Administration",
    "Mechanical Engineering",
    "Psychology",
    "Fine Arts"
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative overflow-hidden h-20">
      <motion.div
        className="flex flex-col items-center justify-center h-full"
        initial={{ y: 0 }}
        animate={{ y: -activeIndex * 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {programs.map((program, index) => (
          <div key={index} className="h-20 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">{program}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const HomePage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-indigo-600">UniAdmit</div>
            <div className="space-x-4">
              <a href="#" className="text-gray-600 hover:text-indigo-600">Programs</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">Admissions</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">About</a>
              <a href="#" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">Apply Now</a>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Welcome to UniAdmit</h1>
          <p className="text-xl text-gray-600 mb-8">Your journey to higher education starts here</p>
          <div className="flex justify-center items-center space-x-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-full text-lg hover:bg-indigo-700 transition duration-300">
              Start Your Application
            </button>
            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-full text-lg hover:bg-indigo-600 hover:text-white transition duration-300">
              Explore Programs
            </button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-8">Featured Programs</h2>
          <ProgramSlider />
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={AcademicCapIcon}
              title="World-Class Education"
              description="Our programs are designed to provide you with cutting-edge knowledge and skills."
            />
            <FeatureCard 
              icon={UserGroupIcon}
              title="Diverse Community"
              description="Join a vibrant community of learners from all around the world."
            />
            <FeatureCard 
              icon={ClockIcon}
              title="Flexible Learning"
              description="Balance your studies with your lifestyle through our flexible learning options."
            />
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-8">Take a Virtual Tour</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
            <img 
              src="/api/placeholder/1280/720" 
              alt="Campus Video Thumbnail" 
              className={`w-full h-full object-cover ${isVideoPlaying ? 'hidden' : 'block'}`}
            />
            <button 
              className={`absolute inset-0 flex items-center justify-center ${isVideoPlaying ? 'hidden' : 'block'}`}
              onClick={() => setIsVideoPlaying(true)}
            >
              <svg className="w-20 h-20 text-white opacity-75 hover:opacity-100 transition duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            {isVideoPlaying && (
              <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xl">
                Video would play here
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-center mb-8">Ready to Begin?</h2>
          <div className="text-center">
            <a href="#" className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-full text-lg hover:bg-indigo-700 transition duration-300">
              Start Your Application
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">UniAdmit</h3>
              <p className="text-gray-400">Empowering futures through education</p>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Programs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Admissions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Campus Life</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 UniAdmit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;