console.log("script.js is linked and running!");
let ranking=[]; 
let readyRegistration; // global-ish
let subscription; 
let showFullRanking = false;

// Pour vider les fichiers, utiliser echo//
// Key definition of variables : function parameter such as displayRanking(ranking) is a variable that is created when the function runs but exists only inside the function//
// Local variables such as const ranking or let ranking that are created inside functions have nothing to do with global variables of the same name//
// Creating a global variable works outside a function with let ranking = [], but if you recreate a variable inside a function it shadows it]
// NOTE THAT SCRIPT.JS IN JUST THE FRONTEND : it has access to localstorage, but does not control security. It can send request with fetch//
// Fetch is async (it doesn't block code, it sends a request, returns a promise until there is response, and then returns response//


// Fetching visits 
fetch('/visit') 
	// converting the received answer to js
	.then(response => response.json())
	//Then I want him to give me the value stored inside visitors
	// So I call a variable named data and tell it : get the HTML Id span, and put in the text content the data that equals to the visitors
	//What the following line says is : when the answer is ready, run this function, and call the variable response.json data
	.then(data => {
        document.getElementById('visitorCount').textContent = data.visitors;
		console.log("new visitor was added to the count")
    });

// Saving user ids with local storage // 


// first : checking user id does not already exist in local storage // 
function getUserId() {
	let userId = localStorage.getItem("userId"); 
	if (!userId) {
		// Generating random ID// 
		userId = crypto.randomUUID(); 
		console.log(userId + "attributed"); 
		// Then saving to browser //
		localStorage.setItem("userId", userId); 
		return userId; 
		// La fonction retourne userId // 
	}
	return userId; 
}
// Then use userid to custom triggernot// 

async function uploadID() { 
	const responseID = await fetch('/api/verifyID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId : userId })
		// le body = tout ce qui est envoyé, dedans on demande l'éxécution de la fonction getUserId//
    });
	const result = await responseID.json(); 
}

 
	
	

// notifications 
async function triggernot() {
	console.log("triggernot is being executed"); 
	// Checking if service worker is used br navigator// 	
	alert("Eugène t'informe que Google chrome te donnerait la possibilité de recevoir des notifications concernant les prochains évènements (Chrome est nécessaire). Tu peux passer sur Chrome pour ne plus jamais avoir ce popup. (//js triggernot async never permitted//)");
	const permission = await Notification.requestPermission(); 
	if (permission !== "granted") {
	}
	// Checking what user chooses// 
	if (permission === 'granted') {
    console.log('Notification permission granted.');
	} else if (permission === 'denied') {
    console.log('Notification permission denied.');
	openpage2(); 
	return; 
    return; // Stop if denied
	} else {
    console.log('Notification permission dismissed.');
	openpage2(); 
    return; // User closed the popup without choosing
	}
	// Step 3: Get the active Service Worker, waiting for full activity// 
	const registration = await navigator.serviceWorker.ready;
	console.log('Le service worker est prêt', registration);
	// Extremely important : creation of a Pushsubscription object that contains endpoint URL, and cryptographic keys for payload. Lives in browser//
	// Basically next object has options, and it means I want to subscribe this client to push notifications for this service worker//
	// It returns a promise which is why we use await to wait for the results//
	const subscription = await registration.pushManager.subscribe({ // Push manager is structure that handles subscriptions//
		userVisibleOnly: true, // Required by browser: every push must show a notification
		applicationServerKey: urlBase64ToUint8Array('BK6D5ZFZZeM-zklBGvpdivHgaeYa4YL_EbKT9rO81T5D_0VgusDFGicNKvjl1BfSBlV6WC5aXAY5oVmFbnMS1-o')// Vapid key authenticates server, and it's converted to be readable by browser//
	});
	// Sending subscription to backend//
	await fetch('/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription)
	});
	alert("subscribed to push notifications!"); 
	openpage2 ();
}; 
	
	
	
	
	
	






// Conversion function// 
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


//The following code ensures the opening of the popup box when button is clicked

function openPopup() {
	//That calls for the elemnt in HTML with the id popup 
	const response = await fetch("/api/verifyID");
	const data = await response.json(); // this parses JSON automatically
	if data.users.includes(userId) { 
		openpage2(); 
	} else {
		uploadID() ; 
	} 
}
		
		
	
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
	// block actually means make it visible
}

async function closePopup() {
	console.log("close popup is been executed")
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
	// Throwing function only if subscription doesn't exist// 
	if (!('serviceWorker' in navigator)) {
		console.error('Service Workers not supported');
		return null;
	}
	    try {
			// You need a service worker registered for this line to work//
			const registration = await navigator.serviceWorker.ready;
			const existingSub = await registration.pushManager.getSubscription();
			console.log("existingsub" + existingSub); 
			if (!existingSub) { 
				try {
					await triggernot(); 
					return; 
            } catch (err) {
                console.error("triggernot failed:", err);
            }
        }
    } catch (err) {
        console.error("Service Worker or Push subscription failed:", err);
    }

    openpage2(); // guaranteed to run even if errors occurred

}


