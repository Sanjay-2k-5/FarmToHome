import React from 'react';
<<<<<<< HEAD
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
=======
import HeroImg from '../components/HeroImg';
import Homecard from '../components/Homecard';

const Home = () => {
  return (
    <div className="home-page">
      <HeroImg />
      <Homecard />
    </div>
  );
};

export default Home;
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
