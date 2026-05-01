import axios from 'axios';

// Instancia de axios para el admin backoffice — sin redirección a login de usuario
const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://siladocs-backend-ejfkddf7fkgucrh6.westus3-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default adminApi;
