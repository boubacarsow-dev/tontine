const db = require('../db/database');

async function handleStats(req, res, headers) {
    // On écoute la route GET /statistiques
    if (req.method === 'GET' && req.url === '/statistiques') {
        try {
            // 1. Total des membres
            const [membres] = await db.query('SELECT COUNT(user_id) AS total FROM tontines_members');
            const totalMembres = membres[0].total;

            const [caisse] = await db.query('SELECT IFNULL(SUM(montant), 0) AS total_caisse FROM cotisation');
            const totalCaisse = caisse[0].total_caisse;

            // 3. Nombre de cycles terminés
            const [cycles] = await db.query('SELECT COUNT(id_cycle) AS total FROM cycles WHERE statut = "Terminé"');
            const cyclesTermines = cycles[0].total;

            const statistiques = {
                total_membres: totalMembres,
                argent_en_caisse: totalCaisse,
                cycles_termines: cyclesTermines
            };

            // send la reponse au front
            res.writeHead(200, headers);
            res.end(JSON.stringify(statistiques));

        } catch (error) {
            console.error(error);
            res.writeHead(500, headers);
            res.end(JSON.stringify({ message: "Erreur lors de la récupération des statistiques" }));
        }
        return; // on bouge
    }
}

module.exports = handleStats;