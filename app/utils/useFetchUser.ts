import { useEffect, useState } from 'react';
import { message } from 'antd';
import fetchApi from './api';
import { redirect } from 'next/navigation';

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
        redirect('/login'); 
      }
    };

    fetchUserData();
  }, []);

  return userRoles;
};

export default useFetchUser;