function openPopup2() {
	//That calls for the elemnt in HTML with the id popup 
    document.getElementById("popup2").style.display = "block";
    document.getElementById("overlay").style.display = "block";
	// block actually means make it visible
}

function closePopup2() {
	console.log("close popup2 is been executed")
    document.getElementById("popup2").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

// Then, functions to open the second popup when adding credits 
function openCreditPopup() {
    document.getElementById("creditPopup").style.display = "block";
}

// Fonction pour fermer le popup
function closeCreditPopup() {
    document.getElementById("creditPopup").style.display = "none";
}





document.getElementById("submitBtn").addEventListener("click", function(event) {
    submitName();  // only runs on click
});

// Event listener second button//

document.getElementById("submitBtn2").addEventListener("click", function(event) {
    submitName2();  // only runs on click
	openCreditPopup() ;
});

// Event listener add credits// 
document.getElementById('submitCreditsBtn').addEventListener('click', addCredits);

	
//following code puts the username entered in a variable named value
//username is the id of the input in html 
//Second step in the function is just checking the text isn't empty 






// Afficher, vider, et renouveler le tableau//
// A comprendre : ce script se lie a mon tableau HTML en modifiant mon tbody, mais pas les thead// 
function displayRanking() {
    let tbody = document.querySelector("#ranking-container tbody");
    tbody.innerHTML = "";
	//Ranking variable//
	ranking.sort((a, b) => b.credits - a.credits);
	// Boucle pour créér pour chaque association une ligne//
	let dataToDisplay = showFullRanking ? ranking : ranking.slice(0, 6); //if show full ranking is false then show everything// This is a short version of if else//

	dataToDisplay.forEach((asso, index) => {
		let tr = document.createElement("tr");
		let posText = index === 0 ? "🥇 1" :
                      index === 1 ? "🥈 2" :
                      index === 2 ? "🥉 3" : (index + 1);
		//On ajoute à chaque ligne les cellules nécessaires// 
		        tr.innerHTML = `
            <td>${posText}</td>
            <td>${asso.name}</td>
            <td>${asso.credits}</td>
        `;
		// Add hover effect
        

        tr.addEventListener("mouseleave", () => {
			showFullRanking=false; 
			updateButtonsVisibility(); 
            displayRanking(); // Reset to default top 6
			
			
        });
        tbody.appendChild(tr);
    });
}

function updateButtonsVisibility() {
    let buttons = document.querySelectorAll(".bottom-center-container");

    buttons.forEach(button => {
        button.classList.toggle("hidden", showFullRanking);
    });
}

document.querySelector("#ranking-container").addEventListener("click", () => {

    showFullRanking = !showFullRanking; // tggle true/false , switched to opposite value//
    displayRanking();
	updateButtonsVisibility();
});



// Function to show smaller slice around hovered row




// Fonction d'envoie POST sur le Submit Credits// 
// Async est nécessaire pour utiliser await fetch//
async function addCredits() {
	const uid = getUserId(); 
    const nameInputElem = document.getElementById('asso-name');
    const creditsInputElem = document.getElementById('credits'); // récupère les crédits
	if (!nameInputElem || !creditsInputElem) {
        console.error("Le formulaire n'existe pas dans le DOM !");
        return;
	}
	const nameInput = nameInputElem.value.trim();
    const creditsInput = parseInt(creditsInputElem.value);
	if (!nameInput || isNaN(creditsInput) || creditsInput > 3 || creditsInput < 1) {
        alert("Veuillez entrer un nom et un nombre de crédits valides (max 3).");
        return;
    }
	//getting the id // 
	const userId = getUserId(); 
	// cette ligne est complexe : elle dit envoie la requête et attends que le serveur l'accepte sur la route POST//
    const response = await fetch('/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, creditsToAdd: creditsInput, userId: uid })
		// le body = tout ce qui est envoyé, dedans on demande l'éxécution de la fonction getUserId//
    });
	console.log("le string nom + crédits a été envoyé sur la route POST");
	console.log("here is the user's id :" + userId) ;
	// vérification qu'il n'y a pas erreur du côté post//
	if (!response.ok) {
    const errorData = await response.json(); // le JSON envoyé par ton serveur
    alert(errorData.error); // afficher l’erreur à l’utilisateur
    return; // arrêter la fonction pour ne pas continuer
	}

    data = await response.json();
	ranking = data.ranking; 
	console.log("la réponse JSON a été reçue" + JSON.stringify(data)); 
	triggerFlash(); 
	spawnMoneyAndFlash(); 
	showWinnerText(); 
    displayRanking(ranking); // met à jour ton tableau HTML
}





// Submit name functions


console.log("on en est là")

function openpage2 () {
	window.location.href = "page2.html"
	console.log("page 2 is been execited"); 
}

function openpage4 () {
	window.location.href = "page4.html"
}

