const db = require('../db/database'); // Les '..' pour sortir du dossier routes
const parser = require('../utils/bodyParser');
async function handleContribution(req,res,headers) {
    //route get
           if (req.method === 'GET' && req.url === '/contributions') {
       try {
           // 
           const [rows] = await db.query('SELECT * FROM cotisation');
   
           // 
           res.writeHead(200, headers);
           res.end(JSON.stringify(rows)); 
       } catch (error) {
           console.error(error);
           res.writeHead(500, headers);
           res.end(JSON.stringify({ erreur: "Impossible de récupérer les contributions" }));
       }
       return;
   }

    //route post
    if(req.method==='POST'&& req.url ==='/contributions'){
        try {
            const userData = await parser(req);
        await db.query(`INSERT INTO cotisation(montant,user_id,id_cycle)   VALUES (?,?,?)`,
            [userData.montant,userData.user_id,userData.id_cycle]
        );
        res.writeHead(200,headers);
        res.end(JSON.stringify({msg:`${userData.montant} a ete ajoute`}))
        } catch (error) {
            console.error(error);
            res.writeHead(400,headers);
            res.end(JSON.stringify({message:"erreur d'ajout de montant ou de sql"}))
        }
        return;
    };

    // erreur 404 
    //erreur 404
    res.writeHead(404, headers);
    res.end(JSON.stringify({ erreur: "Action non reconnu" }));
};

module.exports =handleContribution;