<<<<<<< HEAD
import React from 'react'
import Navbar from "../components/Navbar";
import HeroImg from '../components/HeroImg';
import Subs from '../components/Subs'
import Footer from '../components/Footer';

const Blog = () => {
  return (
    <div>
       <Navbar />
       <HeroImg />
       <Subs />
       <Footer />
    </div>
  )
}

export default Blog
=======
import React from 'react';
import Subs from '../components/Subs';

const Blog = () => {
  return (
    <div className="blog-page container py-4">
      <h1>Our Blog</h1>
      <Subs />
    </div>
  );
};

export default Blog;
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
