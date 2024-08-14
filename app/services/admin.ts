import fetchApi from "../utils/api";

export interface UserRequest {
    id?: string;
    login: string;
    password?: string;
    role: string;
}

export interface CreateUserRequest {
    username: string,
    password: string,
    role: string,
  };


export const getAllUsers = async () => {
    const token = localStorage.getItem('token');
    const data = await fetch('http://localhost:5219/User/allusers', {
        method: "GET",
        headers: {
        'Content-Type': 'application/json-patch+json',
          Authorization: `Bearer ${token}`,
        },
    });
    return data.json();
    
};

export const createUser = async(usrRequets : CreateUserRequest) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5219/User/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json-patch+json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usrRequets),
      });
};

export const updateUser = async(usrRequets : UserRequest) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5219/User/changePassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json-patch+json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            Login: usrRequets.login, 
            Password: usrRequets.password, 
        }),
      });
}

export const deleteUser = async(username: string) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5219/User/delete?userName=${username}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json-patch+json',
            Authorization: `Bearer ${token}`,
        },
      });
    return true;
}