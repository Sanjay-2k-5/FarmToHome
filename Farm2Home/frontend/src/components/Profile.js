import React from "react";
// import useravatar from "../images/useravatar.jpg";

import "./Profile.css";

const profile = () => {
  return (
    <div className='akshi'>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "18px 0px",
        }}
      >
        <div className='pro'>
          {/* <img src= { useravatar } style={{width:"160px",height:"160px",borderRadius:"80px"}} /> */}
          <div>
            <h1>Welcome !</h1>
            {/* <h2>User Name</h2>
                    <h3>Address</h3>
                    <h4>Phone Number</h4>
                    <h4>Email</h4> */}
            {/* <button className= "bttn">Log Out</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default profile;
