// var deButton = document.querySelector(".menu");

// deButton.onclick = toggleMenu;

// function toggleMenu() {  
//   var deNav = document.querySelector("nav");
//   deNav.classList.toggle("toonMenu");
// }


// window.onkeydown = handleKeydown;

// function handleKeydown(event) {
//   if (event.key == "Escape") {
//     var deNav = document.querySelector("nav");
//     deNav.classList.remove("toonMenu");
//   }
// }

document.addEventListener('DOMContentLoaded', () => {
  const usersList = document.getElementById('users-list'); // Div waar matches worden weergegeven

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
          const fav = event.target.value; // Waarde van de checkbox
          const checked = event.target.checked; // Of de checkbox is aangevinkt

          // Stuur een POST-verzoek naar de server
          fetch('/fav', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fav, checked })
          })
          .then(response => response.json())
          .then(data => {
              console.log('Favorites updated:', data);

              // Werk de lijst met matches bij
              usersList.innerHTML = `<h3>Potential Matches:</h3>`;
              data.potentialMatches.forEach(match => {
                  const userItem = document.createElement('div');
                  userItem.textContent = `${match.name} - Favorites: ${match.fav.join(", ")}`;
                  usersList.appendChild(userItem);
              });
          })
          .catch((error) => {
              console.error('Error updating favorites:', error);
          });
      });
  });
});

console.log ("hoi");


// function clickHeart() {
//   heart.classList.toggle("heartFilled");
// }

// liken
// let heart = document.querySelector(".heartFill")
// let heartstatus = true

// function clickHeart(){
//   if (heartstatus == true){
//       heart.classList.add("heartFilled");
//       heartstatus = false
//   } else {
//       heart.classList.remove("heartFilled");
//       heartstatus = true
//   }
// }

// heart.addEventListener('click',clickHeart)

document.addEventListener('DOMContentLoaded', () => {
  const usersList = document.getElementById('users-list'); // Div waar matches worden weergegeven

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
          const fav = event.target.value; // Waarde van de checkbox
          const checked = event.target.checked; // Of de checkbox is aangevinkt

          // Stuur een POST-verzoek naar de server
          fetch('/fav', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fav, checked })
          })
          .then(response => response.json())
          .then(data => {
              console.log('Favorites updated:', data);

              // Werk de lijst met matches bij
              usersList.innerHTML = `<h3>Potential Matches:</h3>`;
              data.potentialMatches.forEach(match => {
                  const userItem = document.createElement('div');
                  userItem.textContent = `${match.name} - Favorites: ${match.fav.join(", ")}`;
                  usersList.appendChild(userItem);
              });
          })
          .catch((error) => {
              console.error('Error updating favorites:', error);
          });
      });
  });
});

let hearts = document.querySelectorAll(".heartFill");
let heartstatus = true;

function clickHeart() {
  if (heartstatus == true) {
    this.classList.add("heartFilled");
    heartstatus = false;
  } else {
    this.classList.remove("heartFilled");
    heartstatus = true;
  }
}

hearts.forEach(function(heart) {
  heart.addEventListener('click', clickHeart);
});
var deButton = document.querySelector(".menu");

// // deButton.onclick = toggleMenu;

function toggleMenu() {  
  var deNav = document.querySelector("nav");
  deNav.classList.toggle("toonMenu");
}


window.onkeydown = handleKeydown;

function handleKeydown(event) {
  if (event.key == "Escape") {
    var deNav = document.querySelector("nav");
    deNav.classList.remove("toonMenu");
  }
}

console.log ("hoi");



