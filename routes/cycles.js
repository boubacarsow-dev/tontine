const db = require('../db/database');
const parser = require('../utils/bodyParser');

//
async function handleCycles(req,res,headers) {
      //route get
             if (req.method === 'GET' && req.url === '/cycles') {
         try {
             // 
             const [rows] = await db.query('SELECT * FROM cycles');
     
             // 
             res.writeHead(200, headers);
             res.end(JSON.stringify(rows)); 
         } catch (error) {
             console.error(error);
             res.writeHead(500, headers);
             res.end(JSON.stringify({ erreur: "Impossible de récupérer les cycles" }));
         }
         return;
     }
  //post
  if(req.method === 'POST' && req.url === '/cycles'){
    try {
        const userData = await parser(req);
        await db.query(`INSERT INTO cycles(nom,statut,id_tontine) VALUES(?,?,?)`,
            [userData.nom,userData.statut,userData.id_tontine]
        )
        res.writeHead(201,headers);
        res.end(JSON.stringify({message:`${userData.nom} comme cycle a ete cree` }))
    } catch (error) {
        console.error(error);
            res.writeHead(400, headers);
            res.end(JSON.stringify({ erreur: "Données invalides ou erreur SQL" }));
        }
        return;
    
  }

   // DELETE 
if (req.method === 'DELETE' && req.url.startsWith('/cycles/')) {
    try {
        const partiUrl = req.url.split('/');
        const idUrl = parseInt(partiUrl[2]);

        const [resultat] = await db.query('DELETE FROM cycles WHERE id_cycle = ?', [idUrl]);

        if (resultat.affectedRows === 0) {
            res.writeHead(404, headers);
            return res.end(JSON.stringify({ message: "Cycle introuvable" }));
        }

        res.writeHead(200, headers);
        res.end(JSON.stringify({ 
            message: `Le cycle ${idUrl} a été supprimé. Attention : toutes les cotisations liées ont aussi été effacées.` 
        }));
    } catch (error) {
        console.error(error);
        res.writeHead(500, headers);
        res.end(JSON.stringify({ message: "Erreur lors de la suppression du cycle" }));
    }
    return;

}

 if (req.method === 'PUT' && req.url.startsWith('/cycles/')) {
    try {

        const partiUrl = req.url.split('/');
        const idUrl = parseInt(partiUrl[2]);
        const userData = await parser(req);
        const [participants] = await db.query(`SELECT COUNT(user_id) AS total FROM tontines_members`);
        const total_attendus = participants[0].total;
        const [nb_paiements] = await db.query(`SELECT * from cotisation WHERE id_cycle =?`,[idUrl]);
        const total_a_paye = nb_paiements.length
        if(total_attendus>total_a_paye){
            res.writeHead(400,headers);
            return res.end(JSON.stringify({message:"tout le monde n'a pas paye"}))
        }

        if (userData.id_beneficiaire) {
            
            // Est-ce que ce membre existe vraiment ?
            const [user_existe] = await db.query(
                `SELECT user_id FROM tontines_members WHERE user_id = ?`, 
                [userData.id_beneficiaire]
            );
            
            if (user_existe.length === 0) {
                res.writeHead(400, headers);
                return res.end(JSON.stringify({ message: "Erreur : Ce membre n'existe pas dans la base de données." }));
            }
            const [deja_gagne] = await db.query(
                `SELECT id_cycle FROM cycles WHERE id_beneficiaire = ? AND id_cycle != ?`,
                [userData.id_beneficiaire, idUrl]
            );

            if (deja_gagne.length > 0) {
                res.writeHead(400, headers);
                return res.end(JSON.stringify({ message: "Erreur : Ce membre a déjà bénéficié de la tontine dans un autre cycle." }));
            }
        }
        const [resultat] = await db.query(
            `UPDATE cycles 
             SET nom = IFNULL(?, nom), 
                 statut = IFNULL(?, statut), 
                 id_beneficiaire = IFNULL(?, id_beneficiaire)
             WHERE id_cycle = ?`,
            [userData.nom || null, userData.statut || null, userData.id_beneficiaire || null, idUrl]
        );
        
        if (resultat.affectedRows === 0) {
            res.writeHead(404, headers);
            return res.end(JSON.stringify({ message: "Cycle introuvable" }));
        }

        res.writeHead(200, headers);
        res.end(JSON.stringify({ message: "Cycle mis à jour (Gagnant/Statut enregistré)", idUrl }));
    } catch (error) {
        console.error(error);
        res.writeHead(500, headers);
        res.end(JSON.stringify({ message: "Erreur lors de la mise à jour du cycle" }));
    }
    return;
}
  //erreur 404
  res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Aucune donnee trouvee pour ce cycle" }));
};

module.exports = handleCycles;