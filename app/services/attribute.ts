import fetchApi from "../utils/api";

export interface AttributeRequest {
    id: number;
    name: string;
}
export interface AttributeWithTypeRequest {
    id: number;
    name: string;
    dataType: string;
}


export const getAllAttribute = async () => {
    const data = await fetchApi('Attribute', {
        method: "GET",
        headers: {},
    });
    return data;
    
};

export const createAttribute = async(atrRequets : AttributeWithTypeRequest) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5295/api/Attribute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(atrRequets),
    });
};

export const updateAttribute = async(id: string, atrRequets : AttributeRequest) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5295/api/Attribute/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify( atrRequets),
    })
}

export const deleteAttribute = async(id: string) => {
    await fetchApi(`Attribute/${id}`, {
        method: 'DELETE',
        headers: {},
    });
    return true;
}