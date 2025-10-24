import React from 'react'
import "./Subs.css";

const Blog = () => {
  return (
    <>
      <section id='blog'>
        <div className='blog-box'>
          <div className='blog-img'>
            <img src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFya2V0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"  alt="text"/>
          </div>
          <div className='blog-details'>
            <h4>Cross-selling</h4>
            <p> There are times when the product alone can either be enriched, enhanced, or only be enjoyed in tandem with another product.If you can concurrently introduce this complementary product while the customer is still shopping, you increase your chances of successfully cross-selling.</p>
            <a href="/">CONTINUE READING</a>
            <h1>13/01</h1>
          </div>
        </div>
        <div className='blog-box'>
          <div className='blog-img'>
            <img src="https://live-production.wcms.abc-cdn.net.au/350a4b5e000a482937c5b0a80059a0b6?impolicy=wcms_crop_resize&cropH=2813&cropW=5000&xPos=0&yPos=0&width=862&height=485" alt="text" />
          </div>
          <div className='blog-details'>
            <h4>Niche products</h4>
            <p> Some customers shop at certain stores for morality reasons, such as wanting to support small businesses. Others may choose to do so for more specialized reasons, like dietary needs. </p>
            <a href="/">CONTINUE READING</a>
            <h1>17/01</h1>
          </div>
        </div>
        <div className='blog-box'>
          <div className='blog-img'>
            <img src="https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8Zm9vZCUyMHByb2R1Y3RzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60" alt="text"/>
          </div>
          <div className='blog-details'>
            <h4>Subscriptions & restocking</h4>
            <p> A similar trend that relies on the perishable nature of food and drink products is that of a subscription or renewal service. While post-purchase marketing can encourage customers to repeat their purchases, automated processes lead to a seamless customer experience and higher frequency of repeat purchases.</p>
            <a href="/">CONTINUE READING</a>
            <h1>21/01</h1>
          </div>
        </div>
      </section>
      {/* <section id="newsletter" className='section-p1 section-m1'>
        <div className='newstext'>
            <h4>Sign Up For Newsletters</h4>
            <p>Get E-mail updates about our latest shop and <span>special offers.</span></p>
        </div>
        <div className='form'>
            <input type="text" placeholder='Your email address'/>
            <button className='normal'>Subscribe</button>
        </div>
    </section> */}
    </>
  )
}

export default Blog