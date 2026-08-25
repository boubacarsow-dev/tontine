#  Tontine Manager

**Tontine Manager** est une application web de gestion de tontines, développée en **Node.js pur** (sans framework comme Express), avec un backend HTTP natif et un frontend en HTML/CSS/JavaScript vanilla.

Une tontine est un système d'épargne collective où un groupe de membres cotise régulièrement, et où chacun reçoit à tour de rôle le pot commun. Cette application permet de digitaliser et simplifier la gestion de ce processus : création de groupes, gestion des membres, suivi des cycles de cotisation, etc.

---

## ✨ Fonctionnalités

-  **Gestion des groupes** — création et suivi des groupes de tontine
-  **Gestion des membres** — ajout, modification et suivi des participants
-  **Gestion des cycles** — suivi des tours de cotisation et des bénéficiaires
-  **API REST maison** — routage et parsing des requêtes gérés sans dépendance externe (Express)
-  **Base de données** — persistance des données via une couche `db`

---

##  Stack technique

| Côté | Technologies |
|------|-------------|
| Backend | Node.js (module `http` natif, sans framework) |
| Base de données | SQL (via un module `db/database`) |
| Frontend | HTML, CSS, JavaScript vanilla |
| Parsing des requêtes | Body parser fait maison (`utils/bodyParser.js`) |

Le serveur ne repose sur aucun framework externe : le routage, le parsing du corps des requêtes (JSON) et la gestion des réponses HTTP sont entièrement implémentés à la main, ce qui en fait un bon exemple de Node.js « from scratch ».

---

## 📁 Structure du projet

```
tontine/
├── db/                  # Connexion et requêtes vers la base de données
├── public/              # Fichiers statiques servis au client
│   ├── css/             # Feuilles de style
│   ├── js/               # Scripts côté client
│   │   ├── api.js        # Appels vers l'API backend
│   │   ├── cycles.js
│   │   ├── groupes.js
│   │   ├── index.js
│   │   └── membres.js
│   ├── cycles.html
│   ├── groupes.html
│   ├── index.html
│   └── membres.html
├── routes/              # Logique des routes de l'API (groupes, membres, cycles...)
├── utils/
│   └── bodyParser.js    # Parsing manuel du corps des requêtes HTTP
├── .gitignore
├── package.json
├── package-lock.json
├── server.js            # Point d'entrée du serveur
└── README.md
```

---

##  Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v14 ou supérieur recommandé)
- Une base de données SQL (MySQL / MariaDB ou équivalent)

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/boubacarsow-dev/tontine.git
   cd tontine
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**

   Créez votre base de données et renseignez les informations de connexion dans le module `db/database.js` (ou via un fichier `.env` si vous en ajoutez un).

4. **Lancer le serveur**
   ```bash
   node server.js
   ```

5. **Accéder à l'application**

   Ouvrez votre navigateur à l'adresse :
   ```
   http://localhost:3000
   ```
   *(adapter le port selon la configuration de `server.js`)*

---

## 📡 API

Le serveur expose des routes REST pour interagir avec les ressources principales :

| Ressource | Méthode | Description |
|-----------|---------|--------------|
| `/groupes` | `GET` | Récupérer la liste des groupes |
| `/groupes` | `POST` | Créer un nouveau groupe |
| `/membres` | `GET` / `POST` | Gérer les membres |
| `/cycles` | `GET` / `POST` | Gérer les cycles de cotisation |

*(À adapter/compléter selon les routes réellement définies dans le dossier `routes/`)*

---

## 🧩 Pages disponibles

- `index.html` — Accueil
- `groupes.html` — Gestion des groupes de tontine
- `membres.html` — Gestion des membres
- `cycles.html` — Suivi des cycles de cotisation

---

##  Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

##  Licence

Ce projet est distribué sous licence libre. Vous pouvez ajouter une licence (MIT, GPL, etc.) selon vos préférences dans un fichier `LICENSE`.

---

## 👤 Auteur

Développé par **boubacarsow-dev**
