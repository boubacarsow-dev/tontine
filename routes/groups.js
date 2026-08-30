const db = require('../db/database');
const parser = require('../utils/bodyParser');
async function handleGroups(req,res,headers) {
    //route get
        if (req.method === 'GET' && req.url === '/groups') {
    try {
        // 
        const [rows] = await db.query('SELECT * FROM tontines');

        // 
        res.writeHead(200, headers);
        res.end(JSON.stringify(rows)); 
    } catch (error) {
        console.error(error);
        res.writeHead(500, headers);
        res.end(JSON.stringify({ erreur: "Impossible de récupérer les groupes" }));
    }
    return;
}

    //post
    if (req.method === 'POST' && req.url === '/groups') {
        try {
            const userData = await parser(req);
                await db.query(
                'INSERT INTO tontines (nom, montant, frequence) VALUES (?, ?, ?)', 
                [userData.nom, userData.montant, userData.frequence]
            );

            // 3. On répond que tout s'est bien passé
            res.writeHead(201, headers);
            res.end(JSON.stringify({ message: "groupe cree avec succès", group: userData.nom }));

        } catch (error) {
            console.error(error);
            res.writeHead(400, headers);
            res.end(JSON.stringify({ erreur: "Données invalides ou erreur SQL" }));
        }
        return;
    };

        //route delete
        if(req.url.startsWith('/groups/') && req.method === 'DELETE'){
            try {
                 const partiUrl = req.url.split('/');
                             const idUrl = parseInt(partiUrl[2]);
                             const [resultat] = await db.query('DELETE FROM tontines WHERE id_tontine = ?', [idUrl]);
                 
                             if (resultat.affectedRows === 0) {
                                 res.writeHead(404, headers);
                                 return res.end(JSON.stringify({ message: "groupe de tontine non trouvé" }));
                             }
                 
                             res.writeHead(200, headers);
                             res.end(JSON.stringify({ message: `Le groupe ${idUrl} a été supprimé` }))
            } catch (error) {
                console.error('erreur', error);
                res.writeHead(500,headers);
                res.end(JSON.stringify({message:"erreur lors de la suppresion de ce groupe"}))
            }
            return;
        }

        //route pour modif 
        //route pour modif PUT
        if(req.url.startsWith('/groups/') && req.method === 'PUT'){
            try {
                const partiUrl = req.url.split('/');
                let idUrl = parseInt(partiUrl[2]);
                const userData = await parser(req);
                if(isNaN(idUrl)){
                    idUrl = parseInt(userData.id_tontine)
                }  
                if(!idUrl || isNaN(idUrl)){
                    res.writeHead(400, headers);
                    return res.end(JSON.stringify({ erreur: "ID du groupe manquant" }))
                }
                const [resultat] = await db.query(`
                    UPDATE tontines 
                    SET nom = IFNULL(?, nom), 
                        montant = IFNULL(?, montant), 
                        frequence = IFNULL(?, frequence) 
                    WHERE id_tontine = ?`,
                    [userData.nom || null, userData.montant || null, userData.frequence || null, idUrl]
                );
                if(resultat.affectedRows === 0){
                    res.writeHead(404, headers);
                    return res.end(JSON.stringify({ message: "Groupe introuvable" }))
                }
                res.writeHead(200, headers);
                res.end(JSON.stringify({message: `${userData.nom} a ete modifie`, idUrl}))
            } catch (error) {
                console.error(error)
                res.writeHead(500, headers);
                res.end(JSON.stringify({message: "Erreur lors de la modification"}))
            }
            return;
        }

        // 1. NOUVELLE ROUTE : Récupérer les membres d'un groupe spécifique (GET /groups/:id/members)
        if (req.url.startsWith('/groups/') && req.url.endsWith('/members') && req.method === 'GET') {
            try {
                const partiUrl = req.url.split('/');
                const id_tontine = parseInt(partiUrl[2]);

                const [rows] = await db.query(`
                    SELECT u.user_id, u.nom, u.telephone, tm.ordre_beneficiaire 
                    FROM tontines_members tm
                    JOIN users u ON tm.user_id = u.user_id
                    WHERE tm.id_tontine = ?
                    ORDER BY tm.ordre_beneficiaire ASC`, 
                    [id_tontine]
                );

                res.writeHead(200, headers);
                res.end(JSON.stringify(rows));
            } catch (error) {
                console.error(error);
                res.writeHead(500, headers);
                res.end(JSON.stringify({ message: "Erreur lors de la récupération des membres du groupe" }));
            }
            return;
        }

        // 2. NOUVELLE ROUTE : Retirer un membre d'une tontine (DELETE /groups/:id_tontine/members/:user_id)
        if (req.url.startsWith('/groups/') && req.url.includes('/members/') && req.method === 'DELETE') {
            try {
                const partiUrl = req.url.split('/');
                const id_tontine = parseInt(partiUrl[2]);
                const user_id = parseInt(partiUrl[4]);

                const [resultat] = await db.query(
                    'DELETE FROM tontines_members WHERE id_tontine = ? AND user_id = ?', 
                    [id_tontine, user_id]
                );

                if (resultat.affectedRows === 0) {
                    res.writeHead(404, headers);
                    return res.end(JSON.stringify({ message: "Association membre/groupe introuvable" }));
                }

                res.writeHead(200, headers);
                res.end(JSON.stringify({ message: "Membre retiré du groupe avec succès" }));
            } catch (error) {
                console.error(error);
                res.writeHead(500, headers);
                res.end(JSON.stringify({ message: "Erreur lors du retrait du membre" }));
            }
            return;
        }

    //erreur 404
    res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Aucun groupe trouvee ou erreur" }));
}
module.exports = handleGroups;