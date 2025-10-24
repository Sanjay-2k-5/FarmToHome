import React from 'react';
import Navbar from "../components/Navbar";
import HeroImg from '../components/HeroImg';
import AboutCard from '../components/About';
import Herocard from '../components/Homecard'
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';


const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroImg />
      <AboutCard />
      <Herocard />
      <Carousel />
      <Footer />
    </div>
  )
}

export default Home
