import { API } from './api.js';
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

//selecteurs
const btn_add_member = document.getElementById("btn-add-member");
const panel_add_member = document.getElementById("panel-add-member");
const bg_add_member = document.getElementById("bg-add-member");
const btn_close_panel = document.getElementById("btn-close-panel");
const btn_cancel = document.getElementById("btn-cancel");
const submit = document.getElementById('form-add-member');
const nom = document.getElementById('nom');
const telephone = document.getElementById('telephone');
const tbody = document.querySelector('.list-members');
//fonction pour ouverture et fermeture
function toggle() {
  panel_add_member.classList.toggle("active");
  bg_add_member.classList.toggle("active");
}

//ecouteurs
btn_add_member.addEventListener("click", () => {
  toggle();
});

btn_cancel.addEventListener("click", () => {
  toggle();
});
btn_close_panel.addEventListener("click", () => {
  toggle();
});
bg_add_member.addEventListener("click", () => {
  toggle();
});

//capturer le clic sur le submit
 submit.addEventListener('submit', async(event)=>{
    event.preventDefault();
    let nom_entre = nom.value;
    let tel_entre = telephone.value;
    if(nom_entre !== '' && tel_entre.length !== 0){
        let user_data = {
        nom:nom_entre,
        telephone:tel_entre
    };
     try {
         await API.post('/members',user_data);
            nom.value ='';
            telephone.value ='';
            toggle();
            charger_membres()
     } catch (error) {
        console.error("Erreur réseau :", error);
     }
   
    }
 });

//  charger les members donc un get
 async function charger_membres() {
   
    try {
        const membresDb = await API.get('/members')
        tbody.innerHTML = '';
        membresDb.forEach((membre,index) => {
           let dateObj = new Date(membre.date_creation);
        let dateFormatee = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',  
        month: 'long', 
        year: 'numeric' 
    });
            let ligne = `
             <tr>
                    <td>${membre.user_id}</td> <td>${membre.nom}</td>
                    <td>${membre.telephone}</td>
                     <td style="text-transform: capitalize;">${dateFormatee}</td>
                    <td><span class="badge badge-active">Actif</span></td>
                    <td> DEL</td>
                </tr>
            `;
            tbody.innerHTML += ligne;

        });
    } catch (error) {
        console.error("Erreur de connexion au backend :", error);
    }
 };
 charger_membres(); //je t'appelle