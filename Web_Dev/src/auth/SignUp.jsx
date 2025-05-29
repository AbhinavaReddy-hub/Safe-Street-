import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRegCircleUser, FaEye, FaEyeSlash } from "react-icons/fa6";
import { IoMail, IoLockClosed, IoPerson, IoLocation } from "react-icons/io5";
import { Link, Navigate, useNavigate } from 'react-router-dom';

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    authority: '',
    location: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    if(checkpass(formData)){
    try{
     const mongores = await fetch("http://192.168.207.157:3000/api/auth/register", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: "admin",
                }),
              });

              const mongojson = await mongores.json();
              console.log(mongojson);
              if (mongojson.status === 'fail') throw new Error(mongojson.message);
              const user = mongojson.data.user;
              localStorage.setItem("token",mongojson.token);
            window.location.href='/';
            setError("");
    }catch(e){
        setError("error : "+e.message);
    }
    }else{
        setError("error: confirm password is incorrect");
    }
  };
  function checkpass(formData){
    if(formData.password===formData.confirmPassword){
        return true;
    }
    return false;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
   
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center">
              <FaRegCircleUser className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Street Lens</h1>
          <p className="text-gray-600 text-sm">Join our community of civic reporters</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-serif text-center text-gray-800 mb-6">Create Account</h2>
          {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
            )}
                    
          <div onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <IoPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="relative">
              <IoMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="relative">
              <IoLocation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <select
                name="authority"
                value={formData.authority}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300 appearance-none bg-white"
              >
                <option value="">Select Authority</option>
                <option value="Narayanguda Authority">Narayanguda Authority</option>
                <option value="Miyapur Authority">Miyapur Authority</option>
                <option value="Gachibowli Authority">Gachibowli Authority</option>
                <option value="Secunderabad Authority">Secunderabad Authority</option>
                <option value="Begumpet Authority">Begumpet Authority</option>
              </select>
            </div>

            <div className="relative">
              <IoLocation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                name="location"
                placeholder="Location/Area"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
              </button>
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
              </button>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-700"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <span className="text-amber-700 hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-amber-700 hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>

            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full bg-amber-700 text-white py-3 rounded-lg font-medium hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
            >
              Create Account
            </motion.button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to={'/login'}
               className="text-amber-700 hover:underline cursor-pointer font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-gray-600 text-xs">
            © 2024 Street Lens. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignupPage;