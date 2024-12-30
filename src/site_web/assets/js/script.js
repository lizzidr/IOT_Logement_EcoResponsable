///////////////////// PAGE LOGEMENT ////////////////////
// Remplir la liste des logements via l'API GET
document.addEventListener("DOMContentLoaded", function() {
    const logementList = document.getElementById("logement-list");

    // Utiliser fetch() pour récupérer les logements depuis l'API
    fetch('http://127.0.0.1:5000/logement')  // Assurez-vous que l'URL de votre API est correcte
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des logements');
            }
            return response.json();  // Convertir la réponse en JSON
        })
        .then(data => {
            // Vérifier si des logements ont été renvoyés
            if (data.length === 0) {
                logementList.innerHTML = "<div class='col-12'><div class='alert alert-warning'>Aucun logement trouvé.</div></div>";
            } else {
                // Pour chaque logement, créer une carte et l'ajouter à la page
                data.forEach(logement => {
                    const cardCol = document.createElement("div");
                    cardCol.classList.add("col-md-4", "mb-4");

                    const card = document.createElement("div");
                    card.classList.add("card", "h-100");

                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${logement.adresse}</h5>
                            <p class="card-text">Numéro : ${logement.numero}</p>
                            <a href="pieces.html?id=${logement.numero}" class="btn btn-primary">Voir les pièces</a>
                        </div>
                    `;

                    cardCol.appendChild(card);
                    logementList.appendChild(cardCol);
                });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des logements :", error);
            logementList.innerHTML = "<div class='col-12'><div class='alert alert-danger'>Impossible de charger les logements.</div></div>";
        });
});



///////////////////// PAGE PIECE ///////////////////
// Récupérer l'ID du logement depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const logementId = urlParams.get('id');

// Fonction pour récupérer les pièces via l'API
document.addEventListener("DOMContentLoaded", function() {
    const pieceList = document.getElementById("piece-list");

    // Effectuer une requête GET pour récupérer les pièces du logement
    fetch(`http://192.168.39.217:5000/logement/${logementId}/pieces`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des pièces');
            }
            return response.json();  // Convertir la réponse en JSON
        })
        .then(data => {
            // Vérifier si des pièces ont été renvoyées
            if (data.length === 0) {
                pieceList.innerHTML = "<li class='list-group-item'>Aucune pièce trouvée pour ce logement.</li>";
            } else {
                // Pour chaque pièce, créer un élément de liste et l'ajouter à la page
                data.forEach(piece => {
                    const listItem = document.createElement("li");
                    listItem.classList.add("list-group-item");
                    listItem.innerHTML = `<a href="capteurs.html?id=${piece.id}">${piece.nom}</a>`;
                    pieceList.appendChild(listItem);
                });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des pièces :", error);
            pieceList.innerHTML = "<li class='list-group-item'>Impossible de charger les pièces.</li>";
        });
});