document.addEventListener("DOMContentLoaded", function () {
    const totaalVragen = 6; // Aantal vragen
    const progressBar = document.getElementById("progressBar");
    const vraagTeller = document.getElementById("vraag-teller");

    //  Functie om de vraag teller bij te werken (Vraag X van 6)
    async function updateVraagTeller(vraagNummer) {
        if (vraagTeller) {
            vraagTeller.textContent = `Vraag ${vraagNummer} van ${totaalVragen}`;
        }
        try{
            const selectedOption = document.querySelector(`input[name="vraag${vraagNummer - 1}"]:checked`);
            const response = await fetch('/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  answer : selectedOption.value,  // De selected answer
                })
                
              });
              
              console.log(await response.json());
        }catch (error) {
            console.error("fout bij verzenden", error)
        }}

    //  Functie om de progress bar bij te werken
    function updateProgress(vraagNummer) {
        let percentage = ((vraagNummer - 1) / totaalVragen) * 100;
        progressBar.value = percentage;
    }

    // ✅ Fade-in/Fade-out effect bij wisselen van vragen
    function wisselVraag(huidige, volgende) {
        let huidigeContainer = document.getElementById(`vraag${huidige}-container`);
        let volgendeContainer = document.getElementById(`vraag${volgende}-container`);

        if (huidigeContainer && volgendeContainer) {
            // Fade-out huidige vraag
            huidigeContainer.style.opacity = 0;
            setTimeout(() => {
                huidigeContainer.classList.remove("actief");
                volgendeContainer.classList.add("actief");
                updateVraagTeller(volgende);
                updateProgress(volgende);
                
                // Fade-in nieuwe vraag
                setTimeout(() => {
                    volgendeContainer.style.opacity = 1;
                }, 100);
            }, 300);
        }
    }

    // Functie om naar de volgende vraag te gaan
    function volgendeVraag(vraagNummer) {
        if (vraagNummer < totaalVragen) {
            wisselVraag(vraagNummer, vraagNummer + 1);
        } else {
            toonOverzicht(); // Ga naar overzicht als laatste vraag klaar is
        }
    }

    //  Functie om naar de vorige vraag te gaan
    function vorigeVraag(vraagNummer) {
        if (vraagNummer > 1) {
            wisselVraag(vraagNummer, vraagNummer - 1);
        }
    }

    function toonOverzicht() {
        let overzichtContainer = document.getElementById("overzicht-container");
        let overzichtLijst = document.getElementById("overzicht-lijst");
        let laatsteVraagContainer = document.getElementById(`vraag${totaalVragen}-container`);
    
        overzichtLijst.innerHTML = ""; // Leegmaken voor nieuwe inhoud
    
        for (let i = 1; i <= totaalVragen; i++) {
            let lijstItem = document.createElement("li");
            let antwoord = document.querySelector(`input[name="vraag${i}"]:checked`);
    
            if (antwoord) {
                lijstItem.textContent = `Vraag ${i}: ${antwoord.value}`;
            } else {
                lijstItem.textContent = `Vraag ${i}: Geen antwoord geselecteerd`;
            }
            overzichtLijst.appendChild(lijstItem);
        }
    
        // Laatste vraag verbergen
        if (laatsteVraagContainer) {
            laatsteVraagContainer.classList.remove("actief");
            laatsteVraagContainer.style.opacity = 0;
        }
    
        // Overzicht tonen
        overzichtContainer.classList.add("actief");
        overzichtContainer.style.opacity = 1; // Zorg dat het zichtbaar wordt
    }

    //  Maak functies beschikbaar voor de HTML-knoppen
    window.volgendeVraag = volgendeVraag;
    window.vorigeVraag = vorigeVraag;
    window.toonOverzicht = toonOverzicht;
    window.terugNaarVragen = terugNaarVragen;

    console.log("Script correct geladen!");
});
// sorteren
var options = {
  valueNames: [ 'name' ]
};

var charactersList = new List('theList', options);
charactersList.sort('name', { order: "asc" });

// filteren
// var optionAll = document.querySelector("#filter-all");
// var optionFood = document.querySelector("#filter-food");
// var optionCultural = document.querySelector("#filter-cultural");
// var optionHistory = document.querySelector("#filter-history");

// optionAll.addEventListener("change", filterList);
// optionFood.addEventListener("change", filterList);
// optionCultural.addEventListener("change", filterList);
// optionHistory.addEventListener("change", filterList);


// function filterList(event){
//   let deLijst = document.querySelector(".seachResultdiv ul");
//   let nieuweFilter = event.target.value;
//   deLijst.className = "";
//   deLijst.classList.add(nieuweFilter);
// }

