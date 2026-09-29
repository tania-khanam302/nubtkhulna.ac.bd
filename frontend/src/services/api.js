import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.MODE === "production"
            ? "https://rs-management-vgcw.onrender.com/api"
            : "http://localhost:4000/api",
    withCredentials: true,
});

export default api;