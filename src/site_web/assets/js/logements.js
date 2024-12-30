document.addEventListener("DOMContentLoaded", function () {
    const logementList = document.getElementById("logement-list");
    const form = document.getElementById("add-logement-form");
    const formMessage = document.getElementById("form-message");

    // Charger la liste des logements
    function loadLogements() {
        fetch('http://127.0.0.1:5000/logement') // API GET pour récupérer les logements
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des logements");
                }
                return response.json();
            })
            .then(data => {
                logementList.innerHTML = ""; // Réinitialiser la liste
                if (data.length === 0) {
                    logementList.innerHTML = "<div class='alert alert-warning'>Aucun logement trouvé.</div>";
                } else {
                    data.forEach(logement => {
                        const cardCol = document.createElement("div");
                        cardCol.classList.add("card-body");

                        const card = document.createElement("div");
                        card.classList.add("logement");

                        card.innerHTML = `
                            <div class="card-body">
                                <h5 class="card-title">${logement.adresse}</h5>
                                <p class="card-text">Téléphone : ${logement.num_tel}</p>
                                <p class="card-text">Adresse IP : ${logement.adresse_IP}</p>
                                <a href="pieces.html?id=${logement.numero}" class="btn btn-primary">Voir les pièces</a>
                            </div>
                        `;

                        cardCol.appendChild(card);
                        logementList.appendChild(cardCol);
                    });
                }
            })
            .catch(error => {
                console.error(error);
                logementList.innerHTML = "<div class='alert alert-danger'>Impossible de charger les logements.</div>";
            });
    }

    // Ajouter un logement via le formulaire
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêcher le rechargement de la page

        const adresse = document.getElementById("adresse").value.trim();
        const num_tel = document.getElementById("num_tel").value.trim();
        const adresse_IP = document.getElementById("adresse_IP").value.trim();

        if (!adresse || !num_tel || !adresse_IP) {
            formMessage.innerHTML = `<div class="alert alert-warning">Veuillez remplir tous les champs.</div>`;
            return;
        }

        fetch('http://127.0.0.1:5000/logement', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ adresse, num_tel, adresse_IP }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erreur lors de l'ajout du logement");
                }
                return response.json();
            })
            .then(data => {
                formMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                form.reset(); // Réinitialiser le formulaire après succès
                loadLogements(); // Recharger la liste des logements
            })
            .catch(error => {
                console.error(error);
                formMessage.innerHTML = `<div class="alert alert-danger">Erreur lors de l'ajout du logement.</div>`;
            });
    });

    // Charger les logements au démarrage
    loadLogements();
});
