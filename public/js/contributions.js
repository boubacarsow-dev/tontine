if (!localStorage.getItem("user")) {
    window.location.href = "/public/landing.html";
}
import { API } from "./api.js";

// Sélections DOM
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const tbody = document.querySelector(".list-contributions");
const panel = document.getElementById("panel-add-cotisation");
const bg_overlay = document.getElementById("bg-add-cotisation");
const btn_add = document.getElementById("btn-add-cotisation");
const btn_close = document.getElementById("btn-close-panel");
const btn_cancel = document.getElementById("btn-cancel");
const form = document.getElementById("form-add-cotisation");

// Éléments du formulaire
const selectCycle = document.getElementById("id_cycle");
const selectUser = document.getElementById("user_id");
const inputMontant = document.getElementById("montant");

if (btnMenuMobile) {
  btnMenuMobile.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

function togglePanel() {
    panel.classList.toggle("active");
    bg_overlay.classList.toggle("active");
}

// Événements d'ouverture et fermeture
if (btn_add) {
    btn_add.addEventListener("click", async () => {
        inputMontant.value = "";
        await chargerListesOptions();
        togglePanel();
    });
}

if (btn_close) btn_close.addEventListener("click", togglePanel);
if (btn_cancel) btn_cancel.addEventListener("click", togglePanel);
if (bg_overlay) bg_overlay.addEventListener("click", togglePanel);

// Charger les options (cycles et membres) dans le formulaire
async function chargerListesOptions() {
    try {
        const cycles = await API.get("/cycles");
        selectCycle.innerHTML = '<option value="">-- Choisir un cycle --</option>';
        cycles.forEach(c => {
            if (c.statut === 'ouvert') {
                selectCycle.innerHTML += `<option value="${c.id_cycle}">${c.nom}</option>`;
            }
        });

        const membres = await API.get("/members");
        selectUser.innerHTML = '<option value="">-- Choisir un membre --</option>';
        membres.forEach(m => {
            selectUser.innerHTML += `<option value="${m.user_id}">${m.nom}</option>`;
        });
    } catch (error) {
        console.error("Erreur de chargement des options :", error);
    }
}

// Charger l'historique des cotisations
async function chargerCotisations() {
    try {
        const cotisations = await API.get("/contributions");
        tbody.innerHTML = "";

        if (cotisations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 15px;">Aucune cotisation enregistrée.</td></tr>`;
            return;
        }

        cotisations.forEach(cotis => {
            let dateObj = new Date(cotis.date_paiement);
            let dateFormatee = dateObj.toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric"
            });

            // Remplace la ligne correspondante dans la boucle de public/js/contributions.js par :
let ligne = `
    <tr>
        <td>#${cotis.id_cotisation}</td>
        <td style="font-weight: bold; color: #2ECC71;">${new Intl.NumberFormat('fr-FR').format(cotis.montant)} FCFA</td>
        <td>${dateFormatee}</td>
        <td>${cotis.nom_membre}</td> <td>${cotis.nom_cycle}</td>   </tr>
`;
            tbody.innerHTML += ligne;
        });
    } catch (error) {
        console.error("Erreur d'affichage des cotisations :", error);
    }
}

// Envoyer la cotisation au backend
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            montant: parseFloat(inputMontant.value),
            user_id: parseInt(selectUser.value),
            id_cycle: parseInt(selectCycle.value)
        };

        try {
            await API.post("/contributions", data);
            alert("Cotisation enregistrée avec succès !");
            togglePanel();
            await chargerCotisations();
        } catch (error) {
            alert("Erreur : Ce membre a déjà cotisé pour ce cycle.");
        }
    });
}

// Initialisation
chargerCotisations();