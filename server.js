const http = require('http');
const db = require('./db/database');
const parser = require('./utils/bodyParser');
const membersRoutes = require('./routes/members');
const groupsTontines = require('./routes/groups');
const cycles = require('./routes/cycles');
const handleContribution = require('./routes/contributions');

// Test de connexion à la base
async function testerConnexion() {
    try {
        await db.query('SELECT 1');
        console.log("🚀 SUCCÈS : Base de données tontine_db connectée !");
        console.log("====================================");
    } catch (erreur) {
        console.error(" ERREUR : Connexion impossible.");
        console.error(erreur);
    }
}
testerConnexion();

const server = http.createServer(async function(req, res) {
    const headers = { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    // LES ROUTES

    // Membres
    if (req.url.startsWith('/members')) {
        await membersRoutes(req, res, headers);
        return;
    }

    // Groupes
    if (req.url.startsWith('/groups')) {
        await groupsTontines(req, res, headers);
        return;    
    }

    // Cycles
    if (req.url.startsWith('/cycles')) {
        await cycles(req, res, headers);
        return;    
    }

    // Contributions (Cotisations)
    if (req.url.startsWith('/contributions')) {
        await handleContribution(req, res, headers);
        return;
    }

    // Cas particulier /users (on  le garder séparé)
    if (req.url === '/users') {
        if (req.method === 'GET') {
            res.writeHead(200, headers);
            res.end(JSON.stringify({ message: "Liste des utilisateurs" }));
            return;
        }
        if (req.method === 'POST') {
            try {
                const userData = await parser(req);
                await db.query('INSERT INTO users (nom, telephone) VALUES (?, ?)', 
                [userData.nom, userData.telephone]);
                res.writeHead(201, headers);
                res.end(JSON.stringify({ message: "Utilisateur ajouté" }));
            } catch (e) {
                res.writeHead(400, headers);
                res.end(JSON.stringify({ erreur: "Données invalides" }));
            }
            return;
        }
    }

    // 404 par défaut
    res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Route non trouvée" }));
});

server.listen(3000, () => {
    console.log(" Serveur tontine lancé sur http://localhost:3000");
});