if (!localStorage.getItem("user")) {
    window.location.href = "/public/landing.html";
}
import { API } from "./api.js";

// Sélection DOM existante
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const tbody = document.querySelector(".list-groups");
const panel_add_group = document.getElementById("panel-add-group");
const bg_add_group = document.getElementById("bg-add-group");
const btn_close_panel = document.getElementById("btn-close-panel");

// DOM Affectation Membre
const panel_assign = document.getElementById("panel-assign-member");
const bg_assign = document.getElementById("bg-assign-member");
const btn_close_assign = document.getElementById("btn-close-assign");
const btn_cancel_assign = document.getElementById("btn-cancel-assign");
const formAssign = document.getElementById("form-assign-member");
const selectMembers = document.getElementById("assign-user-id");
const inputAssignTontineId = document.getElementById("assign-id-tontine");
const inputOrdre = document.getElementById("assign-ordre");

// DOM Consultation Liste Membres
const panel_view = document.getElementById("panel-view-members");
const bg_view = document.getElementById("bg-view-members");
const btn_close_view = document.getElementById("btn-close-view");
const btn_close_view_footer = document.getElementById("btn-close-view-footer");
const groupMembersList = document.getElementById("group-members-list");
const viewGroupTitle = document.getElementById("view-group-title");

// DOM Formulaire de création Groupe
const nom_tontine = document.getElementById("nom");
const montant = document.getElementById("montant");
const frequence = document.getElementById("frequence"); 
const formGroup = document.getElementById("form-add-group"); 
const btn_add_group = document.getElementById("btn-add-group"); 
const btn_cancel = document.getElementById("btn-cancel");

const panelTitle = document.querySelector(".panel-header h2");
const btnSubmitPanel = document.querySelector('#form-add-group button[type="submit"]');

let idGroupAmodifier = null;
let currentTontineIdForView = null;

btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

function toggle() {
  bg_add_group.classList.toggle("active");
  panel_add_group.classList.toggle("active");
}

function toggleAssign() {
  panel_assign.classList.toggle("active");
  bg_assign.classList.toggle("active");
}

function toggleView() {
  panel_view.classList.toggle("active");
  bg_view.classList.toggle("active");
}

btn_add_group.addEventListener("click", () => {
  idGroupAmodifier = null;
  nom_tontine.value = "";
  montant.value = "";
  frequence.value = "mensuelle";
  panelTitle.textContent = "Créer Un Groupe";
  btnSubmitPanel.textContent = "Créer un Groupe";
  toggle();
});

btn_cancel.addEventListener("click", toggle);
btn_close_panel.addEventListener("click", toggle);
bg_add_group.addEventListener("click", toggle);

btn_cancel_assign.addEventListener("click", toggleAssign);
btn_close_assign.addEventListener("click", toggleAssign);
bg_assign.addEventListener("click", toggleAssign);

btn_close_view.addEventListener("click", toggleView);
btn_close_view_footer.addEventListener("click", toggleView);
bg_view.addEventListener("click", toggleView);

async function chargerMembresOptions() {
    try {
        const membres = await API.get("/members");
        selectMembers.innerHTML = '<option value="">-- Choisir un membre --</option>';
        membres.forEach(m => {
            selectMembers.innerHTML += `<option value="${m.user_id}">${m.nom}</option>`;
        });
    } catch (error) {
        console.error("Erreur de chargement des membres :", error);
    }
}

