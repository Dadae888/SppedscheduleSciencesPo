window.addEventListener('DOMContentLoaded', loadPromos);

// Pour limiter aux trois premiers/ 
/* 
Créér une variable ranking trois premier dans un fichier, ou plutot un objet
Aller chercher via un get cet objet à chaque ajout
Vérifier que nom de l'asso correspond
Si oui go
Si non non 
*/ 

// Only three first ones can add to promo// 
let selectedAsso = null ; 



async function loadRankingButtons() {
    const response = await fetch('/api/fetchthreefirst');
    const topThree = await response.json();

    const container = document.getElementById('ranking-buttons');
    container.innerHTML = ''; // clear previous buttons

    topThree.forEach(name => {
        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'ranking-btn';
		button.addEventListener('click', () => {
			document.querySelectorAll('.ranking-btn')
			.forEach(btn => btn.classList.remove('selected'));
			// Add selected class to clicked button
			button.classList.add('selected');

            selectedAsso = name;
            console.log("Selected:", selectedAsso);
        });
        container.appendChild(button);
    });
}



		
function showForm(sectionId) {
	// Section id est une variable de la fonction, on n'a pas besoin de redire qu'on utilise le id de la section//
	// En fait, quand on appelle "showform(section1), on dit que l'on appelle une variable, qui dans notre fonction s'appelle id, c'est une manière de ne pas érire xx fois//
	loadRankingButtons();  
    const section = document.getElementById(sectionId);
	// Look at first line of HTML : it defines sectionid : when submit is clicked, submit form is loaded, with the argument sectionid that corresponds thanks to showform to the right one//
	// Explanation of HTML : onsubmit is like onclick for button. We also want to pass the object event. 
    section.innerHTML = `
        <form class="promo-form" onsubmit="submitForm(event, '${sectionId}')">
            <textarea maxlength="250" id="content" placeholder="Votre texte (max 250 caractères)" required></textarea>
            <input type="file" accept="image/*" id="imageInput" required>
			<input type="date" id="date" required>
            <button type="submit">Publier</button>
        </form>
    `;
}

function submitForm(event, sectionId) {
    event.preventDefault();
    const form = event.target;
    const name = selectedAsso; 
	console.log("here is" + selectedAsso);
	if (!name) { 
		alert("you must select an association"); 
	} 
    const text = form.querySelector("textarea").value;
    const fileInput = form.querySelector("input[type='file']");
    const imageURL = URL.createObjectURL(fileInput.files[0]);

    const section = document.getElementById(sectionId); // Extremely important : only sectionid that comes from showform is modified//

    section.innerHTML = `
        <div class="promo-content">
            <img src="${imageURL}" class="promo-img">
            <h2 class="asso-name">${name}</h2>
            <p class="promo-text">${text}</p>
        </div>
        <button class="fill-btn" onclick="showForm('${sectionId}')">Modifier</button>
    `;
	sendpromos(event, form, sectionId); 
}

// Passing event is necessary to prevent refresh//

async function sendpromos(event, form, sectionId) {
	formdata = new FormData(); 
	// Defining variables// 
	const name = selectedAsso; 
	if (!name) { 
		alert.json("you must select an association"); 
	} 
	const content = form.querySelector("textarea").value;
	const date = form.querySelector("input[type='date']").value;
	const imageInput = form.querySelector("input[type='file']");
	// important here : name of the data sent on server is first argument, second one is its value//
	formdata.append("name", name);           // server expects 'name'
	formdata.append("content", content);     // server expects 'content'
	formdata.append("date", date);           // server expects 'date'
	formdata.append("sectionId", sectionId); // server expects 'sectionid'; // <-- send sectionId
	formdata.append("image", imageInput.files[0]); // Files is a list so I want the first element/ 
	const res = await fetch('/api/promo', {
		method: 'POST',
		body : formdata // No JSON Stringify because there is an image//
	}); 
	const result = await res.json();
    if(result.success){
        console.log("Promo sent successfully");
        loadPromos(); // refresh displayed promos immediately
    } else {
        console.error("Error sending promo:", result.error);
    }
}



/* Reminder : this is what promo looks like 
[
  {
    "name": "Association A",
    "content": "Lorem ipsum dolor sit amet",
    "image": "promo1.jpg",
    "date": "2026-02-22",
    "sectionId": "section1"
  },
  {
    "name": "Association B",
    "content": "Consectetur adipiscing elit",
    "image": "promo2.jpg",
    "date": "2026-02-22",
    "sectionId": "section2"
  }
] */ 		
	
// Keep in mind : sectionId was defined at the very beginning thanks to showform//	
		
async function loadPromos() {
	const res = await fetch('/api/promo'); 
	const promos = await res.json(); 
	// promos.mpa creates an array of all section ids used : [section1, section 2]// 
	// new Set is removing and duplicating//
	const sectionIds = [...new Set(promos.map(p => p.sectionId))]; // Checking that sectionIds before aren't filled// 
	// Now we are sure that we only have unique sections, but we now have to loop over them to empty them// 
	// We are not cleaning unnecssarily, we are just celaning before putting what's on the JSON, this way if one section has been modified in JSON then refreshes// 
	//Complicated part : looping : we call a function parameter secId for section Ids// 
	sectionIds.forEach(secId => {
    const section = document.getElementById(secId);
	// It names a variable section that corresponds to each sectionid, but if it is empty then section does't exist//
    if (section) section.innerHTML = ''; // clear previous content
	}); 
	 // 3️⃣ Populate each section with its promos
    promos.forEach(promo => {
		//finding corresponding section in promo//
        const section = document.getElementById(promo.sectionId);
        if (!section) return; // skip if section not found
		const div = document.createElement('div');   // Create a new <div> for this promo
		div.className = 'promo-content';             // Add a CSS class for styling
		// Build inner HTML for the promo
		div.innerHTML = `
			<img src="/uploads/${promo.image}" class="promo-img">
			<h2 class="asso-name">${promo.name}</h2>
			<p class="promo-text">${promo.content}</p>
			<button class="fill-btn" onclick="showForm('${promo.sectionId}')">Modifier</button>
    `	; // Append the new div to the section
		section.appendChild(div);
		console.log("for each promo was ran") 
	})
};
	