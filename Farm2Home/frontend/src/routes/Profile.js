import React from "react";
import HeroImg from "../components/HeroImg";
import Navbar from "../components/Navbar";
import Profilee from "../components/Profile";
import Det from "../components/Det";
import Footer from "../components/Footer";

const Profile = () => {
  return (
    <div>
      <Navbar />
      <HeroImg />
      <Profilee />
      <Det />
      <Footer />
    </div>
  );
};

export default Profile;
