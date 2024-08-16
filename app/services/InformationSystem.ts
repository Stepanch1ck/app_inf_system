import { message } from "antd";
import fetchApi from "../utils/api";

export interface CreateInfSystemRequest {
    name: string;
    description: string;
    attributeKeys: string[];
    attributeValues: string[];
  }

  export interface UpdateInfSystemRequest {
    name: string;
    newName: string;
    newDescription: string;
    attrNames: string[];
    attrValues: string[];
  }



export const getAllInfSystem = async () => {
    const token = localStorage.getItem('token');
    const data = await fetch('http://localhost:5219/InfSystem/getsystems', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return data.json();
  };

  export const getInfSystemByAttributeContain = async (attrName: string) => {
    const token = localStorage.getItem('token');
    const data = await fetch('http://localhost:5219/InfSystem/GetISWithAttribute?AttrName=${attrName}', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return data.json();
  };

  export const createInfSystem = async (request: CreateInfSystemRequest) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5219/InfSystem/create', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request), 
    });
  
    if (!response.ok) {
      throw new Error(`Ошибка при создании ИС: ${response.status}`);
    }
  
    return true;
  };

  export const updateInfSystem = async ( request: UpdateInfSystemRequest) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5219/InfSystem/change`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });
  
    if (!response.ok) {
      throw new Error(`Ошибка при обновлении ИС: ${response.status}`);
    }
  
    return await true;
  };

  export const deleteInfSystem = async (infSystemName: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5219/InfSystem/delete?infSystemName=${infSystemName}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Ошибка при удалении ИС: ${response.status}`);
    }
  
    return ;
  };