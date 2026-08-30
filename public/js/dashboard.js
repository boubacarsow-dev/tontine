if (!localStorage.getItem("user")) {
    window.location.href = "/public/landing.html";
}
import { API } from "./api.js";

const statMembres = document.getElementById("stat-membres");
const statCaisse = document.getElementById("stat-caisse");
const statCycles = document.getElementById("stat-cycles");
const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");

// Gestion du menu mobile
if (btnMenuMobile) {
  btnMenuMobile.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// Récupération des données depuis ton backend route /statistiques
async function chargerDashboard() {
  try {
    const stats = await API.get("/statistiques");
    
    statMembres.textContent = stats.total_membres || 0;
    // Formatage propre pour les montants en FCFA
    statCaisse.textContent = `${new Intl.NumberFormat('fr-FR').format(stats.argent_en_caisse || 0)} FCFA`;
    statCycles.textContent = stats.cycles_termines || 0;
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques :", error);
  }
}

chargerDashboard();