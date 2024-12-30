// Un objet avec les types de capteurs et leurs icônes correspondantes
const sensorIcons = {
    "Capteur de Temperature": "fas fa-thermometer-half fa-2x", // Icône pour le capteur de température
    "Capteur de Luminosité": "fas fa-sun fa-2x",             // Icône pour le capteur de luminosité
    "Capteur de Consommation Electrique": "fas fa-bolt fa-2x", // Icône pour le capteur de consommation électrique
};

// Un objet similaire pour les actionneurs si nécessaire (exemple)
const actuatorIcons = {
    "Eclairage": "fas fa-lightbulb fa-2x",                    // Icône pour l'actionneur d'éclairage
    "Prise Electrique": "fas fa-plug fa-2x",                  // Icône pour l'actionneur prise électrique
    "Regulateur de Chauffage": "fas fa-fire fa-2x"            // Icône pour l'actionneur régulateur de chauffage
};

document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "http://127.0.0.1:5000"; // Assurez-vous que l'API est bien en cours d'exécution

    const leftPanelList = document.getElementById("left-panel-list");
    const leftPanelTitle = document.getElementById("left-panel-title");
    const rightPanelTitle = document.getElementById("right-panel-title");

    let currentLogementId = null;
    let currentPieceId = null;

    // Charger les logements
    function loadLogements() {
        currentLogementId = null;
        currentPieceId = null;

        fetch(`${API_BASE}/logement`)
            .then(response => response.json())
            .then(data => {
                leftPanelTitle.textContent = "Liste des Logements";
                rightPanelTitle.textContent = "Configurer un Logement";
                leftPanelList.innerHTML = ""; // Réinitialiser le contenu de la liste

                data.forEach(logement => {
                    // Créer une mini-carte pour chaque logement
                    const card = document.createElement("div");
                    card.className = "mini-card";  // Classe personnalisée pour la mini-carte

                    // Icône de logement (utilisation d'une icône FontAwesome)
                    const icon = document.createElement("i");
                    icon.className = "fas fa-home fa-2x";  // Icône maison pour un logement

                    // Titre du logement
                    const cardTitle = document.createElement("p");
                    cardTitle.className = "card-title";
                    cardTitle.textContent = logement.adresse;

                    // Contenu de la carte (icone + nom)
                    const cardContent = document.createElement("div");
                    cardContent.className = "card-content";
                    cardContent.appendChild(icon);
                    cardContent.appendChild(cardTitle);

                    // Ajouter un événement au clic pour charger les pièces
                    card.addEventListener("click", () => {
                        loadPieces(logement.numero); // Charger les pièces du logement
                    });

                    // Ajouter le contenu à la carte
                    card.appendChild(cardContent);

                    // Ajouter la carte à la liste
                    leftPanelList.appendChild(card);
                });

                // Afficher le formulaire pour les logements
                showLogementForm();
            })
            .catch(error => console.error("Erreur lors du chargement des logements", error));
    }

    // Charger les pièces d'un logement
    function loadPieces(logementId) {
        currentLogementId = logementId;
        currentPieceId = null;

        fetch(`${API_BASE}/logement/${logementId}/pieces`)
            .then(response => response.json())
            .then(data => {
                leftPanelTitle.textContent = "Liste des Pièces";
                rightPanelTitle.textContent = "Configurer une Pièce";
                leftPanelList.innerHTML = ""; // Réinitialiser la liste des pièces

                data.forEach(piece => {
                    // Créer une mini-carte pour chaque pièce
                    const card = document.createElement("div");
                    card.className = "mini-card";  // Classe personnalisée pour la mini-carte

                    // Icône de la pièce (par exemple, une icône de salle)
                    const icon = document.createElement("i");
                    icon.className = "fas fa-door-open fa-2x";  // Icône de pièce (ici un engrenage)

                    // Titre de la pièce
                    const cardTitle = document.createElement("p");
                    cardTitle.className = "card-title";
                    cardTitle.textContent = piece.nom;  // Nom de la pièce

                    // Contenu de la carte (icône + nom)
                    const cardContent = document.createElement("div");
                    cardContent.className = "card-content";
                    cardContent.appendChild(icon);
                    cardContent.appendChild(cardTitle);

                    // Ajouter un événement au clic pour charger les capteurs et actionneurs
                    card.addEventListener("click", () => {
                        loadCapteursAndActionneurs(piece.id, logementId); // Charger les capteurs et actionneurs de la pièce
                    });

                    // Ajouter la carte à la liste des pièces
                    card.appendChild(cardContent);
                    leftPanelList.appendChild(card);
                });

                // Ajouter le bouton "Retour" pour revenir à la liste des logements
                const backButton = document.createElement("button");
                backButton.className = "btn btn-secondary mt-3";
                backButton.textContent = "Retour aux Logements";
                backButton.addEventListener("click", loadLogements);

                leftPanelList.appendChild(backButton);

                // Afficher le formulaire pour les pièces
                showPieceForm();
            })
            .catch(error => console.error("Erreur lors du chargement des pièces", error));
    }

    // Fonction de chargement des capteurs avec l'icône associée
    function loadCapteursAndActionneurs(pieceId, idLogement) {
        currentPieceId = pieceId;

        leftPanelList.innerHTML = ""; // Vider la liste actuelle

        leftPanelTitle.textContent = "Liste des Capteurs et Actionneurs";
        rightPanelTitle.textContent = "Configurer un Capteur                                  ";

        // Ajouter le bouton de retour vers les pièces
        const backButton = document.createElement("button");
        backButton.className = "btn btn-secondary mb-3";  // Classe du bouton de retour
        backButton.textContent = "Retour vers les pièces";  // Texte du bouton
        
        // Ajouter le gestionnaire d'événements pour le retour
        backButton.addEventListener("click", function() {
            loadPieces(idLogement);  // Charger les pièces (vous devez définir cette fonction)
        });

        // Créer un bouton pour basculer entre les formulaires
        const toggleButton = document.createElement("button");
        toggleButton.className = "btn btn-light mb-3 toggle-btn";  // Classe Bootstrap personnalisée pour le bouton

        // Utiliser une icône FontAwesome (par exemple, une flèche)
        const icon = document.createElement("i");
        icon.className = "fas fa-exchange-alt";  

        toggleButton.appendChild(icon);  // Ajouter l'icône au bouton
        rightPanelTitle.appendChild(toggleButton);


        // Gérer l'affichage dynamique des formulaires
        toggleButton.addEventListener("click", () => {
            // Alterner l'affichage des formulaires
            if (document.getElementById("capteur-form").style.display === 'none') {
                showCapteurForm();  // Afficher le formulaire des capteurs
                icon.className = "fas fa-exchange-alt";
                rightPanelTitle.textContent = "Configurer un Capteur       ";
                rightPanelTitle.appendChild(toggleButton);
            } else {
                showActionneurForm();  // Afficher le formulaire des actionneurs
                icon.className = "fas fa-exchange-alt";
                rightPanelTitle.textContent = "Configurer un Actionneur     ";
                rightPanelTitle.appendChild(toggleButton);
            }
        });

        fetch(`${API_BASE}/piece/${pieceId}/capteurs`)
            .then(response => response.json())
            .then(data => {
                const capteursTitle = document.createElement("h5");
                capteursTitle.textContent = "Capteurs";
                capteursTitle.className = "mt-3";

                const capteursList = document.createElement("div");
                capteursList.className = "row"; // Utilisation de la classe row pour aligner les cartes horizontalement

                data.forEach(capteur => {
                    const card = document.createElement("div");
                    card.className = "mini-card";  // Classe de la mini-carte
                    
                    // Icône du capteur/actionneur
                    const icon = document.createElement("i");
                    icon.className = sensorIcons[capteur.typeCA] || "fas fa-cogs fa-2x";
                    
                    // Titre du capteur/actionneur
                    const cardTitle = document.createElement("p");
                    cardTitle.className = "card-title";
                    cardTitle.textContent = capteur.typeCA;  // Nom du capteur/actionneur
                    
                    // Contenu de la carte (icône + nom)
                    card.appendChild(icon);
                    card.appendChild(cardTitle);

                    // Ajouter la carte au conteneur
                    capteursList.appendChild(card);

                });

                leftPanelList.appendChild(capteursTitle);
                leftPanelList.appendChild(capteursList);
            })
            .catch(error => console.error("Erreur lors du chargement des capteurs", error));

        // Charger les actionneurs pour cette pièce
        fetch(`${API_BASE}/piece/${pieceId}/actionneurs`)
            .then(response => response.json())
            .then(actionneursData => {
                const actionneursTitle = document.createElement("h5");
                actionneursTitle.textContent = "Actionneurs";
                actionneursTitle.className = "mt-3";

                const actionneursList = document.createElement("div");
                actionneursList.className = "row"; // Utilisation de la classe row pour aligner les cartes horizontalement

                actionneursData.forEach(actionneur => {
                    const card = document.createElement("div");
                    card.className = "mini-card";  // Classe de la mini-carte
                    
                    // Icône du capteur/actionneur
                    const icon = document.createElement("i");
                    icon.className = actuatorIcons[actionneur.typeCA] || "fas fa-cogs fa-2x";
                    
                    // Titre du capteur/actionneur
                    const cardTitle = document.createElement("p");
                    cardTitle.className = "card-title";
                    cardTitle.textContent = actionneur.typeCA;  // Nom du capteur/actionneur
                    
                    // Contenu de la carte (icône + nom)
                    card.appendChild(icon);
                    card.appendChild(cardTitle);

                    // Ajouter la carte au conteneur
                    actionneursList.appendChild(card);
                });

                leftPanelList.appendChild(actionneursTitle);
                leftPanelList.appendChild(actionneursList);

                // Ajouter le bouton de retour au panneau gauche
                leftPanelList.appendChild(backButton);

                showCapteurForm();

            })
            .catch(error => console.error("Erreur lors du chargement des actionneurs", error));
    }


    // Afficher le formulaire pour le logement
    function showLogementForm() {
        document.getElementById("logement-form").style.display = 'block';
        document.getElementById("piece-form").style.display = 'none';
        document.getElementById("capteur-form").style.display = 'none';
        document.getElementById("actionneur-form").style.display = "none";
    }

    // Afficher le formulaire pour la pièce
    function showPieceForm() {
        document.getElementById("logement-form").style.display = 'none';
        document.getElementById("piece-form").style.display = 'block';
        document.getElementById("capteur-form").style.display = 'none';
        document.getElementById("actionneur-form").style.display = "none";
    }

    // Afficher le formulaire pour le capteur
    function showCapteurForm() {
        document.getElementById("logement-form").style.display = 'none';
        document.getElementById("piece-form").style.display = 'none';
        document.getElementById("capteur-form").style.display = 'block';
        document.getElementById("actionneur-form").style.display = "none";
    }

    // Afficher le formulaire Actionneur
    function showActionneurForm() {
        document.getElementById("logement-form").style.display = "none";
        document.getElementById("piece-form").style.display = "none";
        document.getElementById("capteur-form").style.display = "none";
        document.getElementById("actionneur-form").style.display = "block";
    }

    // Ajouter un logement
    document.getElementById("logement-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const adresse = document.getElementById("adresse").value;
        const num_tel = document.getElementById("num_tel").value;
        const adresse_IP = document.getElementById("adresse_IP").value;

        fetch(`${API_BASE}/logement`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                adresse: adresse,
                num_tel: num_tel,
                adresse_IP: adresse_IP
            })
        })
        .then(response => response.json())
        .then(data => {
            loadLogements(); // Recharge les logements après l'ajout
        })
        .catch(error => console.error("Erreur lors de l'ajout du logement", error));
    });


    // Ajouter une pièce
    document.getElementById("piece-form").addEventListener("submit", function (e) {
        e.preventDefault();
    
        const data = {
            nom: document.getElementById("nom").value,
            localisation: document.getElementById("localisation").value
        };

        fetch(`${API_BASE}/logement/${currentLogementId}/pieces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) // Conversion des données en format JSON
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Pièce ajoutée avec succès !");
                loadPieces(currentLogementId); // Recharger la liste des pièces
            } else {
                alert("Erreur : " + data.message);
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout de la pièce", error);
            alert("Erreur de requête : " + error);
        });
    });

    // Ajouter un capteur
    document.getElementById("capteur-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const data = {
            typeCA: document.getElementById("type").value,
            ref_commercial: document.getElementById("ref_commercial").value,
            port: document.getElementById("port").value
        };

        fetch(`${API_BASE}/piece/${currentPieceId}/capteurs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data) // Conversion des données en format JSON
        })
        .then(response => response.json())
        .then(data => {
            loadCapteursAndActionneurs(currentPieceId); // Recharger les capteurs de la pièce après l'ajout
        })
        .catch(error => console.error("Erreur lors de l'ajout du capteur", error));
    });

    // Ajouter un actionneur
    document.getElementById("actionneur-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const data = {
            typeCA: document.getElementById("type").value,
            ref_commercial: document.getElementById("ref_commercial").value,
            port: document.getElementById("port").value
        };

        fetch(`${API_BASE}/piece/${currentPieceId}/actionneurs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data) // Conversion des données en format JSON
        })
        .then(response => response.json())
        .then(data => {
            loadCapteursAndActionneurs(currentPieceId); // Recharger les capteurs de la pièce après l'ajout
        })
        .catch(error => console.error("Erreur lors de l'ajout du capteur", error));
    });

    // Initialiser le chargement des logements
    loadLogements();
});
