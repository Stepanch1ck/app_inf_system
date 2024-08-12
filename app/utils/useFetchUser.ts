import { useEffect, useState } from 'react';
import { message } from 'antd';
import fetchApi from './api';
import { redirect } from 'next/navigation';



const useFetchUser = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setUserRoles([storedRole]);
    }else {
      console.error('Ошибка при получении данных пользователя');
      message.error('Ошибка при получении данных пользователя');
      redirect('/login');
    }
        
  }, []);

  return userRoles;
};

export default useFetchUser;