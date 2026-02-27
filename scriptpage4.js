    const container = document.getElementById('calendar-container');
// necessary variables//
// Beware the variable is an array//
let keyevents = []; 

// Formulaire 
const form = document.getElementById('eventform2');

    // Generate months
    function generateMonth(year, month) {
        const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
        const daysOfWeek = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

        let monthDiv = document.createElement('div');
        monthDiv.classList.add('month');

        let monthTitle = document.createElement('h2');
        monthTitle.textContent = monthNames[month] + " " + year;
        monthDiv.appendChild(monthTitle);

        // Weekday headers
        let daysHeader = document.createElement('div');
        daysHeader.classList.add('days');
        daysOfWeek.forEach(d => {
            let dEl = document.createElement('div');
            dEl.classList.add('day', 'weekday');
            dEl.textContent = d;
            daysHeader.appendChild(dEl);
        });
        monthDiv.appendChild(daysHeader);

        // Days
        let firstDay = new Date(year, month, 1).getDay();
        let numDays = new Date(year, month+1, 0).getDate();
        firstDay = (firstDay === 0) ? 6 : firstDay-1;

        let daysGrid = document.createElement('div');
        daysGrid.classList.add('days');

        for(let d = 1; d <= numDays; d++){
			// Creating days//
			let dayEl = document.createElement('div');
			dayEl.classList.add('day'); //That is CSS identifier//
			dayEl.textContent = d;

			// 🔹 1. Construire la date complète (IMPORTANT)
			let fullDate = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

			// 🔹 2. Vérifier si un événement existe pour cette date
			if(keyevents[fullDate]){

				// 🔴 3. Colorier en rouge
				dayEl.style.backgroundColor = "red";

				// 🔹 4. Récupérer l’objet événement
				const eventData = keyevents[fullDate];

				// 🔹 5. Ajouter un tooltip : Title c'est un HTML natif, dès qu'on l'appelle il s'affiche//
				dayEl.setAttribute(
					"data-tooltip",
    `				${eventData.title} - ${eventData.Eventassoname} @ ${eventData.time} (${eventData.place})`
);
			}

			daysGrid.appendChild(dayEl);
}

        monthDiv.appendChild(daysGrid);
        container.appendChild(monthDiv);
    }


    // Popup functions
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('event-popup');

    function openEventPopup(){
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    function closeEventPopup(){
        overlay.style.display = 'none';
        popup.style.display = 'none';
        document.getElementById('event-key').value = '';
    }


function openeventform() { 
	document.getElementById('eventform2').style.display= "block"; 
} 

const realkey = "olarosa2026"; 

    function submitEventKey(){
        const key = document.getElementById('event-key').value;
        if(key === realkey) {
            openeventform(); 
            closeEventPopup();
        } else {
            alert("Please enter the right key!");
        }
    }
	
// Adding inputs to json EVENTS FILE IN SERVER//
form.addEventListener('submit', async (e) => {
	// on empêche le rechargement de la page qui s'éxécute normalement automatiquement après un form// 
    e.preventDefault();
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
	const place = document.getElementById('place').value;
	const Eventassoname = document.getElementById('Eventassoname').value.trim(); 
	const eventid = Date.now(); 
	console.log("form is" + (title)); 
	
	//defining with that key events, according to date//
	if(title && Eventassoname && date && time && place){
        // Stocker l'événement
        keyevents[date] = { title, Eventassoname, time, place };
		// Recréer le calendrier pour afficher l'événement
        document.getElementById("calendar-container").innerHTML = "";
        generateNext6Months();
    } else {
        alert("Merci de remplir tous les champs !");
    }
    await fetch('/api/keyevents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, place, Eventassoname, eventid, })
    });
	form.reset(); 
	loadkeyevents(); 
}); 

async function loadkeyevents() { 
	const res = await fetch('/api/keyevents');
    const data = await res.json();
	keyevents = {}; // Don't use let because we don't want to modify the global variable//

    // Convert array from server into object indexed by date
    data.forEach(event => {
        keyevents[event.date] = event;
    });
	console.log(data); 
	console.log("variable keyevents is ", keyevents); 

    // Clear calendar
    container.innerHTML = "";

    // Regenerate properly
    generateNext6Months();
}

// Let's be sure that when there is event added months are added back again/: 
function generateNext6Months() {
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();

    for(let i = 0; i < 6; i++) {
        generateMonth(year, month);

        month++;

        if(month > 11){
            month = 0;
            year++;
        }
    }
}

function openeventform() {
    document.getElementById('eventform2').style.display = "block";
    document.getElementById('form-overlay').style.display = "block";
}

function closeeventform() {
    document.getElementById('eventform2').style.display = "none";
    document.getElementById('form-overlay').style.display = "none";
}

// Close on submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // your form submission code here...
    closeeventform();
});

window.addEventListener('DOMContentLoaded', loadkeyevents);