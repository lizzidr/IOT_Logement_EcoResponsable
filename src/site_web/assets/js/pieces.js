document.addEventListener("DOMContentLoaded", function () {
    // Récupérer l'ID du logement depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const idLogement = urlParams.get('id');
    window.idLogement = idLogement;
    // Vérification si l'ID est présent
    if (!idLogement) {
        alert("Aucun ID de logement fourni !");
        window.location.href = "logements.html";
    }

    // Simuler le fetch des détails du logement
    document.getElementById("logement-name").textContent = `Logement N°${idLogement}`;

    // URL de base pour les requêtes API
    const baseURL = "http://127.0.0.1:5000";

    // Fonction pour récupérer et afficher les pièces
    // Fonction pour afficher les cartes des pièces
    console.log(idLogement);
    async function fetchPieces(idLogement) {
        try {
            console.log(idLogement);
            const response = await fetch(`${baseURL}/logement/${idLogement}/pieces`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des pièces");

            const pieces = await response.json();
            const dynamicContent = document.getElementById("dynamic-content");
            const backButton = document.getElementById("back-button");

            // Remplacer le contenu dynamique par les cartes des pièces
            dynamicContent.innerHTML = `
                <div class="row g-4">
                    ${pieces
                        .map(
                            piece => `
                        
                            <div class="icon-card" onclick="fetchCapteurs(${piece.id})">
                                <i class="bi bi-door-open"></i>
                                <h5>${piece.nom}</h5>
                                <p class="text-muted">${piece.localisation}</p>
                            </div>
                        `
                        )
                        .join("")}
                </div>
            `;

            backButton.innerHTML = `
                <button class="btn btn-secondary" onclick="goBackToMainPage()">
                    <i class="bi bi-arrow-left-circle-fill"></i> Retour
                </button>
            `;

        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer les pièces.");
        }
    }

    // Fonction pour afficher les cartes des capteurs d'une pièce
    async function fetchCapteurs(idPiece) {
        try {
            const response = await fetch(`${baseURL}/piece/${idPiece}/capteurs`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des capteurs");

            const capteurs = await response.json();
            const dynamicContent = document.getElementById("dynamic-content");
            const backButton = document.getElementById("back-button");


            // Remplacer le contenu dynamique par les cartes des capteurs
            dynamicContent.innerHTML = `
                <div class="row g-4">
                    ${capteurs
                        .map(
                            capteur => `
                        
                            <div class="icon-card" onclick="fetchMesures(${capteur.id}, ${idPiece}, '${capteur.typeCA}')">
                                <i class="${getSensorIcon(capteur.typeCA)}"></i>
                                <h5>${capteur.typeCA}</h5>
                                <p class="text-muted">Port : ${capteur.port}</p>
                            </div>
                        `
                        )
                        .join("")}
                </div>
                
            `;

            backButton.innerHTML = `
                <button class="btn btn-secondary" onclick="fetchPieces(${idLogement})">
                    <i class="bi bi-arrow-left-circle-fill"></i> Retour
                </button>
            `;
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer les capteurs.");
        }
    }

    // Fonction pour afficher les mesures d'un capteur

async function fetchMesures(idCapteur, idPiece, typeCapteur) {
    try {
        const response = await fetch(`${baseURL}/capteur/${idCapteur}/mesures`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des mesures");

        const mesures = await response.json();
        const dynamicContent = document.getElementById("dynamic-content");
        const backButton = document.getElementById("back-button");

        // Définir les seuils critiques
        const thresholds = {
            "Capteur de Temperature": 30, // Seuil de température critique (par exemple 30°C)
            "Capteur de Luminosité": 800, // Seuil de luminosité critique (par exemple 800 lux)
            "Capteur de Consommation Electrique": 1000, // Seuil de consommation (par exemple 1000 kWh)
        };

        // Définir les actionneurs associés
        const actuators = {
            "Capteur de Temperature": "Regulateur de Chauffage",
            "Capteur de Luminosité": "Eclairage",
            "Capteur de Consommation Electrique": "Prise Electrique",
        };

        // Préparer les données pour le graphe
        const labels = mesures.map(m => {
            const date = new Date(m.date_insertion);
            return date.toLocaleString('fr-FR');
        });
        const data = mesures.map(m => m.valeur);

        // Détecter les valeurs élevées et proposer des actions
        const highValues = mesures.filter(m => m.valeur > thresholds[typeCapteur]);
        console.log(thresholds[typeCapteur]);
        const actionMessage = highValues.length > 0
            ? `Alerte : Des valeurs de mesure élevées ont été détectées.`
            : "Aucune valeur anormale détectée.";

        dynamicContent.innerHTML = `
            <div class="container py-5">
                <h3 class="text-center mb-4">Mesures du Capteur</h3>
                <div class="row g-4">
                    <!-- Détails du capteur -->
                    <div class="card-mesure shadow-sm p-3 mb-4 bg-light rounded">
                        <h5 class="text-center mb-3">Détails du Capteur</h5>
                        <ul class="list-unstyled">
                            <li><strong>ID Capteur :</strong> ${idCapteur}</li>
                            <li><strong>Total des mesures :</strong> ${mesures.length}</li>
                            <li><strong>Valeur moyenne :</strong> ${(
                                data.reduce((a, b) => a + b, 0) / data.length
                            ).toFixed(2)}</li>
                            <li><strong>Message d'alerte :</strong> ${actionMessage}</li>
                            <div id="alert-container" class="mb-4"></div>
                        </ul>
                    </div>

                    <!-- Graphique des mesures -->
                    <div class="card-mesure shadow-sm p-3 bg-light rounded">
                        <canvas id="mesuresGraph"></canvas>
                    </div>
                </div>
            </div>
        `;

        backButton.innerHTML = `
            <button class="btn btn-secondary" onclick="fetchCapteurs(${idPiece})">
                <i class="bi bi-arrow-left-circle-fill"></i> Retour
            </button>
        `;

        // Générer le graphe
        const ctx = document.getElementById("mesuresGraph").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels, // Dates sur l'axe des X
                datasets: [
                    {
                        label: "Valeurs des mesures",
                        data, // Valeurs des mesures sur l'axe des Y
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        borderColor: "#007bff",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                },
            },
        });

        // Activer l'actionneur si nécessaire
        if (highValues.length > 0) {
            activateActuator(actuators[typeCapteur]);
        }

    } catch (error) {
        console.error(error);
        alert("Impossible de récupérer les mesures.");
    }
}

// Fonction pour activer un actionneur
function activateActuator(actuatorName) {
    console.log(`Activation de l'actionneur : ${actuatorName}`);
    
    // Trouver l'élément où afficher le message
    const alertContainer = document.getElementById("alert-container");

    // Insérer un message dans le conteneur d'alertes
    alertContainer.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Action requise :</strong> L'actionneur "${actuatorName}" a été activé.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}


// Liste des capteurs avec leurs types et icônes
const sensors = {
    "Capteur de Temperature": "bi bi-thermometer",
    "Capteur de Luminosité": "bi bi-brightness-high",
    "Capteur de Consommation Electrique": "bi bi-lightning",
};

// Fonction pour afficher l'icône correspondante à chaque capteur
function getSensorIcon(sensorType) {
    return sensors[sensorType] || "bi bi-tools"; // Icône par défaut
}


    function fetchFactures(idLogement) {
        // Mettre à jour le titre de la page avec le nom du logement
        document.getElementById('logement-name').innerHTML = `Factures du Logement ${idLogement}`;
        
        // Requête pour récupérer les factures via l'API Flask
        fetch(`${baseURL}/logement/${idLogement}/factures`)
            .then(response => response.json()) // On suppose que le serveur retourne un JSON
            .then(data => {
                // Si la requête réussit, on vérifie si on a des factures à afficher
                if (data.length > 0) {
                    // Vider la zone de contenu dynamique pour les nouvelles données
                    const dynamicContent = document.getElementById('dynamic-content');
                    dynamicContent.innerHTML = '';
    
                    // Créer une carte pour chaque facture
                    data.forEach(facture => {
                        const factureCard = document.createElement('div');
                        factureCard.classList.add('card', 'shadow-sm', 'mb-4');
    
                        // Contenu de la carte avec les informations de la facture
                        factureCard.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Facture #${facture.numero}</h5>
                            <ul>
                                <li><strong>Type :</strong> ${facture.type_facture}</li>
                                <li><strong>Date :</strong> ${new Date(facture.date_insertion).toLocaleDateString()}</li>
                                <li><strong>Montant :</strong> ${facture.montant} €</li>
                                
                            </ul>
                            <button class="btn btn-primary" onclick="voirDetailsFacture(${facture.numero}, '${facture.type_facture}', '${facture.date_insertion}', ${facture.montant}, ${parseFloat(facture.valeur_consommee).toFixed(2)})">Voir les détails</button>
                        </div>
                        `;
                        
                        // Ajouter la carte au conteneur
                        dynamicContent.appendChild(factureCard);
                    });
                } else {
                    // Afficher un message si aucune facture n'est disponible
                    document.getElementById('dynamic-content').innerHTML = `
                        <div class="alert alert-warning" role="alert">
                            Aucune facture disponible pour ce logement.
                        </div>
                    `;
                }
            })
            .catch(error => {
                // En cas d'erreur, afficher un message d'erreur
                console.error('Erreur lors de la récupération des factures:', error);
                document.getElementById('dynamic-content').innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Une erreur est survenue lors de la récupération des factures.
                    </div>
                `;
            });
    }
    
    function getUnitForType(type) {
        // Fonction pour obtenir l'unité de consommation en fonction du type de facture
        switch (type.toLowerCase()) {
            case 'électricité':
                return 'kWh';
            case 'eau':
                return 'm³';
            case 'gaz':
                return 'm³';
            default:
                return ''; // Pas d'unité pour d'autres types
        }
    }
    
    function voirDetailsFacture(numero, type, date, montant, consommation) {
        // Créer un modal pour afficher les détails de la facture
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('id', 'factureModal');
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'factureModalLabel');
        modal.setAttribute('aria-hidden', 'true');
    
        // On génère le contenu spécifique à chaque type de facture
        let alertMessage = '';
        let suggestions = '';
    
        if (type.toLowerCase() === 'électricité') {
            if (consommation > 500) {
                alertMessage = `<div class="alert alert-danger" role="alert">
                                    Alerte : La consommation d'électricité dépasse le seuil recommandé de 500 kWh.
                                </div>`;
            }
            suggestions = `
                <h5>Suggestions :</h5>
                <ul>
                    <li>Éteignez les appareils électriques inutiles pour réduire la consommation.</li>
                    <li>Envisagez l'utilisation d'appareils à faible consommation d'énergie.</li>
                    <li>Investissez dans des panneaux solaires pour réduire votre facture d'électricité.</li>
                </ul>
            `;
        } else if (type.toLowerCase() === 'eau') {
            if (consommation > 50) {
                alertMessage = `<div class="alert alert-danger" role="alert">
                                    Alerte : La consommation d'eau dépasse le seuil recommandé de 50 m³.
                                </div>`;
            }
            suggestions = `
                <h5>Suggestions :</h5>
                <ul>
                    <li>Réparez les fuites d'eau pour éviter une surconsommation inutile.</li>
                    <li>Installez des réducteurs de débit pour les robinets et douches.</li>
                    <li>Collectez l'eau de pluie pour l'arrosage et les autres besoins non alimentaires.</li>
                </ul>
            `;
        } else if (type.toLowerCase() === 'gaz') {
            if (consommation > 100) {
                alertMessage = `<div class="alert alert-danger" role="alert">
                                    Alerte : La consommation de gaz dépasse le seuil recommandé de 100 m³.
                                </div>`;
            }
            suggestions = `
                <h5>Suggestions :</h5>
                <ul>
                    <li>Vérifiez l'isolation de votre logement pour éviter les pertes de chaleur.</li>
                    <li>Réduisez la température de votre chaudière et des radiateurs.</li>
                    <li>Envisagez d'utiliser des alternatives au gaz pour chauffer votre logement, comme des pompes à chaleur.</li>
                </ul>
            `;
        } else {
            // Pour d'autres types de factures, on n'ajoute pas d'alerte
            alertMessage = '';
            suggestions = `
                <h5>Suggestions :</h5>
                <ul>
                    <li>Examinez vos habitudes de consommation pour détecter des économies possibles.</li>
                    <li>Consultez un professionnel pour améliorer l'efficacité de vos installations.</li>
                </ul>
            `;
        }
    
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="factureModalLabel">Détails de la Facture #${numero}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul>
                            <li><strong>Type :</strong> ${type}</li>
                            <li><strong>Date de facturation :</strong> ${new Date(date).toLocaleDateString()}</li>
                            <li><strong>Montant :</strong> ${montant.toFixed(2)} €</li>
                            <li><strong>Valeur consommée :</strong> ${consommation} ${getUnitForType(type)}</li>
                        </ul>
    
                        ${alertMessage}
    
                        ${suggestions}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter le modal au corps de la page
        document.body.appendChild(modal);
    
        // Afficher le modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    
        // Fermer le modal et le retirer du DOM
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    

    // Ajouter les fonctions au DOM global pour permettre leur utilisation dans les boutons
    window.fetchPieces = fetchPieces;
    window.fetchCapteurs = fetchCapteurs;
    window.fetchMesures = fetchMesures;
    window.fetchFactures = fetchFactures;
    window.voirDetailsFacture = voirDetailsFacture;
});

// Fonction pour revenir à la page des cartes principales (Pièces, Factures)
// Fonction de retour vers la page des pièces (avec l'ID du logement dans l'URL)
function goBackToMainPage() {
    // Récupérer l'ID du logement depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const logementId = urlParams.get('id'); // ID du logement

    // Rediriger vers la page pieces.html avec l'ID du logement
    if (logementId) {
        window.location.href = `pieces.html?id=${logementId}`;
    } else {
        // Si l'ID n'est pas trouvé, rediriger vers la page d'accueil par défaut
        window.location.href = "pieces.html"; // Remplacez par la page par défaut si nécessaire
    }
}

