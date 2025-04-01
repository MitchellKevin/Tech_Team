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

// deButton.onclick = toggleMenu;

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
