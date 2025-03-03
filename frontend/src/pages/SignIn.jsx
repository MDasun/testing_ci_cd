import axios from 'axios';
import React, { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import logo from "../assets/logo.svg";

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/api/signin', {
        email,
        password,
      });

      // Check if there is an error from the backend
      if (data.error) {
        toast.error(data.error);
        return;
      }
  
      if (data.token) {
        toast.success('Logged in successfully');
        localStorage.setItem('token', data.token);
        setUser(data.user); // Store the user data in context
        navigate('/'); // Redirect to the homepage
      } else {
        toast.error('Login failed. No token received.');
      }
    } catch (error) {
      // Handling errors that might not come with a 'data.error' field
      if (error.response && error.response.data && error.response.data.error) {
        // If error response contains error field, show it
        toast.error(error.response.data.error);
      } else {
        // Fallback generic error
        console.error(error);
        toast.error('Something went wrong, please try again');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center ">
          <img
            src={logo}
            alt="Logo"
            className="h-48"
          />
        </div>
        
        {/* Title */}
        <h2 className="text-4xl text-slate-600 font-bold mb-4 text-center">LOG IN</h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="email" className="block text-slate-600 text-sm font-bold mb-2">Email</label>
            <div className="flex items-center border rounded shadow appearance-none w-full py-3 px-4 focus:outline-none focus:shadow-outline">
              <FaEnvelope className="text-gray-500 mr-2" />
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>
          
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-slate-600 text-sm font-bold mb-2">Password</label>
            <div className="flex items-center border rounded shadow appearance-none w-full py-3 px-4 focus:outline-none focus:shadow-outline">
              <FaLock className="text-gray-500 mr-2" />
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-300"
          >
            Log in
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Having trouble logging in?{" "}
          <a href="mailto:support@sltmobitel.com" className="text-blue-500 underline">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;