import './About.css'
import React from 'react'
import AboutCard from './AboutCard';
import AboutCardData from './AboutData';

const About = () => {
  return (
      <div className='work-container'>
         <h1 className='project-heading'>Our Services</h1>
         <div className='project-container'>
            {AboutCardData.map((val,ind)=>{
                return (
                    <AboutCard 
                    Key={ind}
                    imgsrc={val.imgsrc}
                    title={val.title}
                    text={val.text}
                    view={val.view}
                    />
                )
            })}
      </div>
      </div>
  );
}

export default About
