const BASE_URL = "http://127.0.0.1:5000"; // Remplacez par l'URL de votre serveur

// Références aux éléments HTML
const logementSelect = document.getElementById("logement-select");
const factureTypeSelect = document.getElementById("facture-type-select");
const loadDataBtn = document.getElementById("load-data-btn");
const factureTable = document.getElementById("facture-table");
const chartCanvas = document.getElementById("facture-chart").getContext("2d");

let chartInstance; // Pour stocker l'instance du graphique Chart.js

// Charger la liste des logements
async function loadLogements() {
    try {
        const response = await fetch(`${BASE_URL}/logement`);
        const logements = await response.json();

        // Ajouter les options à la liste déroulante des logements
        logements.forEach(logement => {
            const option = document.createElement("option");
            option.value = logement.numero;
            option.textContent = logement.nom || logement.adresse;
            logementSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des logements :", error);
    }
}

// Charger les factures pour un logement ou pour tous
async function loadFactures(idLogement = "all") {
    try {
        const url =
            idLogement === "all"
                ? `${BASE_URL}/logement` // Charge toutes les factures si "all"
                : `${BASE_URL}/logement/${idLogement}/factures`;

        const response = await fetch(url);
        let factures = await response.json();

        // Appliquer le filtre par type de facture
        const selectedFactureType = factureTypeSelect.value;
        if (selectedFactureType !== "all") {
            factures = factures.filter(facture =>
                facture.type_facture.toLowerCase() === selectedFactureType.toLowerCase()
            );
        }

        // Mise à jour de l'interface utilisateur
        updateFactureTable(factures);
        updateChart(factures);
    } catch (error) {
        console.error("Erreur lors du chargement des factures :", error);
    }
}

// Mettre à jour le tableau des factures
function updateFactureTable(factures) {
    // Effacer le contenu précédent du tableau
    factureTable.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Montant (€)</th>
            <th>Valeur consommée</th>
        </tr>
    `;

    // Ajouter les nouvelles données
    factures.forEach(facture => {
        const row = document.createElement("tr");
        // Formater la valeur consommée à 2 chiffres après la virgule
        const valeurConsommee = parseFloat(facture.valeur_consommee).toFixed(2);
        row.innerHTML = `
            <td>${facture.date_insertion}</td>
            <td>${facture.type_facture}</td>
            <td>${facture.montant}</td>
            <td>${valeurConsommee}</td>
        `;
        factureTable.appendChild(row);
    });
}

// Mettre à jour le graphique avec les nouvelles données
function updateChart(factures) {
    // Grouper les factures par type pour le graphique
    const factureTypes = {};
    factures.forEach(facture => {
        factureTypes[facture.type_facture] = (factureTypes[facture.type_facture] || 0) + facture.montant;
    });

    const labels = Object.keys(factureTypes);
    const data = Object.values(factureTypes);

    // Si un graphique existe déjà, le détruire avant d'en créer un nouveau
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Créer un nouveau graphique
    chartInstance = new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Montant total (€)",
                    data: data,
                    backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
                    
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: "white", // Couleur du texte des labels sur l'axe des abscisses
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)", // Optionnel : couleur des lignes de la grille
                    },
                },
                y: {
                    ticks: {
                        color: "white", // Couleur du texte des labels sur l'axe des ordonnées
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)", // Optionnel : couleur des lignes de la grille
                    },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: "white", // Couleur du texte de la légende (label)
                    },
                },
            },
        },
    });
}

// Ajouter une nouvelle facture (fonctionnalité POST)
async function addFacture(idLogement, type, montant, valeurConsommee) {
    try {
        const response = await fetch(`${BASE_URL}/logement/${idLogement}/factures`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type_facture: type,
                montant: montant,
                valeur_consommee: valeurConsommee,
            }),
        });

        const result = await response.json();
        if (result.status === "success") {
            alert("Facture ajoutée avec succès !");
            loadFactures(idLogement);
        } else {
            alert(result.message || "Erreur lors de l'ajout de la facture !");
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout de la facture :", error);
    }
}

// Gestion des événements
loadDataBtn.addEventListener("click", () => {
    const selectedLogement = logementSelect.value;
    loadFactures(selectedLogement === "all" ? "all" : selectedLogement);
});

// Initialisation de la page
loadLogements();
loadFactures(1); // Premier logement par défaut
