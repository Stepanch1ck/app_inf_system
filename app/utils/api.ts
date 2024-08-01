import { message } from 'antd';


interface FetchOptions {
  headers: HeadersInit | undefined;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

const API_BASE_URL = 'http://localhost:5295/api';


const fetchApi = async (endpoint: string, options: FetchOptions = {
    headers: undefined
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    message.error('Ошибка авторизации. Пожалуйста, войдите.');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.ok) {
      if (options.method === 'DELETE') {
        return true;
      } else {
        return await response.json();
      }
    } else {
      const errorData = await response.json(); 
      const errorMessage = errorData.message || `Ошибка при выполнении запроса: ${response.status}`;
      message.error(errorMessage);
      throw new Error(errorMessage); 
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    message.error('Ошибка при выполнении запроса.');
    throw error;
  }
};

export default fetchApi;