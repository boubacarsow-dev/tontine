CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nom varchar(100) NOT NULL,
    telephone varchar(20) unique NOT NULL, -- C
    date_rejoint DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tontines (
    id_tontine INT AUTO_INCREMENT PRIMARY KEY,
    nom varchar(30) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    frequence varchar(50) DEFAULT 'mensuelle',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tontines_members (
    id_tontine INT NOT NULL, -- Ajout de la colonne manquante
    user_id INT NOT NULL,    -- Renommé pour correspondre à la table users
    date_integration TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ordre_beneficiaire INT NOT NULL,
    PRIMARY key(id_tontine, user_id),
    FOREIGN KEY (id_tontine) REFERENCES tontines(id_tontine) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cycles (
    id_cycle INT AUTO_INCREMENT,
    nom varchar(50) not null, -- Ajout de la virgule manquante
    statut varchar(25) DEFAULT 'ouvert',
    id_beneficiaire INT,
    id_tontine int not null,
    date_ouverture date,
    date_cloture date,
    PRIMARY KEY(id_cycle),
    FOREIGN KEY (id_tontine) REFERENCES tontines(id_tontine) ON DELETE CASCADE,
    FOREIGN KEY (id_beneficiaire) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cotisation (
    id_cotisation int AUTO_INCREMENT PRIMARY KEY, -- Mis en haut avec AUTO_INCREMENT
    montant DECIMAL(10,2) not null, -- Suppression du doublon
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id int not null, -- Renommé pour correspondre à users
    id_cycle int not null,
    -- Syntaxe corrigée
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (id_cycle) REFERENCES cycles(id_cycle) ON DELETE CASCADE
);