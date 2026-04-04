// --- FICHIER : ./routes/members.js ---
const db = require('../db/database');
const parser = require('../utils/bodyParser');

async function handleMembers(req, res, headers) {
    
     //route get
            if (req.method === 'GET' && req.url === '/members') {
        try {
            // 
            const [rows] = await db.query('SELECT * FROM users');
    
            // 
            res.writeHead(200, headers);
            res.end(JSON.stringify(rows)); 
        } catch (error) {
            console.error(error);
            res.writeHead(500, headers);
            res.end(JSON.stringify({ erreur: "Impossible de récupérer les membres" }));
        }
        return;
    }

    // routes POST 
    if (req.method === 'POST' && req.url === '/members') {
        try {
            const userData = await parser(req);
            await db.query(
                'INSERT INTO users (nom, telephone) VALUES (?, ?)', 
                [userData.nom, userData.telephone]
            );
            res.writeHead(201, headers);
            res.end(JSON.stringify({ message: "Membre ajouté avec succès" }));
        } catch (error) {
            res.writeHead(400, headers);
            res.end(JSON.stringify({ erreur: "Données invalides ou doublon de téléphone" }));
        }
        return;
    }

    // routes DELETE
    if (req.method === 'DELETE' && req.url.startsWith('/members/')) {
        try {
            const partiUrl = req.url.split('/');
            const idUrl = parseInt(partiUrl[2]);
            const [resultat] = await db.query('DELETE FROM users WHERE user_id = ?', [idUrl]);

            if (resultat.affectedRows === 0) {
                res.writeHead(404, headers);
                return res.end(JSON.stringify({ message: "Membre non trouvé dans la base" }));
            }

            res.writeHead(200, headers);
            res.end(JSON.stringify({ message: `Le membre ${idUrl} a été supprimé` }));
        } catch (error) {
            console.error(error);
            res.writeHead(500, headers);
            res.end(JSON.stringify({ message: "Erreur lors de la suppression" }));
        } 
        return;
    }

    // routes PUT
    if (req.method === 'PUT' && req.url.startsWith('/members/')) {
        try {
            const partiUrl = req.url.split('/');
            const idUrl = parseInt(partiUrl[2]);
            const userData = await parser(req);

            const [resultat] = await db.query(
                'UPDATE users SET nom = ?, telephone = ? WHERE user_id = ?',
                [userData.nom, userData.telephone, idUrl]
            );

            if (resultat.affectedRows === 0) {
                res.writeHead(404, headers);
                return res.end(JSON.stringify({ message: "Impossible de modifier : membre introuvable" }));
            }

            res.writeHead(200, headers);
            res.end(JSON.stringify({ message: "Membre mis à jour avec succès", id: idUrl }));
        } catch (error) {
            console.error(error);
            res.writeHead(400, headers);
            res.end(JSON.stringify({ erreur: "Erreur lors de la modification" }));
        }
        return;
    }
    
    // --- 404 : Action inconnue ---
    res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Action non reconnue pour les membres" }));
}

module.exports = handleMembers;