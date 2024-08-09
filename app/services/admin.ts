import fetchApi from "../utils/api";

export interface UserRequest {
    id: number;
    username: string;
    password?: string;
    roleId: number;
}


export const getAllUsers = async () => {
    const data = await fetchApi('Users', {
        method: "GET",
        headers: {},
    });
    return data;
    
};

export const createUser = async(usrRequets : UserRequest) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5295/api/Users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usrRequets),
      });
};

export const updateUser = async(id: string, usrRequets : UserRequest) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5295/api/Users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usrRequets),
      });
}

export const deleteUser = async(id: string) => {
    await fetchApi(`Users/${id}`, {
        method: 'DELETE',
        headers: {},
      });
    return true;
}