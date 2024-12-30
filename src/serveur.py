from flask import Flask, request, jsonify
import sqlite3
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS  # Importez CORS

app = Flask(__name__)
CORS(app)  # Applique CORS à toute l'application

# Connexion à la base de données 
def db_connection() :
    conn = sqlite3.connect('C:/Users/idril/Documents/EI4/IOT_LogementEcoresponsable/src/logement.db')
    conn.row_factory = sqlite3.Row # Accès au champ par nom
    return conn

# Racine du serveur
@app.route('/')
def index():
    return "Bienvenue sur le serveur RESTful pour le logement éco-responsable !"

# Requête pour récupèrer tous les logements de la BD
@app.route('/logement', methods=['GET'])
def get_logements():
    conn = db_connection()
    logements = conn.execute('SELECT * FROM Logement').fetchall()
    conn.close()
    return jsonify([dict(logement) for logement in logements]) # Transformer l'objet sqlite.Row en dictionnaire puis en objet JSON

# Requête pour ajouter un logement à la BD
@app.route('/logement', methods=['POST'])
def add_logement():
    data = request.get_json()  # Données JSON du client
    adresse = data.get('adresse')
    num_tel = data.get('num_tel')
    adresse_IP = data.get('adresse_IP')

    conn = db_connection()
    conn.execute(
        'INSERT INTO Logement (adresse, num_tel, adresse_IP) VALUES (?, ?, ?)',
        (adresse, num_tel, adresse_IP)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Logement ajouté avec succès !'}) # Retour objet JSON

# Requête pour récuperer les pièces d'un logement
@app.route('/logement/<int:id_logement>/pieces', methods=['GET'])
def get_pieces(id_logement):
    conn = db_connection()
    pieces = conn.execute('SELECT * FROM Piece WHERE id_logement = ?', (id_logement,)).fetchall()
    conn.close()
    return jsonify([dict(piece) for piece in pieces])

# Requête pour ajouter une pièce à un logement 
#### A MODIFIER 
@app.route('/logement/<int:id_logement>/pieces', methods=['POST'])
def add_piece(id_logement):
    data = request.get_json()
    nom = data.get('nom')
    localisation = data.get('localisation')


    conn = db_connection()
    conn.execute(
        'INSERT INTO Piece (nom, localisation, id_logement) VALUES (?, ?, ?)',
        (nom, localisation, id_logement)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Pièce ajoutée avec succès !'})

# Requête pour récuperer les capteurs d'une pièce
@app.route('/piece/<int:id_piece>/capteurs', methods=['GET'])
def get_capteurs(id_piece) :
    conn = db_connection()
    capteurs = conn.execute('SELECT * FROM Capteur WHERE ref_piece = ?', (id_piece,)).fetchall()
    conn.close()
    return jsonify([dict(capteur) for capteur in capteurs])

# Requête pour ajouter un capteur à un logement
@app.route('/piece/<int:id_piece>/capteurs', methods=['POST'])
def add_capteur(id_piece):
    data = request.get_json()
    typeCA = data.get('typeCA')
    ref_commercial = data.get('ref_commercial')
    port = data.get('port')

    conn = db_connection()

    # Vérifier si le type existe dans la table TypeCA
    type_exists = conn.execute(
        'SELECT 1 FROM TypeCA WHERE nom = ?', (typeCA,)
    ).fetchone()

    if not type_exists:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Type de capteur inexistant !'}), 400

    # Insérer le capteur si le type est valide
    conn.execute(
        'INSERT INTO Capteur (typeCA, ref_commercial, ref_piece, port) VALUES (?, ?, ?, ?)',
        (typeCA, ref_commercial, id_piece, port)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Capteur ajouté avec succès !'})

# Requête pour récuperer les actionneurs d'une pièce
@app.route('/piece/<int:id_piece>/actionneurs', methods=['GET'])
def get_actionneurs(id_piece) :
    conn = db_connection()
    capteurs = conn.execute('SELECT * FROM Actionneur WHERE ref_piece = ?', (id_piece,)).fetchall()
    conn.close()
    return jsonify([dict(capteur) for capteur in capteurs])

# Requête pour ajouter un actionneur à un logement
@app.route('/piece/<int:id_piece>/actionneurs', methods=['POST'])
def add_actionneur(id_piece):
    data = request.get_json()
    typeCA = data.get('typeCA')
    ref_commercial = data.get('ref_commercial')
    port = data.get('port')

    conn = db_connection()
    conn.execute(
        'INSERT INTO Actionneur (typeCA, ref_commercial, ref_piece, port) VALUES (?, ?, ?, ?)',
        (typeCA, ref_commercial, id_piece, port)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Actionneur ajouté avec succès !'})


# Requête pour récupèrer les mesures d'un capteur
@app.route('/capteur/<int:id_capteur>/mesures', methods=['GET'])
def get_mesures_for_capteur(id_capteur):
    conn = db_connection()
    mesures = conn.execute(
        'SELECT * FROM Mesure WHERE id_capteur = ?', (id_capteur,)
    ).fetchall()
    conn.close()
    return jsonify([dict(mesure) for mesure in mesures])

@app.route('/capteur/<int:id_capteur>/mesures', methods=['POST'])
def add_mesure_to_capteur(id_capteur):
    data = request.get_json()
    valeur = data.get('valeur')

    conn = db_connection()

    # Récupérer la plage de valeurs pour le type du capteur
    capteur_info = conn.execute(
        '''
        SELECT TypeCA.plage
        FROM Capteur
        JOIN TypeCA ON Capteur.typeCA = TypeCA.nom
        WHERE Capteur.id = ?
        ''', (id_capteur,)
    ).fetchone()

    if not capteur_info:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Capteur introuvable ou type non défini !'}), 400

    plage = capteur_info['plage']
    print(plage)
    # Extraire les bornes de la plage
    try:
        min_val, max_val = map(float, plage.split('/'))
    except ValueError:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Plage de valeurs invalide pour le type du capteur !'}), 500

    print(min_val)
    print(max_val)
    # Vérifier si la valeur est dans la plage
    if not (min_val <= float(valeur) <= max_val):
        conn.close()
        return jsonify({'status': 'error', 'message': f'Valeur hors plage ({min_val}-{max_val}) !'}), 400

    # Ajouter la mesure si elle est valide
    conn.execute(
        'INSERT INTO Mesure (valeur, date_insertion, id_capteur) VALUES (?, datetime("now"), ?)',
        (valeur, id_capteur)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Mesure ajoutée au capteur !'})

@app.route('/logement/<int:id_logement>/factures', methods=['GET'])
def get_factures_for_logement(id_logement):
    conn = db_connection()
    factures = conn.execute(
        'SELECT * FROM Facture WHERE adresse_logement = (SELECT adresse FROM Logement WHERE numero = ?)', 
        (id_logement,)
    ).fetchall()
    conn.close()
    return jsonify([dict(facture) for facture in factures])

@app.route('/logement/<int:id_logement>/factures', methods=['POST'])
def add_facture_to_logement(id_logement):
    data = request.get_json()
    type_facture = data.get('type_facture')
    montant = data.get('montant')
    valeur_consommee = data.get('valeur_consommee')

    conn = db_connection()
    adresse_logement = conn.execute(
        'SELECT adresse FROM Logement WHERE numero = ?', (id_logement,)
    ).fetchone()

    if not adresse_logement:
        return jsonify({'status': 'error', 'message': 'Logement non trouvé !'}), 404

    conn.execute(
        'INSERT INTO Facture (type_facture, date_insertion, montant, valeur_consommee, adresse_logement) VALUES (?, datetime("now"), ?, ?, ?)',
        (type_facture, montant, valeur_consommee, adresse_logement['adresse'])
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Facture ajoutée au logement !'})

@app.route('/logement/<int:id_logement>/chart', methods=['GET'])
def get_chart_for_logement(id_logement):
    conn = db_connection()
    factures = conn.execute(
        '''
        SELECT type_facture, SUM(montant) AS total 
        FROM Facture 
        WHERE adresse_logement = (SELECT adresse FROM Logement WHERE numero = ?)
        GROUP BY type_facture
        ''',
        (id_logement,)
    ).fetchall()
    conn.close()

    # Vérifier si des données existent pour le logement
    if not factures:
        return "<h1>Aucune donnée de facture pour ce logement.</h1>", 404

    # Convertir les données pour Google Charts
    data_rows = "".join(
        f"['{facture['type_facture']}', {facture['total']}]," for facture in factures
    )

    # Génération de la page HTML
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Répartition des Factures</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', {{'packages':['corechart']}});
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {{
                var data = google.visualization.arrayToDataTable([
                    ['Type de Facture', 'Montant'],
                    {data_rows}
                ]);
                var options = {{
                    title: 'Factures logement #{id_logement}',
                    is3D: true,
                    pieSliceText: 'value',
                    colors: ['#ff9999','#66b3ff','#99ff99','#ffcc99']
                }};
                var chart = new google.visualization.PieChart(document.getElementById('piechart'));
                chart.draw(data, options);
            }}
        </script>
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h3>Répartition des Factures</h3>
                </div>
                <div class="card-body">
                    <div id="piechart" style="width: 100%; height: 500px;"></div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# API REST de météo
API_KEY = '3265b2f1742f21bd78632f561226d296'
@app.route('/meteo/<ville>', methods=['GET'])
def get_meteo(ville):
    # URL de l'API météo pour les prévisions à 5 jours
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={ville}&appid={API_KEY}&units=metric&lang=fr"

    # Appel à l'API météo
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'status': 'error', 'message': 'Impossible de récupérer les données météo'}), response.status_code

    data = response.json()

    # Extraction des prévisions par tranche de 3 heures
    previsions = []
    for item in data['list']:
        previsions.append({
            'date': item['dt_txt'],
            'temperature': item['main']['temp'],
            'description': item['weather'][0]['description'],
            'icon': item['weather'][0]['icon']
        })

    # Renvoi des prévisions au format JSON
    return jsonify({
        'ville': data['city']['name'],
        'previsions': previsions
    })

# Route pour comparer la temperature du capteur DHT à la temperature extérieure
@app.route('/action/LED', methods=['GET'])
def controle_led():
    ## Obtenir la dernière mesure de temperature : Vérifier que la mesure provient d'un capteur de type "Capteur de Temperature"
    conn = db_connection()
    mesure = conn.execute('''
        SELECT m.valeur 
        FROM Mesure m
        JOIN Capteur_Actionneur c ON m.id_capteur = c.id
        WHERE c.typeCA = "Capteur de Temperature"
        ORDER BY m.id DESC 
        LIMIT 1
    ''').fetchone()
    conn.close()
    # Erreur : aucune mesure retrouvée
    if not mesure :
        return jsonify({'status': 'error', 'message': 'Aucune mesure disponible'}), 404
    # Valeur de la mesure
    temperature_capteur = mesure['valeur']

    temperature_exterieur = 20
    ## Comparaison des deux temperatures
    etatLED = "on" if temperature_exterieur > temperature_capteur else "off"

    return jsonify({
        'status' : 'succes',
        'temperature_capteur': temperature_capteur,
        'temperature_ext': temperature_exterieur,
        'action': etatLED
    })

#### API pour suppression ####
# Route pour supprimer un logement 
@app.route('/logement/<int:id_logement>', methods=['DELETE'])
def delete_logement(id_logement):
    conn = db_connection()

    # Supprimer toutes les pièces associées au logement
    pieces = conn.execute('SELECT id FROM Piece WHERE id_logement = ?', (id_logement,)).fetchall()
    for piece in pieces:
        delete_piece(piece['id'])  # Appeler la fonction delete_piece pour chaque pièce

    # Supprimer le logement
    cursor = conn.execute('DELETE FROM Logement WHERE numero = ?', (id_logement,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({'status': 'error', 'message': 'Logement non trouvé !'}), 404

    return jsonify({'status': 'success', 'message': 'Logement et ses dépendances supprimés avec succès !'})

# Route pour supprimer une piece 
@app.route('/piece/<int:id_piece>', methods=['DELETE'])
def delete_piece(id_piece):
    conn = db_connection()

    # Supprimer tous les capteurs associés à la pièce
    capteurs = conn.execute('SELECT id FROM Capteur WHERE ref_piece = ?', (id_piece,)).fetchall()
    for capteur in capteurs:
        delete_capteur(capteur['id'])  # Appeler la fonction delete_capteur pour chaque capteur

    # Supprimer tous les actionneurs associés à la pièce
    actionneurs = conn.execute('SELECT id FROM Actionneur WHERE ref_piece = ?', (id_piece,)).fetchall()
    for actionneur in actionneurs:
        delete_actionneur(actionneur['id'])  # Appeler la fonction delete_actionneur pour chaque actionneur

    # Supprimer la pièce
    cursor = conn.execute('DELETE FROM Piece WHERE id = ?', (id_piece,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({'status': 'error', 'message': 'Pièce non trouvée !'}), 404

    return jsonify({'status': 'success', 'message': 'Pièce et ses dépendances supprimées avec succès !'})

# Route pour supprimer un capteur
@app.route('/capteur/<int:id_capteur>', methods=['DELETE'])
def delete_capteur(id_capteur):
    conn = db_connection()

    # Supprimer les mesures associées au capteur
    conn.execute('DELETE FROM Mesure WHERE id_capteur = ?', (id_capteur,))

    # Supprimer le capteur
    cursor = conn.execute('DELETE FROM Capteur WHERE id = ?', (id_capteur,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({'status': 'error', 'message': 'Capteur non trouvé !'}), 404

    return jsonify({'status': 'success', 'message': 'Capteur et ses mesures supprimés avec succès !'})

# Route pour supprimer un actionneur 
@app.route('/actionneur/<int:id_actionneur>', methods=['DELETE'])
def delete_actionneur(id_actionneur):
    conn = db_connection()

    # Supprimer l'actionneur
    cursor = conn.execute('DELETE FROM Actionneur WHERE id = ?', (id_actionneur,))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({'status': 'error', 'message': 'Actionneur non trouvé !'}), 404

    return jsonify({'status': 'success', 'message': 'Actionneur supprimé avec succès !'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

