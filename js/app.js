import * as api from './api.js';
import * as auth from './auth.js';
import * as ui from './ui.js';

// Botones
const botonLogin = document.querySelector("#btn-login");
const botonDevices = document.querySelector("#btn-devices");
const botonAdd = document.querySelector('#btn-add');
const botonLogout = document.querySelector('#logout');
// Contenido
const main = document.querySelector("main");
// Dialog
const dialog = document.querySelector("dialog");
// Lista local
let cachedDevices = null;

// Si no hay token, vamos al formulario de login
if (!auth.getToken()){
    ui.renderLoginForm("Inicia sesión para poder gestionar los dispositivos");
    history.pushState(null,'',"/login");
}

// Si hay token almacenamos el listado de devices cuando cambiamos el main por alguno de los formularios
if (auth.getToken()){
    cachedDevices = await ui.renderList();
}

// Boton Login del nav
botonLogin.addEventListener("click",(evt) => {
    evt.preventDefault();
    // Si estabamos en la raiz, guardamos el listado de devices e un documentFragment
    ui.renderLoginForm();
    history.pushState(null,"","/login");
});

// Boton dispositivos del nav
botonDevices.addEventListener("click", async () => {
    // Borramos el main antes de volver a meter el listado de dispositivos
    main.textContent = '';
    // Si el listado local esta vacio, lo rellenamos haciendo llamada a renderList
    if (!cachedDevices){
        cachedDevices = await ui.renderList();
    }
    if (cachedDevices){
        main.append(cachedDevices.cloneNode(true));
    }
    // Cambiamos la ruta a la raíz
    history.pushState(null,"","/");
});

// Botón añadir del nav
botonAdd.addEventListener("click", async () => {
    // Si no tiene permisos para añadir, reenviamos el formulario de login con un mensaje 
    if (!auth.isAuthenticated() || !auth.isAdmin()){
        ui.renderLoginForm("Para añadir un dispositivo antes tienes que estar registrado como admin");
        history.pushState(null,"","/login");
        return;
    }
    history.pushState(null,'','/add');
    ui.renderAddForm();
});

// Boton de logout
botonLogout.addEventListener('click', () => {
    auth.descartarToken();
    ui.actualizarLogout();
    history.pushState(null,'',"/login");
    ui.renderLoginForm();
    // Esto rompe el principio de SPA, pero esta app me esta quedando tan compleja y esta todo tan mal estructurado ahora mismo no me da la cabeza 
    // para seguir con el patron de no repetir peticiones al servidor 
    actualizarCache(); 
});

const actualizarCache = async () => {
    cachedDevices = null;
}

// Ahora añadimos los eventListeners para los botones de encender y borrar del listado
// ESTO AHORA TENDRIA QUE SER UN SOLO EVENT LISTENER QUE COMPRUEBE TAMBIEN LOS BOTONES DEL NAV PERO ME DA MUCHA PEREZA CAMBIARLO
main.addEventListener("click", async (e) => {
    e.preventDefault();
    const boton = e.target;
    const card = boton.closest('.card');

    // Si es el boton de encender/apagar, hacemos la peticion y reemplazamos la tarjeta
    if (boton.classList.contains('btn-encender')) {
        const id = boton.closest('.card').dataset.deviceId;
        const deviceCambiado = await api.toggleStatus(id);
        card.replaceWith(ui.renderDevice(deviceCambiado));
    }

    // Si es el boton de eliminar, lo borramos del servidor y lo borramos de la lista
    if (boton.classList.contains('btn-borrar') && auth.isAdmin()) {
        if (confirm(`Seguro que quieres borrar el dispositivo ${card.querySelector(".device-name").textContent}`)) {
            const id = boton.closest('.card').dataset.deviceId;
            api.deleteDevice(id);
            card.remove();
        }
    }

    // Si es el boton de editar, mostramos el dialog
    if (boton.classList.contains('btn-editar')) {
        const card = boton.closest('.card');
        dialog.querySelector('#id').value = card.dataset.deviceId;
        dialog.querySelector('#name').value = card.querySelector(".device-name").textContent;
        dialog.querySelector('#type').value = card.querySelector(".device-type").textContent;
        dialog.querySelector('#category').value = card.querySelector(".device-category").textContent; 
        dialog.querySelector('#location').value = card.querySelector(".device-location").textContent; 
        dialog.querySelector('#brand').value = card.querySelector(".device-brand").textContent; 
        dialog.querySelector('#model').value = card.querySelector(".device-model").textContent; 

        dialog.showModal();
    }

});

// Botones del dialog
dialog.addEventListener('click', async (e) => {
    e.preventDefault()
    const boton = e.target;
    // Si el boton es el de editar del dialog, hacemos los cambios y la peticion al servidor
    if (boton.classList.contains('btn-dialog-editar')) {
        const id = dialog.querySelector("#id").value;
        const card = [...document.querySelectorAll(".card")].find(card => card.dataset.deviceId == id);
        const data = new FormData(dialog.querySelector(".form-add-device"));
        const updatedDevice = await api.putDevice(data,id);
        console.log(updatedDevice);
        card.replaceWith(ui.renderDevice(updatedDevice));
        dialog.close();
    }

});



