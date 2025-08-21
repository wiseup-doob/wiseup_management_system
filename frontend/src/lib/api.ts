import axios from 'axios'
import { config } from '../config/environment';

const API_CONFIG = {
  development: {
    baseURL: config.api.baseURL,
  },
  production: {
    baseURL: config.api.baseURL,
  },
};

const api = axios.create({
  baseURL: config.api.baseURL,
})

export default api