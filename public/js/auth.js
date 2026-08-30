import { API } from "./api.js";

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.style.display = "flex";
    formRegister.style.display = "none";
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.style.display = "flex";
    formLogin.style.display = "none";
});

formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        nom: document.getElementById("reg-nom").value,
        telephone: document.getElementById("reg-tel").value
    };

    try {
        await API.post("/members", data);
        alert("Inscription réussie ! Connectez-vous.");
        tabLogin.click();
    } catch (error) {
        alert("Erreur lors de l'inscription (numéro peut-être déjà utilisé).");
    }
});

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tel = document.getElementById("login-tel").value;

    try {
        const response = await fetch(`http://localhost:3000/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telephone: tel })
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "/public/index.html";
        } else {
            alert("Numéro de téléphone introuvable. Veuillez vous inscrire.");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur serveur lors de la connexion.");
    }
});