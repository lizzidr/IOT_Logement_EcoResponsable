# README- PROJET IOT : Logement Eco Responsable

## Description du Projet :

Ce projet propose une application internet pour améliorer l'impact environnemental d'un logement. Il combine une base de données, un serveur RESTful, et un site web permettant de gèrer la configuration des capteurs d'un logement, et de visualiser ses consommations énergétiques.

Ce projet est divisé en 4 parties : 
  1. Construction de la base de données
 2. Conception de l’application client/serveur permettant le traitement des données
 3. Intégration d’APIs REST pour obtenir des données externes (météo, factures etc.)
 4. Conception du site web correspondant

## Contenu du dépôt :
- **logement.sql :** Script SQL pour gérer la base de données
- **logement.db :** Base de données
- **remplissage.py :** Script python pour remplir la base de données avec des mesures et des factures
- **serveur.py :** Serveur RESTful en python avec Flask pour gèrer les requêtes vers la base de données
- **controleLED/controleLED.ino :** Code arduino pour alimenter la base de données via un capteur de température
- **site_web/ :** Dossier contenant les fichiers HTML, CSS, Javascript pour l'application web
  - **assets/js :** Fichiers JS de chaque page
  - **assets/css :** Fichier CSS du style global

## Instructions d'utilisation :
### Prérequis :
#### Logiciels :
- Python 3.12.1 ou version compatible
- SQLite3
- Arduino IDE
#### Dépendances python :
- Flask : pour le serveur RESTful.
- Flask-CORS : pour gérer les requêtes entre domaines.
- Requests : pour les appels HTTP.
#### Dépendances Arduino :
- ESP8266WiFi : pour connecter l'ESP à un réseau WiFi.
- ESP8266HTTPClient : pour gérer les requêtes HTTP.
- DHT sensor library (par Adafruit) : pour interagir avec le capteur DHT

### Installation : 
1. Cloner le dépôt :
- `git clone https://github.com/lizzidr/IOT_Logement_EcoResponsable`
- `cd IOT_Logement_EcoResponsable`
2. Installer les dépendances python :
- `pip install flask`
- `pip install flask-cors`
- `pip install requests`

### Lancer l'application : 
1. Initialiser la base de données :
  - `sqlite3 logement.db < logement.sql`
  
2. Ajouter des mesures et des factures :
  - `python remplissage.py`
  
3. Lancer le serveur :
  - `python serveur.py`
  - Le serveur sera accessible sur "http://localhost:5000"

4. Lancer l'application Web :
  - Ouvrir le fichier "src/site_web/index.html" dans un navigateur
  




 

