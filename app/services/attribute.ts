import fetchApi from "../utils/api";

export interface CreateAttributeRequest {
  name: string;
  description: string;
  states?: string[];
}

export interface DeleteAttributeRequest {
  name: string;
}

export interface AddNewStateRequest {
  name: string;
  value: string;
}

export interface RemoveStateRequest {
  name: string;
  value: string;
}

export const getAllAttribute = async () => {
  const token = localStorage.getItem('token');
    const data = await fetch('http://localhost:5219/Attribute/getattributes', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json-patch+json',
        Authorization: `Bearer ${token}`,
      },
    });
    return data.json();
};

export const createAttribute = async (request: CreateAttributeRequest) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5219/Attribute/create', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request), 
  });

  if (!response.ok) {
    throw new Error(`Ошибка при создании атрибута: ${response.status}`);
  }

  return true; 
};

export const deleteAttribute = async (request: DeleteAttributeRequest) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5219/Attribute/delete', { 
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request), 
  });

  if (!response.ok) {
    throw new Error(`Ошибка при удалении атрибута: ${response.status}`);
  }

  return true; 
};

export const addNewState = async (request: AddNewStateRequest) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5219/Attribute/addState', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request), 
  });

  if (!response.ok) {
    throw new Error(`Ошибка при добавлении состояния: ${response.status}`);
  }

  return true; 
};

export const removeState = async (request: RemoveStateRequest) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5219/Attribute/removeState', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request), 
  });

  if (!response.ok) {
    throw new Error(`Ошибка при удалении состояния: ${response.status}`);
  }

  return true; 
};