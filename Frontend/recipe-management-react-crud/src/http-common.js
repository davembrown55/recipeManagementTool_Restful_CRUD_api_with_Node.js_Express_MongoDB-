import axios from "axios";

const http =  axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-type": "application/json"
  }
});

// Set the Authorization header globally with the JWT token from localStorage
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Retrieve token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;  // Add the token to the Authorization header
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default http;