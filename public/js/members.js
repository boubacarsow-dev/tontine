import { API } from "./api.js";

const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const btn_add_member = document.getElementById("btn-add-member");
const panel_add_member = document.getElementById("panel-add-member");
const bg_add_member = document.getElementById("bg-add-member");
const btn_close_panel = document.getElementById("btn-close-panel");
const btn_cancel = document.getElementById("btn-cancel");
const submit = document.getElementById("form-add-member");
const nom = document.getElementById("nom");
const telephone = document.getElementById("telephone");
const tbody = document.querySelector(".list-members");

const panelTitle = document.querySelector('.panel-header h2');
const btnSubmitPanel = document.querySelector('#form-add-member button[type="submit"]');

let idMembreAmodifier = null;

btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

function toggle() {
  panel_add_member.classList.toggle("active");
  bg_add_member.classList.toggle("active");
}

btn_add_member.addEventListener("click", () => {
  idMembreAmodifier = null; 
  nom.value = "";
  telephone.value = "";
  panelTitle.textContent = "Nouveau Membre";
  btnSubmitPanel.textContent = "Ajouter le membre";
  toggle();
});

btn_cancel.addEventListener("click", toggle);
btn_close_panel.addEventListener("click", toggle);
bg_add_member.addEventListener("click", toggle);

async function charger_membres() {
  try {
    const membresDb = await API.get("/members");
    tbody.innerHTML = ""; 

    membresDb.forEach((membre) => {
      let dateObj = new Date(membre.date_creation);
      let dateFormatee = dateObj.toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

      let ligne = `
        <tr>
            <td>${membre.user_id}</td> 
            <td>${membre.nom}</td>
            <td>${membre.telephone}</td>
            <td style="text-transform: capitalize;">${dateFormatee}</td>
            <td><span class="badge badge-active">Actif</span></td>
            <td>
                <button class="btn-edit" data-id="${membre.user_id}" data-nom="${membre.nom}" data-tel="${membre.telephone}">Modifier</button>
                <button class="btn-delete" data-id="${membre.user_id}">Supprimer</button>
            </td>
        </tr>
      `;
      tbody.innerHTML += ligne;
    });
  } catch (error) {
    console.error("Erreur de connexion au backend :", error);
  }
}

charger_membres(); 

tbody.addEventListener('click', async (event) => {
  
  if(event.target.classList.contains('btn-delete')){
    const id_membre = event.target.dataset.id;
    
    if (confirm("Es-tu sûr de vouloir supprimer ce membre ?")) {
        try {
          await API.delete('/members/' + id_membre);
          charger_membres(); 
        } catch (error) {
          console.error("Erreur lors de la suppression :", error);
        }
    }
  }

  if(event.target.classList.contains('btn-edit')){
    const id = event.target.dataset.id;
    const nomMembre = event.target.dataset.nom;
    const telMembre = event.target.dataset.tel;

    nom.value = nomMembre;
    telephone.value = telMembre;
    
    idMembreAmodifier = id;

    panelTitle.textContent = "Modifier le Membre";
    btnSubmitPanel.textContent = "Mettre à jour";

    toggle(); 
  }
});

submit.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  let nom_entre = nom.value;
  let tel_entre = telephone.value;
  
  if (nom_entre !== "" && tel_entre.length !== 0) {
    let user_data = {
      nom: nom_entre,
      telephone: tel_entre,
    };
    
    try {
      if (idMembreAmodifier !== null) {
        await API.put("/members/" + idMembreAmodifier, user_data);
      } else {
        await API.post("/members", user_data);
      }

      nom.value = "";
      telephone.value = "";
      idMembreAmodifier = null;
      panelTitle.textContent = "Nouveau Membre";
      btnSubmitPanel.textContent = "Ajouter le membre";
      
      toggle();
      charger_membres(); 
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  }
});