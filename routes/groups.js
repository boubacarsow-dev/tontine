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

        //route pour modif PUT
        if(req.url.startsWith('/groups/') && req.method ==='PUT'){
            try {
                const partiUrl = req.url.split('/');
                             let idUrl = parseInt(partiUrl[2]);
                             const userData = await parser(req);
                          if(isNaN(idUrl)){
                             idUrl = parseInt(userData.id_tontine)
                          }  
                          if(!idUrl || isNaN(idUrl)){
                            res.writeHead(400, headers);
                            return res.end(JSON.stringify({ erreur: "ID du groupe manquant dans l'URL ou le corps de la requête" }))
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
                 res.end(JSON.stringify({ message: "Impossible de modifier : le groupe est introuvable" }))
                     return
            }
                        res.writeHead(200,headers);
                    res.end(JSON.stringify({message:`${userData.nom} a ete modifie`, idUrl}))
            } catch (error) {
                console.error(error)
                res.writeHead(500,headers);
                 res.end(JSON.stringify({message:"erreur lors de la modification du nom de ce groupe"}))
            }
            return;
            //
        }
    //erreur 404
    res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Aucun groupe trouvee ou erreur" }));
}
module.exports = handleGroups;