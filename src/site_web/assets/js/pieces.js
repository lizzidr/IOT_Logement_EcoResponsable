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
                        
                            <div class="icon-card" onclick="fetchMesures(${capteur.id}, ${idPiece})">
                                <i class="bi bi-thermometer-half"></i>
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
    async function fetchMesures(idCapteur, idPiece) {
        try {
            const response = await fetch(`${baseURL}/capteur/${idCapteur}/mesures`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des mesures");

            const mesures = await response.json();
            const dynamicContent = document.getElementById("dynamic-content");
            const backButton = document.getElementById("back-button");

            // Préparer les données pour le graphe
            const labels = mesures.map(m => {
                 // Remplacer l'espace par 'T' pour que ce soit compatible avec le format ISO 8601
                const date = new Date(m.date_insertion); // Convertir la chaîne en objet Date
                console.log(m.date_insertion); // Afficher la date pour vérifier
                return date.toLocaleString('fr-FR'); // Retourner l'objet Date pour l'utiliser dans le graphique
            });
            const data = mesures.map(m => m.valeur);

            dynamicContent.innerHTML = `
                <div class="container py-5">
                    <h3 class="text-center mb-4">Mesures du Capteur</h3>
                    <div class="row g-4">
                        <!-- Détails du capteur -->

                            <div class="card shadow-sm p-3 mb-4 bg-light rounded">
                                <h5 class="text-center mb-3">Détails du Capteur</h5>
                                <ul class="list-unstyled">
                                    <li><strong>ID Capteur :</strong> ${idCapteur}</li>
                                    <li><strong>Total des mesures :</strong> ${mesures.length}</li>
                                    <li><strong>Valeur moyenne :</strong> ${(
                                        data.reduce((a, b) => a + b, 0) / data.length
                                    ).toFixed(2)}</li>
                                </ul>
                            </div>

                        <!-- Graphique des mesures -->

                            <div class="card shadow-sm p-3 bg-light rounded">
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
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer les mesures.");
        }
    }

    // Ajouter les fonctions au DOM global pour permettre leur utilisation dans les boutons
    window.fetchPieces = fetchPieces;
    window.fetchCapteurs = fetchCapteurs;
    window.fetchMesures = fetchMesures;
    //window.fetchFactures = fetchFactures;
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

