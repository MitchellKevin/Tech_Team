document.addEventListener("DOMContentLoaded", function() {
    function volgendeVraag(huidigeVraag) {
        let huidigeContainer = document.getElementById(`vraag${huidigeVraag}-container`);
        let volgendeContainer = document.getElementById(`vraag${huidigeVraag + 1}-container`);

        if (huidigeContainer && volgendeContainer) {
            huidigeContainer.classList.remove("actief");
            volgendeContainer.classList.add("actief");
        } else {
            console.error("Eén van de vragencontainers bestaat niet.");
        }
    }

    function vorigeVraag(huidigeVraag) {
        let huidigeContainer = document.getElementById(`vraag${huidigeVraag}-container`);
        let vorigeContainer = document.getElementById(`vraag${huidigeVraag - 1}-container`);

        if (huidigeContainer && vorigeContainer) {
            huidigeContainer.classList.remove("actief");
            vorigeContainer.classList.add("actief");
        } else {
            console.error("Eén van de vragencontainers bestaat niet.");
        }
    }

    // Maak de functies globaal beschikbaar
    window.volgendeVraag = volgendeVraag;
    window.vorigeVraag = vorigeVraag;

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