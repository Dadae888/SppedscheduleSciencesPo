// Getting HTML for timetable variables// 
// Objet : boite avec éléments avant// 
const timetable = document.getElementById('timetable'); 

// Formulaire 
const form = document.getElementById('eventform'); 

// Creating table for upcoming 7 days// 
function getNext7Days() {
	// Dyas est un tableau vide
    const days = [];
    const today = new Date();
	// Créér une boucle pour décaler la date aux prochains jours//
	// On utilise new pour ajouter dans l'objet sans modifier l'objet global// 
    for (let i = 0; i < 21; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }

    return days;
}


async function loadEvents() {
    const res = await fetch('/api/page2events');
    const page2events = await res.json();
    renderTimetable(page2events);
}

function renderTimetable(page2events) {
    timetable.innerHTML = '';
	// Récupération des 7 prochains jours //
    const days = getNext7Days();
	// On créé une colonne pour chaque jour//
    days.forEach(day => {
		// On convertir la date au même format que le input js YY MM// 
        const dateStr = day.toISOString().split('T')[0];
		// Création de la colonne//
        const column = document.createElement('div');
        column.className = 'day-column';
		// Ajout du titre du jour// 
        const header = document.createElement('h3');
        header.textContent = day.toDateString();
        column.appendChild(header);
		// Tableau d'objet page2events venant de la fonction async await fetch//
		// .filter signifie garde seulement ceux qui respectent une condition// 
		// e représente chaque ligne du tableau page2events// 
		//e.date c'est prendre la propriété date de e pour garder seulement les évènements du jour dans ce jour//
		// On est dans une boucle donc ça ne garde les évènements du jour que pour le premier jour, pareil avec le deuxième jour// 
        page2events
            .filter(e => e.date === dateStr)
			// Ensuite cela met dans le bon ordre selon l'heure// 
            .sort((a,b) => a.time.localeCompare(b.time))
			// Event est une fonction de for each ici, pas une variable globale, elle sert juste à prendre ligne par ligne//
            .forEach(event => {
                const button = document.createElement('button');
                button.className = 'event';
                button.textContent = `${event.time} - ${event.title} @ ${event.place} @ ${event.Eventassoname}`;
				button.addEventListener('click', () => {
					openAttendersList(event); // We transfer event so we have all inputs//
					});
                column.appendChild(button);
            });

        timetable.appendChild(column);
    });
}

async function openAttendersList(eventData) {
	// Event data is the parameter given to the object event, which contains date, name, etc//
    // Fetch list from server
	// Don't forther that event data is defined by button, so we are looking for the button on which we just clicked//
    const res = await fetch(`/api/attenderslist?eventid=${eventData.eventid}`); // That looks for the parameters associated to a date and a time//
    const attenders = await res.json();
	const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    // Add overlay to body FIRST
    document.body.appendChild(overlay);
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'attenders-popup';

    // Build list HTML
    let listHTML = "<ul>";
    attenders.forEach(name => {
        listHTML += `<li>${name}</li>`;
    });
    listHTML += "</ul>";

    popup.innerHTML = `
        <h3>Participants</h3>
        ${listHTML}
        <button id="joinBtn">J'y vais</button>
        <button id="closeBtn">Fermer</button>
    `;

    document.body.appendChild(popup);

    // Join button logic
    document.getElementById('joinBtn').addEventListener('click', async () => {

        const name = prompt("Ton nom ?");
        if (!name) return;

        await fetch('/api/attenderslist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventid: eventData.eventid,
                name: name
            })
        });

        popup.remove();
		overlay.remove(); 
        openAttendersList(eventData); // reload list
    });

    // Close button
    document.getElementById('closeBtn').addEventListener('click', () => {
        popup.remove();
		overlay.remove(); 
    });
}

	

// Quand le form est envoyé, il faut éxécuter cette fonction//
// e est l'objet évènement automatiquement dispensé par le navigateur// 

form.addEventListener('submit', async (e) => {
	// on empêche le rechargement de la page qui s'éxécute normalement automatiquement après un form// 
    e.preventDefault();

    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
	const place = document.getElementById('place').value;
	const Eventassoname = document.getElementById('Eventassoname').value.trim(); 
	const eventid = Date.now(); 
	const attenders = [];
	// Making sure date is after today//
	let today2 = new Date();
	today2.setHours(0, 0, 0, 0);
	let date2 = new Date(date); 
	date2.setHours(0, 0, 0, 0);
	if (date2 < today2) {
    alert("The date is before today");
	return; 
}

    await fetch('/api/page2events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, place, Eventassoname, eventid, attenders })
    });
	triggerFlash(); 
	sendeventnot(); 
	spawnMoneyAndFlash();
	showWinnerText();
	// Vide tous les champs du formulaire//
    form.reset();
    loadEvents();
});

async function sendeventnot() { 
	console.log("event notification promise awaited"); 
	await fetch ('/send', {
		method: 'POST', 
	}) 
}; 

// Auto refresh when day changes
function scheduleMidnightRefresh() {
	// On créé une première date//
    const now = new Date();
	// On créé une deuxième date, pour l'instant la même//
    const midnight = new Date();
	// On la change pour la définir au minuit du lendemain//
    midnight.setHours(24,0,0,0);
	//Calcul du temps jusqu'à minuit//
    const msUntilMidnight = midnight - now;
	//Signifie : attends le temps délai en ms, puis éxécute la fonction//
    setTimeout(() => {
        loadEvents();
        scheduleMidnightRefresh();
    }, msUntilMidnight);
}

// On lui dit d'attendre msUntilMidnight car c'est le moment où il sera minuit//
// On lui dit de reprendre scheduleMidnight refresh pour refaire la même chose le jour suivant//
loadEvents();
scheduleMidnightRefresh();

// Fonctions d'animation// 
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
	const nameInputElem2 = document.getElementById('Eventassoname')
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