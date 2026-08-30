if (!localStorage.getItem("user")) {
    window.location.href = "/public/landing.html";
}
import { API } from "./api.js";

// Sélection DOM
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const btn_add_cycle = document.getElementById("btn-add-cycle");
const panel_add_cycle = document.getElementById("panel-add-cycle");
const bg_add_cycle = document.getElementById("bg-add-cycle");
const btn_close_panel = document.getElementById("btn-close-panel");
const btn_cancel = document.getElementById("btn-cancel");
const submit = document.getElementById("form-add-cycle");
const tbody = document.querySelector(".list-cycles");

// Formulaire DOM
const nom = document.getElementById("nom");
const id_tontine = document.getElementById("id_tontine");
const statut = document.getElementById("statut");
const id_beneficiaire = document.getElementById("id_beneficiaire");
const group_beneficiaire = document.getElementById("group-beneficiaire");

const panelTitle = document.querySelector(".panel-header h2");
const btnSubmitPanel = document.querySelector(
  '#form-add-cycle button[type="submit"]',
);

let idCycleAmodifier = null;

btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

function toggle() {
  panel_add_cycle.classList.toggle("active");
  bg_add_cycle.classList.toggle("active");
}

btn_add_cycle.addEventListener("click", () => {
  nom.value = "";
  statut.value = "ouvert";
  id_tontine.value = "";
  id_beneficiaire.value = "";
  group_beneficiaire.style.display = "none";
  panelTitle.textContent = "Créer Un Cycle";
  btnSubmitPanel.textContent = "Créer un cycle";
  toggle();
});

btn_cancel.addEventListener("click", toggle);
btn_close_panel.addEventListener("click", toggle);
bg_add_cycle.addEventListener("click", toggle);

async function charger_tontines() {
  try {
    const tontines = await API.get("/groups");
    id_tontine.innerHTML =
      '<option value="">-- Choisir une tontine --</option>';
    tontines.forEach((tontine) => {
      id_tontine.innerHTML += `<option value="${tontine.id_tontine}">${tontine.nom}</option>`;
    });

    const members = await API.get("/members");
    id_beneficiaire.innerHTML =
      '<option value=""> Aucun bénéficiaire pour le moment </option>';
    members.forEach((m) => {
      id_beneficiaire.innerHTML += `<option value="${m.user_id}">${m.nom}</option>`;
    });
  } catch (error) {
    console.error("Erreur lors du chargement des options :", error);
  }
}

async function charger_cycles() {
  try {
    const cycleDb = await API.get("/cycles");
    tbody.innerHTML = "";

    cycleDb.forEach((cycle) => {
      const badgeClass =
        cycle.statut === "Terminé" ? "badge-inactive" : "badge-active";
      const statutLabel = cycle.statut === "Terminé" ? "Terminé" : "Ouvert";

      let ligne = `
<tr>
    <td>${cycle.id_cycle}</td>
    <td>${cycle.nom}</td>
    <td>${cycle.nom_tontine}</td> <td>${cycle.id_beneficiaire ? cycle.nom_beneficiaire : '<span style="color:var(--text-muted); font-size:12px;">Aucun</span>'}</td> <td><span class="${badgeClass}">${statutLabel}</span></td>
    <td>
        <button class="btn-edit" data-id="${cycle.id_cycle}" data-nom="${cycle.nom}" data-tontine="${cycle.id_tontine}" data-statut="${cycle.statut}" data-beneficiaire="${cycle.id_beneficiaire}" style="padding: 6px 10px; font-size: 12px;">
            <i class='bx bx-edit-alt'></i>
        </button>
        <button class="btn-delete" data-id="${cycle.id_cycle}" style="padding: 6px 10px; font-size: 12px; background-color: #E74C3C; border-color: #E74C3C;">
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
  const target = event.target.closest("button");
  if (!target) return;

  if (target.classList.contains("btn-delete")) {
    const idCycle = target.dataset.id;
    if (confirm("Voulez-vous vraiment supprimer ce cycle ?")) {
      try {
        await API.delete("/cycles/" + idCycle);
        charger_cycles();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Impossible de supprimer le cycle.");
      }
    }
  }

  if (target.classList.contains("btn-edit")) {
    nom.value = target.dataset.nom;
    id_tontine.value = target.dataset.tontine;
    statut.value = target.dataset.statut;

    const idBenef = target.dataset.beneficiaire;
    if (idBenef && idBenef !== "null" && idBenef !== "undefined") {
      id_beneficiaire.value = idBenef;
    } else {
      id_beneficiaire.value = "";
    }

    idCycleAmodifier = target.dataset.id;
    group_beneficiaire.style.display = "block";
    panelTitle.textContent = "Modifier le Cycle";
    btnSubmitPanel.textContent = "Enregistrer";
    toggle();
  }
});

submit.addEventListener("submit", async (e) => {
  e.preventDefault();
  let nom_entre = nom.value;
  let tontine_a_entre = id_tontine.value;
  let statut_entre = statut.value;
  let beneficiaire_entre = id_beneficiaire.value;

  if (nom_entre !== "" && tontine_a_entre !== "") {
    let cycle_data = {
      nom: nom_entre,
      id_tontine: tontine_a_entre,
      statut: statut_entre,
    };

    if (beneficiaire_entre !== "") {
      cycle_data.id_beneficiaire = beneficiaire_entre;
    }

    try {
      if (idCycleAmodifier !== null) {
        await API.put("/cycles/" + idCycleAmodifier, cycle_data);
      } else {
        await API.post("/cycles", cycle_data);
      }

      nom.value = "";
      id_tontine.value = "";
      statut.value = "ouvert";
      id_beneficiaire.value = "";
      idCycleAmodifier = null;
      group_beneficiaire.style.display = "none";

      panelTitle.textContent = "Nouveau Cycle";
      btnSubmitPanel.textContent = "Créer le cycle";

      toggle();
      charger_cycles();
    } catch (error) {
      console.error("Erreur serveur :", error);
      alert(
        "Erreur : Vérifie que tout le monde a cotisé pour ce cycle avant de désigner un gagnant.",
      );
    }
  } else {
    alert("Veuillez remplir le nom et choisir une tontine.");
  }
});

charger_tontines();
charger_cycles();
