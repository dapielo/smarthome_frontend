import {login} from './api.js';

/**
 * 
 * @param {JSON} user 
 * @returns Boolean : true si las credenciales son correctas y se almacena el token, false de lo contario
 */
const autenticarse = async (user) => {
    try {
        const token = await login(user);
        const username = user.username;
        const credenciales = {
            'user':user.username,
            'token':token
        }
        localStorage.setItem('credenciales',JSON.stringify(credenciales));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

/**
 * 
 * @returns true si esta autenticado, false si no lo está
 */
const isAuthenticated = () => {
    if (localStorage.getItem('credenciales')){
        return true;
    }
    return false;
}

/**
 * 
 * @returns true si esta autenticado y es admin, false en cualquier otro caso
 */
const isAdmin = () => {
    const credenciales = JSON.parse(localStorage.getItem('credenciales'));
    if (credenciales){
        return credenciales.user === 'admin';
    }
    return false
}

/**
 * 
 * @returns token si se ha autenticado, '' si no
 */
const getToken = () => {
    const credenciales = JSON.parse(localStorage.getItem('credenciales'));
    if (credenciales){
        return credenciales.token;
    }
    return '';
}

const descartarToken = () => {
    localStorage.removeItem('credenciales');
}

export {autenticarse, login, isAuthenticated, isAdmin, getToken, descartarToken}