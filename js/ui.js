import * as api from './api.js';
import * as auth from './auth.js';

const main = document.querySelector('main');
// Templates
const templateLogin = document.querySelector("#template-login");
const templateDevice= document.querySelector("#template-device");
const templateAdd = document.querySelector('#add-device');

const renderDevice = (device) => {
    actualizarLogout();
    const newDevice = templateDevice.content.cloneNode(true).firstElementChild;
    // metemos el id en el contenedor general, luego lo podemos venir a buscar si salta un evento en un boton
    newDevice.dataset.deviceId = device.id;
    newDevice.querySelector(".device-name").textContent = device.name;
    newDevice.querySelector(".device-type").textContent = device.type;
    newDevice.querySelector(".device-category").textContent = device.category;
    newDevice.querySelector(".device-location").textContent = device.location;
    newDevice.querySelector(".device-brand").textContent = device.brand;
    newDevice.querySelector(".device-model").textContent = device.model;
    newDevice.querySelector(".device-status").textContent = device.status;
    newDevice.querySelector(".device-status-detail").textContent = device.statusDetail;
    newDevice.querySelector(".device-created-at").textContent = device.createdAt;
    newDevice.querySelector(".device-last-updated").textContent = device.lastUpdated;
    newDevice.querySelector(".device-last-modified-by").textContent = device.lastModifiedBy;
    const imagenLabel = newDevice.querySelector("img");
    // Ahora vamos a insertar la imagen si la tiene y si no la tiene vamos a borrar la etiqueta
    if (device.foto){
        imagenLabel.src = api.getImage(device.foto);
    } else {
        imagenLabel.remove();
    }

    // Si el usuario no es admin, ocultamos el boton de borrar
    if (!auth.isAdmin()) {
        newDevice.querySelector('.btn-warn').classList.add('hidden');
    }
    return newDevice;
}

const renderList = async () => {

    actualizarLogout();
    const listaDevices = document.createDocumentFragment();

    // Si no esta auntenticado, mostramos un mensaje al usuario para advertirlo de que se tiene que registrar
    if (!auth.isAuthenticated()){
        const titulo = document.createElement('h1');
        titulo.textContent = 'No estás autenticado, ve al apartado de login.';
        main.textContent = '';
        main.append(titulo);
        return;
    }
    let devices = null;
    // Intentamos obtener el listado de devices, si hay un error, mostramos mensaje y salimos
    try {
        devices = await api.getDevices();
    } catch (error) {
        const mensaje = document.createElement('h1');
        const contenedor = document.createElement('div');
        const boton = document.createElement('button');
        mensaje.textContent = 'Necesitas iniciar sesion para ver los dispositivos';
        contenedor.classList.add('center-buttons');
        boton.textContent = 'RECARGAR'
        boton.className = 'btn btn-ok';
        boton.addEventListener('click', () => {
            window.location.pathname = '/';
        });

        contenedor.append(boton);
        main.textContent = '';
        main.append(mensaje,contenedor);

        return;
    }

    // Si el listado esta vacío, lo confirmamos con un mensaje que permita el usuario ver que no hay errores
    if (!devices){
        const mensaje = document.createElement('h1');
        mensaje.textContent = 'No hay dispositivos reguistrados aún';
        main.textContent = '';
        main.append(mensaje);
        return;
    }

    // Si no ha ocurrido ningun error y el listado de devices no esta vacio:
    const titulo = document.createElement('h1');
    titulo.textContent = 'Panel de control de SmartHome';
    listaDevices.append(titulo);

    devices.forEach(device => {
        // Añadimos el elemento a la lista
        listaDevices.append(renderDevice(device));
    });

    // Añadimos la lista a main, devolvemos la lista (es un documentFragment) para usarla en app sin volver a pedirsela al servidor
    main.textContent = '';
    main.append(listaDevices.cloneNode(true));

    return listaDevices;
}
/**
 * 
 * @param {String} mensaje mensaje de error por si reenviamos al usuario al formulario de login por falta de credenciales para hacer peticiones al servidor
 */
const renderLoginForm = (mensaje) => {

    actualizarLogout();
    const loginForm = templateLogin.content.cloneNode(true);
    const botonLoginSubmit = loginForm.querySelector("#btn-login-submit");
    const usernameInput = loginForm.querySelector("#form-username");
    const passwordInput = loginForm.querySelector("#form-password");

    if (mensaje) {
        loginForm.querySelector('.error-message').textContent = mensaje;
    }

    // Botón de enviar credenciales en el formulario de login
    botonLoginSubmit.addEventListener("click", async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const mensajeLoginForm = main.querySelector(".error-message");
        if (username && password) {
            const user = {
                "username": username,
                "password": password
            }
            if (!await auth.autenticarse(user)) {
                mensajeLoginForm.textContent = "Las credenciales no son correctas";
            } else {
                await renderList();
                history.pushState(null, "", "/");
            }
        }
    });

    // Lo metemos en el main
    main.textContent = '';
    main.append(loginForm);
}

const renderAddForm = async () => {
    const addForm = templateAdd.content.cloneNode(true);
    main.textContent = '';
    main.append(addForm);
    const botonEnviar = main.querySelector('.btn-enviar');
    const buttonBorrar = main.querySelector('.btn-borrar');

    botonEnviar.addEventListener("click", async (e) => {
        e.preventDefault();
        const form = main.querySelector('.form-add-device');
        const mensaje = main.querySelector("#message-add-form");
        // Si no es admin o no esta registrado el formulario no va a siquiera cargar, solo comprobamos que el nombre no este vacio porque es el
        // único campo obligatorio para el servidor
        const data = new FormData(form);

        if (data.get('name') == ''){
            mensaje.innerHTML = 'El campo nombre es obligatorio';
            return null;
        }

        try{
            await api.postDevice(data);
            renderList()
        } catch (error) {
            console.log(error);
            mensaje.textContent = JSON.parse(error).mensaje;
        }    
    });

}

const actualizarLogout = () => {
    try{
        const username = JSON.parse(localStorage.getItem('credenciales')).user;
        document.querySelector("#logout").classList.remove('hidden');
        document.querySelector('#logout a').textContent = `${username} (logout)`;
    } catch (error) {
        document.querySelector('#logout').classList.add('hidden');
    }
}

export {renderList, renderDevice, renderLoginForm, renderAddForm, actualizarLogout};

