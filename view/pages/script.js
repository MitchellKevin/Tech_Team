document.addEventListener("DOMContentLoaded", function() {
    function volgendeVraag(huidigeVraag) {
        let huidigeContainer = document.getElementById(`vraag${huidigeVraag}-container`);
        let volgendeContainer = document.getElementById(`vraag${huidigeVraag + 1}-container`);

        if (huidigeContainer && volgendeContainer) {
            huidigeContainer.classList.remove("actief");
            volgendeContainer.classList.add("actief");
        } else if (huidigeVraag === 10) {
            toonOverzicht(); // Ga naar overzicht als laatste vraag klaar is
        } else {
            console.error("Eén van de vragencontainers bestaat niet.");
        }
    }

    function updateProgress(vraagNummer) {
        const totaalVragen = 10; // Aantal vragen in de quiz
        const progressBar = document.getElementById("progressBar");
        
        // Bereken percentage en update de progress bar
        let percentage = ((vraagNummer - 1) / totaalVragen) * 100;
        progressBar.value = percentage;
    }
    
    function volgendeVraag(vraagNummer) {
        document.getElementById(`vraag${vraagNummer}-container`).classList.remove("actief");
        document.getElementById(`vraag${vraagNummer + 1}-container`).classList.add("actief");
        updateProgress(vraagNummer + 1);
    }
    
    function vorigeVraag(vraagNummer) {
        document.getElementById(`vraag${vraagNummer}-container`).classList.remove("actief");
        document.getElementById(`vraag${vraagNummer - 1}-container`).classList.add("actief");
        updateProgress(vraagNummer - 1);
    }
    

    function toonOverzicht() {
        let overzichtLijst = document.getElementById("overzicht-lijst");
        overzichtLijst.innerHTML = ""; // Leegmaken voor nieuwe inhoud

        for (let i = 1; i <= 10; i++) {
            let antwoord = document.querySelector(`input[name="vraag${i}"]:checked`);
            let lijstItem = document.createElement("li");

            if (antwoord) {
                lijstItem.textContent = `Vraag ${i}: ${antwoord.value}`;
            } else {
                lijstItem.textContent = `Vraag ${i}: Geen antwoord geselecteerd`;
            }

            overzichtLijst.appendChild(lijstItem);
        }

        document.getElementById("vraag10-container").classList.remove("actief");
        document.getElementById("overzicht-container").classList.add("actief");
    }

    function terugNaarVragen() {
        document.getElementById("overzicht-container").classList.remove("actief");
        document.getElementById("vraag10-container").classList.add("actief");
    }

    // Maak functies beschikbaar voor HTML-knoppen
    window.volgendeVraag = volgendeVraag;
    window.vorigeVraag = vorigeVraag;
    window.toonOverzicht = toonOverzicht;
    window.terugNaarVragen = terugNaarVragen;

    // Budget slider functionaliteit
    const budgetSlider = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');

    if (budgetSlider && budgetValue) {
        budgetSlider.addEventListener('input', function() {
            let value = this.value;
            if (value <= 30) {
                budgetValue.textContent = "Minder dan €30";
            } else if (value <= 60) {
                budgetValue.textContent = "€30 - €60";
            } else {
                budgetValue.textContent = "Meer dan €60";
            }
        });
    }

    console.log("Script correct geladen!");
});