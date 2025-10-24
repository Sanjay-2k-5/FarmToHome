import React from "react";
import "./Det.css";

const Cart = () => {
  return (
    <>
      <div className='proo'>
        {/* <section id='cart' className='section-p1'> */}
        <div className='section-p1'>
          <table width={"100%"}>
            <thead>
              <tr>
                <td>Name</td>
                <td>E-mail</td>
                <td>Phone Number</td>
                <td>Your Orders</td>
                <td>Track Orders</td>
                <td>Change Password</td>
              </tr>
            </thead>
          </table>
        </div>
        {/* </section> */}
        {/* 
    <section id='cart-add' className='section-p1'> */}
        <div className='cart-add'>
          <div className='coupon'>
            <h3>Apply Coupon</h3>
            <div>
              <input type='text' placeholder='Enter Your Coupon' />
              <button className='normal'>Apply</button>
            </div>
          </div>
          <div className='subtotal'>
            <h3> My Points </h3>
            <table>
              <tr>
                <td>Number of Orders</td>
                <td> </td>
              </tr>
              <tr>
                <td> Points Scored </td>
                <td> </td>
              </tr>
              <tr>
                <td>
                  <strong> Ponits Redeemed</strong>
                </td>
                <td>
                  <strong> </strong>
                </td>
              </tr>
            </table>
            <button className='normal'> Redeem Now </button>
          </div>
          {/* </section> */}
        </div>
      </div>
    </>
  );
};

export default Cart;
