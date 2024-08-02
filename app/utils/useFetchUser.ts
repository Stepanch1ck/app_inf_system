import { useEffect, useState } from 'react';
import { message } from 'antd';
import router from 'next/router';
import fetchApi from './api';

interface User {
  role: {
    name: string;
  };
}

const useFetchUser = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData: User = await fetchApi('users/me');
        setUserRoles([userData.role.name]);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        message.error('Ошибка при получении данных пользователя');
        router.push('/login'); 
      }
    };

    fetchUserData();
  }, []);

  return userRoles;
};

export default useFetchUser;