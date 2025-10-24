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
export default ProductPage;
