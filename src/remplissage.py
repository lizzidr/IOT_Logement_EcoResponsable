import sqlite3, random
from datetime import datetime

# ouverture/initialisation de la base de donnee
conn = sqlite3.connect('C:/Users/idril/Documents/EI4/IOT_LogementEcoresponsable/sqlite/logement.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Date actuelle
def generate_date():
    # Obtenir la date et l'heure actuelles
    today = datetime.now()
    # Retourner la date au format 'YYYY-MM-DD HH:MM:SS'
    return today.strftime('%Y-%m-%d %H:%M:%S')

import random

# Générer des mesures aléatoires
def generate_mesures():
    # Récupérer les capteurs existants avec leurs plages
    c.execute("""
        SELECT Capteur.id AS id_capteur, TypeCA.plage AS plage
        FROM Capteur
        JOIN TypeCA ON Capteur.typeCA = TypeCA.nom
    """)
    capteurs = c.fetchall()

    # Parcourir les capteurs et ajouter une mesure
    for capteur in capteurs:
        id_capteur = capteur['id_capteur']
        plage = capteur['plage']
        print(plage)
        # Extraire les bornes de la plage
        try:
            min_val, max_val = map(float, plage.split('/'))
        except ValueError:
            print(f"Plage invalide pour le capteur ID {id_capteur} : {plage}. Mesure non ajoutée.")
            continue
        print(min_val)
        print(max_val)
        # Générer une mesure aléatoire dans la plage
        valeur = random.uniform(min_val, max_val)
        date = generate_date()

        # Ajouter la mesure à la base de données
        c.execute("""
            INSERT INTO mesure (id_capteur, valeur, date_insertion)
            VALUES (?, ?, ?)
        """, (id_capteur, valeur, date))
    
    print(f"{len(capteurs)} mesures ajoutées.")

# Generer des factures pour les logements
def generate_facture():
    # Récupérer les logements existants
    c.execute("SELECT adresse FROM Logement")
    logements = c.fetchall()

    # Types de factures possibles
    types_factures = ["Électricité", "Eau", "Déchets", "Gaz"]

    for logement in logements:
        adresse_logement = logement['adresse']

        # Générer 2 à 5 factures par logement
        for _ in range(random.randint(2, 5)):
            type_facture = random.choice(types_factures) # Type de la facture 
            valeur_consommee = random.uniform(50, 500)  # Valeur aléatoire de consommation
            montant = round(valeur_consommee * random.uniform(0.1, 0.3), 2)  # Montant basé sur la consommation
            date = generate_date()  # Date dans les 90 derniers jours

            c.execute(
                """INSERT INTO Facture (type_facture, date_insertion, montant, valeur_consommee, adresse_logement)
                VALUES (?, ?, ?, ?, ?)""",
                (type_facture, date, montant, valeur_consommee, adresse_logement)
            )
    print("Factures générées pour tous les logements.")

# Appels des fonctions pour remplir la base de données
generate_mesures()
generate_facture()


# fermeture
conn.commit()
conn.close()