const fs = require('fs');
const path = require('path');

const http = require('http');
const db = require('./db/database');
const parser = require('./utils/bodyParser');
const membersRoutes = require('./routes/members');
const groupsTontines = require('./routes/groups');
const cycles = require('./routes/cycles');
const handleContribution = require('./routes/contributions');
const handleStats = require('./routes/statistiques');
// Test de connexion à la base
async function testerConnexion() {
    try {
        await db.query('SELECT 1');
        console.log("SUCCÈS : Base de données tontine_db connectée !");
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

     if (req.url.startsWith('/public/') && req.method === 'GET') {
        const filePath = path.join(__dirname, req.url);
        const extname = path.extname(filePath);
        
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpeg';
                break;
            case '.ico':
                contentType = 'image/x-icon';
                break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
                    res.end(JSON.stringify({ erreur: "Fichier introuvable" }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json', ...headers });
                    res.end(JSON.stringify({ erreur: "Erreur serveur : " + error.code }));
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType, ...headers });
                res.end(content, 'utf-8');
            }
        });
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

    // Route d'authentification / connexion
    if (req.url === '/auth/login' && req.method === 'POST') {
        try {
            const userData = await parser(req);
            const [rows] = await db.query('SELECT * FROM users WHERE telephone = ?', [userData.telephone]);

            if (rows.length === 0) {
                res.writeHead(401, headers);
                res.end(JSON.stringify({ erreur: "Utilisateur non trouvé" }));
                return;
            }

            res.writeHead(200, headers);
            res.end(JSON.stringify(rows[0]));
        } catch (e) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ erreur: "Erreur serveur" }));
        }
        return;
    }

    // pour les stats
    if (req.url.startsWith('/statistiques')) {
        await handleStats(req, res, headers);
        return;
    }

    // Cas particulier /users (on le garde séparé)
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