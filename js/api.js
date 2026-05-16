import {getToken, descartarToken} from './auth.js';

const BASE_URL = 'http://localhost:8080/api';

// El login devuelve un JSON con un capo 'token' si la peticion es correcta, 
// el usuario 'admin' tiene contraseña 1234 y el usuario 'user' tiene contraseña 0000
const login = async (user) => {
    const response = await fetch(`${BASE_URL}/auth/login`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(user)
    });
    const data = await response.json();

    if (!response.ok){
        console.log(data);
        throw data;
    }
    return data.token;
}

// me devuelve un JSON Array con los devices, si hay un error en el servidor, este me devuelve un json con:
// - mensaje de error
// - codigo de error
// - fecha y hora
// - ruta donde ocurrio el error
// de modo que si response.ok == false, lanzo ese JSON para arriba para que se gestione el JSON de error en app
const getDevices = async () => {
    const token = getToken();
    let headers = {};
    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/devices`,{
        headers
    });
    const data = await response.json();

    if (!response.ok) {
        throw data;
    }
    // Si el error es 401 (Unauthorized) es porque el token esta caducado
    if (response.status === 401){
        descartarToken()
    }
    return data;
}

// enviamos un JSON valido y registra el device, nos devuelve un JSON con los datos del nuevo device
const postDevice = async (formData) => {
    const token = getToken();
    let headers = {};
    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/devices`,{
        method:'POST',
        headers,
        body:formData
    });
    const data = await response.json();

    if (!response.ok){
        console.log(data);
    }
    // Si el error es 403 es poruqe no tiene permisos para realizar esa accion con el token actual
    if (response.status === 403){
        alert("No tienes permisos para realizar esa acción");
    }

    if (response.status === 401){
        descartarToken();
    }
    return data;
}

// Enviamos el id con el metodo patch para cambiar entre encendido y apagado, el servidor nos devuelve el device modificado
const toggleStatus = async (id) => {
    const token = getToken();
    const headers = {};
    if (token){
        headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${BASE_URL}/devices/${id}`,{
        method:'PATCH',
        headers
    });
    const data = await response.json();

    if (!response.ok){
        console.log(data);
    }

    if (response.status === 401){
        descartarToken()
    }
    return data;
}

// Enviamos el id con el metodo delete, el servidor nos devuelve un JSON de error si no existe un dispositivo que borrar con ese id
const deleteDevice = async (id) => {
    const token = getToken();
    const headers = {};
    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/devices/${id}`,{
        method:'DELETE',
        headers
    });
  
    if (!response.ok){
        console.log(error);
        return response.json();
    }

    if (response.status === 401){
        descartarToken()
    }

    if (response.status === 403){
        alert("No tienes permisos para realizar esa acción")
    }
}

const getImage = (fileName) => {
    return `${BASE_URL}/devices/files/${fileName}`;
}

const putDevice = async (formData, id) => {
    const token = getToken();
    let headers = {};
    if (token){
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/devices/${id}`,{
        method:"PUT",
        headers,
        body:formData
    });
    const data = await response.json();
    if (!response.ok){
        throw data;
    }
    return data;
}

export {getDevices, postDevice, deleteDevice, putDevice, toggleStatus, login, getImage}
