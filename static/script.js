<<<<<<< HEAD
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
=======
var deButton = document.querySelector(".menu");

deButton.onclick = toggleMenu;

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
>>>>>>> Account
