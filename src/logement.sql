-- Suppresion de toutes les tables si elles existent
DROP TABLE if EXISTS Logement;
DROP TABLE if EXISTS Piece;
DROP TABLE if EXISTS Capteur;
DROP TABLE if EXISTS Actionneur;
DROP TABLE if EXISTS TypeCA;
DROP TABLE if EXISTS Mesure;
DROP TABLE if EXISTS Facture;

-- ---------------------------- --
-- Création des tables de la BD --

-- Table Logement : adresse, numéro de tel, numéro IP, date
CREATE TABLE Logement (numero INTEGER PRIMARY KEY AUTOINCREMENT,
                    adresse TEXT, 
                    num_tel TEXT, 
                    adresse_IP TEXT, 
                    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

-- Table Pièce : nom, localisation
CREATE TABLE Piece (id INTEGER PRIMARY KEY AUTOINCREMENT, -- Identifiant de la pièce
                    nom TEXT, -- Nom de la pièce
                    localisation TEXT, -- Matrice 3D de localisation
                    id_logement TEXT, -- Adresse du logement dans lequel la pièce est située
                    FOREIGN KEY (id_logement) REFERENCES Logement(numero)
                    ); 

-- Table Capteur : type, réference commercial, réference pièce, port, date
CREATE TABLE Capteur (id INTEGER PRIMARY KEY AUTOINCREMENT, -- Identifiant
                                typeCA TEXT, --
                                ref_commercial TEXT, --
                                ref_piece TEXT, 
                                port INTEGER, 
                                date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --
                                FOREIGN KEY (typeCA) REFERENCES TypeCA(nom),
                                FOREIGN KEY (ref_piece) REFERENCES Piece(id)
                                );

-- Table Actionneur : type, réference commercial, réference pièce, port, date
CREATE TABLE Actionneur (id INTEGER PRIMARY KEY AUTOINCREMENT, -- Identifiant
                                typeCA TEXT, --
                                ref_commercial TEXT, --
                                ref_piece TEXT, 
                                port INTEGER, 
                                date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --
                                FOREIGN KEY (typeCA) REFERENCES TypeCA(nom),
                                FOREIGN KEY (ref_piece) REFERENCES Piece(id)
                                );

-- Table TypeCA : nom, unité, plage
CREATE TABLE TypeCA (nom TEXT PRIMARY KEY, -- Nom du type du capteur
                    unite TEXT, --
                    plage TEXT  
                    );

-- Table Mesure : id, valeur, date
CREATE TABLE Mesure (id INTEGER PRIMARY KEY AUTOINCREMENT, --
                    valeur REAL, -- 
                    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --
                    id_capteur INTEGER, -- ID du capteur associé à la mesure
                    FOREIGN KEY (id_capteur) REFERENCES Capteur(id)
                    );

-- Table Facture : numero, type, date, montant, valeur consommée
CREATE TABLE Facture (numero INTEGER PRIMARY KEY AUTOINCREMENT, 
                    type_facture TEXT, 
                    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --
                    montant REAL, --
                    valeur_consommee REAL, 
                    adresse_logement TEXT, 
                    FOREIGN KEY (adresse_logement) REFERENCES Logement(adresse)
                    );

-- ---------------------------------- --
-- Création d'un logement de 4 pièces --

-- Création du logement
INSERT INTO Logement (adresse, num_tel, adresse_IP) 
    VALUES('13 rue du izzan', '0666666666', '0.0.0.0');

-- Création des 4 pièces
INSERT INTO Piece (nom, localisation, id_logement)
    VALUES('Cuisine', '(1,1,1)', (SELECT numero FROM Logement WHERE adresse = '13 rue du izzan'));
INSERT INTO Piece (nom, localisation, id_logement)
    VALUES('Salon', '(0,1,1)', (SELECT numero FROM Logement WHERE adresse = '13 rue du izzan'));
INSERT INTO Piece (nom, localisation, id_logement)
    VALUES('Chambre', '(1,0,1)', (SELECT numero FROM Logement WHERE adresse = '13 rue du izzan'));
INSERT INTO Piece (nom, localisation, id_logement)
    VALUES('Salle de bain', '(1,1,0)', (SELECT numero FROM Logement WHERE adresse = '13 rue du izzan'));

-- ------------------------------------------- --
-- Création de types de capteurs / actionneurs --

-- Capteurs
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Capteur de Temperature', '°C', '-40/60');
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Capteur de Luminosité"', 'Lux', '0/1000');
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Capteur de Consommation Electrique', 'kWh', '0/1000');

-- Actionneurs
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Regulateur de Chauffage', '°C', '-20/90');
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Eclairage', 'V', '');
INSERT INTO TypeCA (nom, unite, plage)
    VALUES ('Prise Electrique', 'V', '');

-- ---------------------------------- --
-- Création de capteurs / actionneurs --

INSERT INTO Capteur (typeCA, ref_commercial, ref_piece, port)
    VALUES ('Capteur de Temperature', 'DHT', 
            (SELECT id FROM Piece WHERE nom = 'Salon'), 
            1220
            );

INSERT INTO Actionneur (typeCA, ref_commercial, ref_piece, port)
    VALUES ('Regulateur de Chauffage', 'BBB2222BBB', 
            (SELECT id FROM Piece WHERE nom = 'Salon'), 
            77
            );