async function chargerMembresDuGroupe(id_tontine) {
    try {
        const membres = await API.get(`/groups/${id_tontine}/members`);
        groupMembersList.innerHTML = "";

        if(membres.length === 0) {
            groupMembersList.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:15px;">Aucun membre inscrit.</td></tr>`;
            return;
        }

        membres.forEach(m => {
            groupMembersList.innerHTML += `
                <tr>
                    <td style="font-weight:bold; padding:12px;">N° ${m.ordre_beneficiaire}</td>
                    <td style="padding:12px;">${m.nom}</td>
                    <td style="padding:12px;">
                        <button class="btn-remove-member" data-userid="${m.user_id}" style="background:none; border:none; color:#E74C3C; cursor:pointer; font-size:18px;">
                            <i class='bx bx-user-minus'></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erreur de récupération de la liste des membres du groupe :", error);
    }
}

async function charger_groups() {
  try {
    const groups = await API.get("/groups");
    tbody.innerHTML = "";

    groups.forEach((groupe) => {
      let ligne = `
             <tr>
             <td> ${groupe.id_tontine}</td>
             <td> ${groupe.nom}</td>
             <td> ${new Intl.NumberFormat('fr-FR').format(groupe.montant)} FCFA</td>
             <td style="text-transform: capitalize;"> ${groupe.frequence}</td>
             <td>
              <button class="btn-primary btn-add-user" data-id="${groupe.id_tontine}" style="padding: 6px 10px; font-size: 12px; background-color: #2ECC71; border-color: #2ECC71;">
                <i class='bx bx-user-plus'></i>
              </button>
              <button class="btn-secondary btn-view-users" data-id="${groupe.id_tontine}" data-nom="${groupe.nom}" style="padding: 6px 10px; font-size: 12px; color: #3498DB; border-color: #3498DB; background: transparent;">
                <i class='bx bx-show'></i>
              </button>
              <button class="btn-edit" data-id="${groupe.id_tontine}" data-nom="${groupe.nom}" data-montant="${groupe.montant}" data-frequence="${groupe.frequence}" style="padding: 6px 10px; font-size: 12px;">
                <i class='bx bx-edit-alt'></i>
              </button>
              <button class="btn-delete" data-id="${groupe.id_tontine}" style="padding: 6px 10px; font-size: 12px; background-color: #E74C3C; border-color: #E74C3C;">
                <i class='bx bx-trash'></i>
              </button>
             </td>
             </tr>
            `;
      tbody.innerHTML += ligne;
    });
  } catch (error) {
    console.error("Erreur de connexion au backend :", error);
  }
}

tbody.addEventListener("click", async (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  if (target.classList.contains("btn-delete")) {
    const id_group = target.dataset.id;
    if (confirm("Voulez-vous supprimer ce groupe ?")) {
      try {
        await API.delete("/groups/" + id_group);
        charger_groups();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Impossible de supprimer le groupe.");
      }
    }
  }

  if (target.classList.contains("btn-edit")) {
    nom_tontine.value = target.dataset.nom;
    montant.value = target.dataset.montant;
    frequence.value = target.dataset.frequence;
    idGroupAmodifier = target.dataset.id;

    panelTitle.textContent = "Modifier le Groupe";
    btnSubmitPanel.textContent = "Enregistrer";
    toggle();
  }

  if (target.classList.contains("btn-add-user")) {
      inputAssignTontineId.value = target.dataset.id;
      inputOrdre.value = "";
      await chargerMembresOptions();
      toggleAssign();
  }

  if (target.classList.contains("btn-view-users")) {
      currentTontineIdForView = target.dataset.id;
      viewGroupTitle.textContent = `Membres - ${target.dataset.nom}`;
      await chargerMembresDuGroupe(currentTontineIdForView);
      toggleView();
  }
});

groupMembersList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".btn-remove-member");
    if (!btn) return;
    const user_id = btn.dataset.userid;

    if (confirm("Désinscrire ce membre de la tontine ?")) {
        try {
            await API.delete(`/groups/${currentTontineIdForView}/members/${user_id}`);
            await chargerMembresDuGroupe(currentTontineIdForView);
        } catch (error) {
            alert("Erreur lors du retrait du membre.");
        }
    }
});

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

    try {
      if (idGroupAmodifier !== null) {
        await API.put("/groups/" + idGroupAmodifier, group_data);
      } else {
        await API.post("/groups", group_data);
      }

      nom_tontine.value = "";
      montant.value = "";
      frequence.value = "";
      idGroupAmodifier = null;
      toggle();
      charger_groups();
    } catch (error) {
      console.error("Erreur serveur :", error);
    }
  }
});

formAssign.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        id_tontine: parseInt(inputAssignTontineId.value),
        user_id: parseInt(selectMembers.value),
        ordre_beneficiaire: parseInt(inputOrdre.value)
    };

    try {
        await API.post("/members/add-to-group", payload);
        alert("Membre inscrit au groupe avec succès !");
        toggleAssign();
    } catch (error) {
        alert("Erreur : Ce membre est déjà enregistré dans cette tontine.");
    }
});

charger_groups();