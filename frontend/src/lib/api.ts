import axios from 'axios'

export const API_CONFIG = {
  baseURL: 'https://us-central1-wiseupmanagementsystem-a6189.cloudfunctions.net/wiseupApi',
  timeout: 30000,
};

const api = axios.create({
  baseURL: 'https://us-central1-wiseupmanagementsystem-a6189.cloudfunctions.net/wiseupApi',
})

export default api