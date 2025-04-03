let livres = [];

// Charge les livres depuis le fichier JSON
fetch('data/livres.json')
    .then(response => response.json())
    .then(data => {
        livres = data;
        afficherNombreDeLivres(); // Met à jour le nombre total de livres
    })
    .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));

// Fonction de recherche
function rechercher() {
    let query = document.getElementById('search').value.toLowerCase();
    
    if (query === "mention spéciale") {
        let resultats = livres.filter(livre => livre.mention_speciale);
        afficherLivres(resultats);
        return;
    }    

    if (query.length > 0) {
        let resultats = livres.filter(livre => {
            return livre.titre.toLowerCase().includes(query) ||
                   livre.auteur.toLowerCase().includes(query) ||
                   livre.mots_cles.some(mot => mot.toLowerCase().includes(query));
        });

        // Tri par pertinence
        resultats.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Priorité au titre
            if (a.titre.toLowerCase().includes(query)) scoreA += 100;
            if (b.titre.toLowerCase().includes(query)) scoreB += 100;

            // Priorité à l’auteur
            if (a.auteur.toLowerCase().includes(query)) scoreA += 50;
            if (b.auteur.toLowerCase().includes(query)) scoreB += 50;

            // Priorité aux mots-clés (plus un mot-clé est tôt dans la liste, plus il compte)
            let indexA = a.mots_cles.findIndex(mot => mot.toLowerCase().includes(query));
            let indexB = b.mots_cles.findIndex(mot => mot.toLowerCase().includes(query));

            if (indexA !== -1) scoreA += 20 - indexA;
            if (indexB !== -1) scoreB += 20 - indexB;

            return scoreB - scoreA;
        });

        // Séparer les livres normaux et ceux de l'enfance
        let normaux = resultats.filter(livre => !["Enfance", "Petite enfance"].includes(livre.emplacement));
        let enfance = resultats.filter(livre => livre.emplacement === "Enfance");
        let petiteEnfance = resultats.filter(livre => livre.emplacement === "Petite enfance");

        // Réassembler dans l'ordre souhaité
        resultats = [...normaux, ...enfance, ...petiteEnfance];

        afficherLivres(resultats);
    } else {
        afficherLivres([]);
    }
}

function afficherNombreDeLivres() {
    let compteurLivres = document.getElementById('compteur-livres');
    if (!compteurLivres) {
        compteurLivres = document.createElement('p');
        compteurLivres.id = 'compteur-livres';
        compteurLivres.style.fontSize = '1em';
        compteurLivres.style.fontWeight = 'bold';
        compteurLivres.style.marginTop = '10px';
        compteurLivres.style.color = '#3b2a2a';
        document.querySelector('.search-container').appendChild(compteurLivres);
    }
    compteurLivres.textContent = `La bibliothèque compte actuellement ${livres.length} livres`;
}

function afficherLivres(resultats) {
    let resultatsContainer = document.getElementById('resultats');
    resultatsContainer.innerHTML = '';

    if (resultats.length === 0) {
        resultatsContainer.innerHTML = '<p>Aucun livre trouvé... <br>Cherche des mots-clés en lien avec ce qui t\'intéresse ou demande-moi si tu ne trouves pas</p>';
        return;
    }

    resultats.forEach(livre => {
        let livreDiv = document.createElement('div');
        livreDiv.classList.add('livre');

        let avisHTML = livre.avis.length > 0 ? 
            livre.avis.map(avis => `<div class="avis-case">${avis}</div>`).join('') :
            '<p>Aucun avis pour ce livre.</p>';

        let emplacement = livre.emplacement && livre.emplacement.trim() !== "" ? livre.emplacement : "Inconnu, n\'hésite pas à demander de l'aide à Léon, il sera ravi de t'aider à trouver ce livre!";
        let resumeComplet = livre.resume && livre.resume.trim() !== "" ? livre.resume : "Pas de résumé.";
        let resumeCourt = resumeComplet.length > 300 ? resumeComplet.substring(0, 300) + '...' : resumeComplet;
        let voirPlus = resumeComplet.length > 300 ? `<span class="voir-plus" style="cursor: pointer; font-weight: bold;"> Voir plus</span>` : '';

        livreDiv.innerHTML = `
            ${livre.mention_speciale ? `<div class="bandeau">📖 Me parle pas tant que t'as pas lu ça !</div>` : ''}
            <div class="infos-livre">
                <div class="image">
                    <img src="${livre.image}" alt="${livre.titre}">
                </div>
                <div class="separateur"></div>
                <div class="details">
                    <h3>${livre.titre}</h3>
                    ${livre.auteur && livre.auteur.trim() !== "" ? `<p><strong>Auteur:</strong> ${livre.auteur}</p>` : ''}
                    <p><strong>Emplacement:</strong> ${emplacement}</p>
                    <p><strong>Résumé:</strong> <span class="resume-court">${resumeCourt}</span><span class="resume-complet" style="display: none;">${resumeComplet}</span>${voirPlus}</p>
                </div>
            </div>
            <section class="avis">
                ${avisHTML}
            </section>
        `;

        resultatsContainer.appendChild(livreDiv);
    });

    document.querySelectorAll('.voir-plus').forEach(element => {
        element.addEventListener('click', function () {
            let parent = this.parentElement;
            let court = parent.querySelector('.resume-court');
            let complet = parent.querySelector('.resume-complet');
            if (complet.style.display === 'none') {
                complet.style.display = 'inline';
                court.style.display = 'none';
                this.textContent = ' Voir moins';
            } else {
                complet.style.display = 'none';
                court.style.display = 'inline';
                this.textContent = ' Voir plus';
            }
        });
    });
}

// Vérifier la touche "Entrée" pour effectuer la recherche
function verifierEntree(event) {
    if (event.key === 'Enter') {
        rechercher();
    }
}