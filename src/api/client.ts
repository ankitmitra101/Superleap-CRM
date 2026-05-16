import axios from "axios";

// This points exactly to the Express server they provided
export const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});