function submitName() {
	console.log("submitname is executed");
    let name = document.getElementById("username").value;

    if (name) {
        closePopup();
    } else {
        alert("Please enter your name.");
        return; // stop here if nothing was entered
    }

    fetch('/submit-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(name)
    })
    .then(res => res.text())
    .then(response => {
        console.log("Server response:", response);
    });
}


function submitName2() {
    let name = document.getElementById("username2").value;
    if (name) {
        alert("Eugène te souhaite la bienvenue sur son site, " + name + "!");
        closePopup2();
    } else {
        alert("Please enter your name.");
        return; // stop here if nothing was entered
    }

    fetch('/submit-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(name)
    })
    .then(res => res.text())
    .then(response => {
        console.log("Server response:", response);
    });
}

console.log("on en est là")

// followng sends data to server 
//fetch sends a post request 
// headers show how it's formatted 
// body says it's a text named username 
// All answers are sent to server which is managed by server.js 

// Functions ASYNC// 


async function loadRanking() {
    const response = await fetch('/ranking');
    data = await response.json();
	ranking = data.ranking; 
    displayRanking();
	console.log("logged", ranking)
}

// 2 : fonctions event //
let lasteventTimesstamp= null ; 

	async function fetchrecentevents(){
		try {
			eventBox.innerHTML=""; 
			const eventresponse = await fetch('/recent-events'); 
			const events = await eventresponse.json(); 
			// On vide la boite//
			const eventbox = document.getElementById('eventBox'); 
			eventBox.innerHTML=""; 
			// Ensuite à chaque fois que events est redéfinit on en tire a property message pour la mettre dans boc// 
			    events.forEach(event => {
            const div = document.createElement('div');
            div.textContent = event.message;
			console.log(event.message)
            eventBox.appendChild(div);
			setTimeout(()=> {
				div.remove(); 
			}, 50000); 
			});
		}catch (err) {
    console.error("Erreur fetch events:", err);
		}
	}


// Do not redeclare the variable with const because it shadows the first one//


// Animations sur le bouton ajouter// 
function spawnMoneyAndFlash() {
 const container = document.getElementById('moneyContainer');
    for (let i = 0; i < 30; i++) {
        const money = document.createElement('div');
        money.className = 'money';

        // Position horizontale aléatoire
        money.style.left = Math.random() * window.innerWidth + 'px';

        // Durée aléatoire entre 2 et 4 secondes
        money.style.animationDuration = (2 + Math.random() * 2) + 's';

        // Rotation et taille aléatoire pour scintillement
        const scale = 0.5 + Math.random() * 0.5;
        money.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;

        // Opacité initiale aléatoire
        money.style.opacity = 0.7 + Math.random() * 0.3;

        container.appendChild(money);

        // Supprimer le billet quand l'animation se termine
        money.addEventListener('animationend', () => {
            money.remove();
        });
    }
}


	// Flash page // 
function triggerFlash() {
	const flash = document.getElementById('flashLayer');
    flash.classList.add('flash-layer-active');

    // Retirer la classe à la fin de l'animation
    flash.addEventListener('animationend', () => {
        flash.classList.remove('flash-layer-active');
    }, { once: true });
}

function showWinnerText() {
	console.log("function showwinner ran") 
	const nameInputElem2 = document.getElementById('asso-name')
	console.log(nameInputElem2);
    const container = document.getElementById('winnerTextContainer');
    container.textContent = nameInputElem2.value.trim();
    container.style.animation = 'floatWinner 3s forwards';
    // Supprime l'animation pour pouvoir la rejouer la prochaine fois
    container.addEventListener('animationend', () => {
        container.style.animation = '';
        container.textContent = '';
    }, { once: true });
} 

// Function that sends three first ones of ranking at the end of the day/ 
async function fetchthreefirst() {
	//first thing : getting current ranking// 
	const response = await fetch('/ranking');
    data2 = await response.json();
	console.log(data2); 
	const Topthree = data2.ranking
		.slice(0, 3)          // take first 3 objects
		.map(item => item.name);  // keep only the name
	console.log(Topthree); 
	const response2 = await fetch('/api/fetchthreefirst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Topthree : Topthree })
		// le body = tout ce qui est envoyé, dedans on demande l'éxécution de la fonction getUserId//
    });
	const result = await response2.json(); 
	console.log(result); 
}

function loadsw() { 
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('sw.js') // Install background js and start running it// // This returns promise so we can use then and catch//
			.then(registration => { //when promise retruns, registration is now an object that informs us about the state of sw.js. But it runs only if it succeeded//
				console.log('Service Worker registered successfully:', registration);
			})
		.catch(error => {
			console.error('Service Worker registration failed:', error);
		});
	} else { 
		console.error('Service Workers not supported'); 
	}
}
// 1 hour = 60min × 60sec × 1000ms
setInterval(fetchthreefirst, 1000000);

// Lancement des fonctions async// 
// Finally : adding event listener to window loading to load the ranking 
window.addEventListener('DOMContentLoaded', () => {
    loadRanking();
    loadsw();
});

setInterval(fetchrecentevents, 2000);

