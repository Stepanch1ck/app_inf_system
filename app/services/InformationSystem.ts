import { message } from "antd";
import fetchApi from "../utils/api";

export interface InformationSystemRequest {
    id: number;
    name: string;
    attributes: AttributeWithValue[];
}



export const getAllInfSystem = async () => {
    const data = await fetchApi('InformationSystems/with-attributes', {
        method: "GET",
        headers: {},
    });
    return data;
    
};

export const getInfSystem = async(id: string) => {
    const data = await fetchApi(`InformationSystems/${id}/details`, {
        method: "GET",
        headers: {},
    })
    return data;
}

export const createInfSystem = async(infSysRequets : InformationSystemRequest) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5295/api/InformationSystems', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify( infSysRequets),
    });
};

export const updateInfSystem = async(id: string, infSysRequets : InformationSystemRequest) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5295/api/InformationSystems/${id}/edit-with-attributes`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify( infSysRequets),
    })
}

export const deleteInfSystem = async(id: string) => {
    await fetchApi(`InformationSystems/${id}`, {
        method: "DELETE",
        headers: {},
    })
    return true;
}