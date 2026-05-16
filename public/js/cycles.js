import { API } from "./api.js";
//selection d'elemenets

 //DOM
 const btnMenuMobile = document.getElementById("btn-menu-mobile");
const sidebar = document.querySelector(".sidebar");
const btn_add_cycle = document.getElementById("btn-add-cycle");
const panel_add_cycle = document.getElementById("panel-add-cycle");
const bg_add_cycle = document.getElementById("bg-add-cycle");
const btn_close_panel = document.getElementById("btn-close-panel");
const btn_cancel = document.getElementById("btn-cancel");
const submit = document.getElementById("form-add-cycle");
const tbody = document.querySelector(".list-cycles");
// on continue apres
//DOM FORM
 const nom = document.getElementById("nom");
const id_tontine = document.getElementById("id_tontine"); // Le <select>
const statut = document.getElementById("statut");
const id_beneficiaire = document.getElementById("id_beneficiaire"); // Le <select>
const group_beneficiaire = document.getElementById("group-beneficiaire"); // La div à cacher/montrer


// selection du panneau pour les titres
const panelTitle = document.querySelector('.panel-header h2');
const btnSubmitPanel = document.querySelector('#form-add-cycle button[type="submit"]');

// memory
let idCycleAmodifier = null;


btnMenuMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

function toggle() {
  panel_add_cycle.classList.toggle("active");
  bg_add_cycle.classList.toggle("active");
}

//

btn_add_cycle.addEventListener('click', ()=>{
 
    nom.value = '';
    statut.value = 'ouvert';
    id_tontine.value = '';
    id_beneficiaire.value = '';
    group_beneficiaire.style.display = 'none';
    panelTitle.textContent = "Creer Un Cycle";
    btnSubmitPanel.textContent = "creer un cycle";
  toggle();
     
});

 btn_cancel.addEventListener("click", toggle);
btn_close_panel.addEventListener("click", toggle);
bg_add_cycle.addEventListener("click", toggle);

 async function charger_tontines(){
  try {
    const tontines = await API.get('/groups');
    tontines.forEach((tontine)=>{
       id_tontine.innerHTML += `<option value="${tontine.id_tontine}">${tontine.nom}</option>`;
    });
    const members = await API.get('/members');
    members.forEach(m=>{
      id_beneficiaire.innerHTML += `<option value="${m.user_id}"> ${m.nom}</option>`
    })
  } catch (error) {
     console.error("Erreur lors du chargement des menus :", error);
  }
 }

 async function charger_cycles() {
    try {
        const cycleDb = await API.get('/cycles');
        tbody.innerHTML = '';

       cycleDb.forEach((cycle) => {
        let ligne = `
        <tr>
        <td>${cycle.id_cycle}</td>
        <td>${cycle.nom}</td>
        <td>${cycle.id_tontine}</td>
        <td>${cycle.id_beneficiaire}</td>
        
        <td>
                <button class="btn-edit" data-id="${cycle.id_cycle}" data-nom="${cycle.nom}" data-tontine="${cycle.id_tontine}" data-statut="${cycle.statut}"  data-beneficiaire="${cycle.id_beneficiaire}">Modifier</button>
                <button class="btn-delete" data-id="${cycle.id_cycle}">Supprimer</button>
            </td>
            </tr>
        `; 

        tbody.innerHTML += ligne;
       })
       
       
    } catch (error) {
         console.error("Erreur de connexion au backend :", error);
    }
 }
 charger_tontines()
 charger_cycles();

 //
 
 //on va ecouter le tableau
  tbody.addEventListener('click', async (event)=>{
    //supprimer

    if(event.target.classList.contains('btn-delete')){
      const idCycle = event.target.dataset.id;
      if(confirm("vous allez supprimer")){
        try {
          await API.delete('/cycles/' + idCycle);
          charger_cycles();
        } catch (error) {
          console.error("Erreur lors de la suppression :", error);
                alert("Impossible de supprimer le cycle.");
        }
      }
    }

    // modifier
    if(event.target.classList.contains('btn-edit')){
      const id = event.target.dataset.id;
      const nomCycle = event.target.dataset.nom;
      const idTontine = event.target.dataset.tontine;
      const statutCycle = event.target.dataset.statut;
      const idBenef = event.target.dataset.beneficiaire;
      
      nom.value = nomCycle;
      id_tontine.value = idTontine;
      statut.value = statutCycle; 
      
      if(idBenef && idBenef !== "null"){
        id_beneficiaire.value = idBenef;
      }else{
        id_beneficiaire.value = '';
      }
      idCycleAmodifier = id;
      group_beneficiaire.style.display = "block"; 
      
       panelTitle.textContent = "Modifier le Cycle";
        btnSubmitPanel.textContent = "Enregistrer";

        toggle();

    }

    //fin eve
  });

  //bah soumission formul
  submit.addEventListener('submit', async (e)=>{
    e.preventDefault();
    let nom_entre = nom.value;
    let tontine_a_entre = id_tontine.value;
    let statut_entre = statut.value;
    let beneficiaire_entre = id_beneficiaire.value;


    //

    if (nom_entre !== "" && tontine_a_entre !== "") {
        let cycle_data = {
            nom: nom_entre,
            id_tontine: tontine_a_entre,
            statut: statut_entre
        };
        
        //  le bénéficiaire que s'il a été sélectionné
        if (beneficiaire_entre !== "") {
            cycle_data.id_beneficiaire = beneficiaire_entre;
        }

        try {
            if (idCycleAmodifier !== null) {
              //modif
                await API.put("/cycles/" + idCycleAmodifier, cycle_data);
            } else {
                // creons
                await API.post("/cycles", cycle_data);
            }
            //nettoie
            nom.value = "";
            id_tontine.value = "";
            statut.value = "ouvert";
            id_beneficiaire.value = "";
            idCycleAmodifier = null;
            
            // searchons le bénéficiaire pour la prochaine créa
            group_beneficiaire.style.display = "none";
            
            panelTitle.textContent = "Nouveau Cycle";
            btnSubmitPanel.textContent = "Créer le cycle";
            
            toggle();
            charger_cycles(); 
            
        } catch (error) {
            console.error("Erreur serveur :", error);
            //tout le monde n'a pas paye
            alert("Erreur : Vérifie que le membre existe et que toutes les conditions sont remplies.");
        }
    } else {
        alert("Veuillez remplir le nom et choisir une tontine.");
    }
  })