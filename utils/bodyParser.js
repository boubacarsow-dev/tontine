//gerer les donnees morceaux par morceaux
function bodyParser(req) {
    return new Promise((resolve, reject) => {
            let body = [];
                       req.on('data', (chunk)=>body.push(chunk));
                       req.on('end', ()=>{
                        try {
                            const les_users = Buffer.concat(body).toString();
                            const newUser = JSON.parse(les_users);
                            resolve(newUser)
                           
                        } catch (err) {
                            reject(err)
                        }
                        return
                       }) 
    });
}

// On exporte l'outil pour que le server.js puisse l'importer !
module.exports = bodyParser;