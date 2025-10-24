import React, { Component } from "react";
import "./SignUpcomponent.css";

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      lname: "",
      email: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    const { fname, lname, email, password } = this.state;
    console.log(fname, lname, email, password);
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        fname,
        lname,
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userRegister");
      });
  }
  render() {
    return (
      <div className='section'>
        <form onSubmit={this.handleSubmit}>
          <h3>Sign Up</h3>

          <div className='mb-3'>
            <label>First name</label>
            <br />
            <input
              type='text'
              className='form-control'
              placeholder='First name'
              onChange={(e) => this.setState({ fname: e.target.value })}
            />
          </div>

          <div className='mb-3'>
            <label>Last name</label>
            <br />
            <input
              type='text'
              className='form-control'
              placeholder='Last name'
              onChange={(e) => this.setState({ lname: e.target.value })}
            />
          </div>

          <div className='mb-3'>
            <label>Email address</label>
            <br />
            <input
              type='email'
              className='form-control'
              placeholder='Enter email'
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </div>

          <div className='mb-3'>
            <label>Password</label>
            <br />
            <input
              type='password'
              className='form-control'
              placeholder='Enter password'
              onChange={(e) => this.setState({ password: e.target.value })}
            />
          </div>

          <div className='d-grid'>
            <button type='submit' className='btn btn-primary'>
              Sign Up
            </button>
          </div>
          <p className='forgot-password text-right'>
            Already registered <a href='/sign-in'>sign in?</a>
          </p>
        </form>
      </div>
    );
  }
}
