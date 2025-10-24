<<<<<<< HEAD
import React from 'react'
import Navbar from "../components/Navbar";
import HeroImg from '../components/HeroImg';
// import Cards from '../components/Cards';
import Footer from '../components/Footer';
import Pro from '../components/Pro';

const ProductPage = () => {
    return (
    <div>
        <Navbar />
        <HeroImg />
        {/* <Cards /> */}
        <Pro />
        <Footer />
    </div>)
    }
=======
import React from 'react';
import Pro from '../components/Pro';

const ProductPage = () => {
  return (
    <div className="products-page">
      <Pro />
    </div>
  );
};

>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
export default ProductPage;
