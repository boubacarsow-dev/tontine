import { API } from "./api.js";

//selection DOM
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const tbody = document.querySelector(".list-groups");
const panel_add_group = document.getElementById("panel-add-group");
const bg_add_group = document.getElementById("bg-add-group");
const btn_close_panel = document.getElementById("btn-close-panel");

//DOM du formulaire
const nom_tontine = document.getElementById("nom");
const montant = document.getElementById("montant");
const frequence = document.getElementById("frequence"); // un select
const formGroup = document.getElementById("form-add-group"); //creer le groupe
const btn_add_group = document.getElementById("btn-add-group"); // creer group
const btn_cancel = document.getElementById("btn-cancel");

//
const panelTitle = document.querySelector(".panel-header h2");
const btnSubmitPanel = document.querySelector(
  '#form-add-group button[type="submit"]',
);
// memory
let idGroupAmodifier = null;

//travail

btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

function toggle() {
  bg_add_group.classList.toggle("active");
  panel_add_group.classList.toggle("active");
}

//
btn_add_group.addEventListener("click", () => {
  idGroupAmodifier = null;
  nom_tontine.value = "";
  montant.value = "";
  frequence.value = "";
  panelTitle.textContent = "Creer Un Groupe";
  btnSubmitPanel.textContent = "Creer un Groupe";

  toggle();
});

//
btn_cancel.addEventListener("click", toggle);
btn_close_panel.addEventListener("click", toggle);
bg_add_group.addEventListener("click", toggle);

//

async function charger_groups() {
  try {
    const groups = await API.get("/groups");
    tbody.innerHTML = "";

    groups.forEach((groupe) => {
      let ligne = `
             <tr>
             <td> ${groupe.id_tontine}</td>
             <td> ${groupe.nom}</td>
             <td> ${groupe.montant}</td>
             <td> ${groupe.frequence}</td>
             
             <td>
              <button class="btn-edit" data-id="${groupe.id_tontine}" data-nom="${groupe.nom}" data-montant="${groupe.montant}" data-frequence="${groupe.frequence}"> modifier
              </button>

              <button class="btn-delete" data-id="${groupe.id_tontine}"> supprimer</button>
             </td>
             
             </tr>
            `;

      tbody.innerHTML += ligne;
    });
  } catch (error) {
    console.error("Erreur de connexion au backend :", error);
  }
}

charger_groups();

//delete
tbody.addEventListener("click", async (event) => {
  if (event.target.classList.contains("btn-delete")) {
    const id_group = event.target.dataset.id;
    if (confirm("voulez vous supprimer?")) {
      try {
        await API.delete("/groups/" + id_group);
        charger_groups();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Impossible de supprimer le groupe.");
      }
    }
  }

  //

  if (event.target.classList.contains("btn-edit")) {
    const id = event.target.dataset.id;
    const nomTontine = event.target.dataset.nom;
    const montant_tontine = event.target.dataset.montant;
    const frequence_tontine = event.target.dataset.frequence;

    
    nom_tontine.value = nomTontine;
    montant.value = montant_tontine;
    frequence.value = frequence_tontine;

    idGroupAmodifier = id;

    panelTitle.textContent = "Modifier le Groupe";
    btnSubmitPanel.textContent = "Enregistrer";

    toggle();
  }
});

//submit form

formGroup.addEventListener("submit", async (e) => {
  e.preventDefault();
  let nom_entre = nom_tontine.value;
  let montant_entre = montant.value;
  let frequence_entre = frequence.value;

  if (nom_entre !== "" && montant_entre !== "" && frequence_entre !== "") {
    let group_data = {
      nom: nom_entre,
      montant: montant_entre,
      frequence: frequence_entre,
    };

    //
    try {
      if (idGroupAmodifier !== null) {
        //modif
        await API.put("/groups/" + idGroupAmodifier, group_data);
      } else {
        // creons
        await API.post("/groups", group_data);
      }

      nom_tontine.value = "";
      montant.value = "";
      frequence.value = "";
      idGroupAmodifier = null;

      panelTitle.textContent = "Nouveau Groupe";
      btnSubmitPanel.textContent = "Créer le groupe";

      toggle();
      charger_groups();
    } catch (error) {
      console.error("Erreur serveur :", error);
    }
  }
});