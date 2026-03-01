//creating untangible variables 
// importing libraries 
// Post means : sending data to modify it//
// Get means : retrieve data from the server//
// Remember : if you wanna keep the data, you gotta create a json file with filesync, no other way// 
const express = require('express');
const bodyParser = require('body-parser'); 
// Loading file system module 
const fs = require('fs') ;
const COUNTER_FILE = 'counter.txt';

const app = express (); 
const PORT = 8000 

//Coding timetable// 
const filePath3 = './page2events.json';

// Loading files when starting server// 
let page2events = [];

if (fs.existsSync(filePath3)) {
    page2events = JSON.parse(fs.readFileSync(filePath3, 'utf8'));
}

// Coding association promo space// 
const assocom = 'assocom.json';
if (!fs.existsSync(assocom)) {
    fs.writeFileSync(assocom, JSON.stringify([])); // empty array
}

// Needing images transfer//
const multer = require('multer');



// Starting real code for uploads //
// Node path module// 
const path = require('path');

// Creating file // 
const path2 = require('path');

const uploadsDir = path2.join(__dirname, 'uploads');

// Create folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer disk storage// 
const storage = multer.diskStorage({
	// FOLDER  Destination : it tells where to store the file. Parameters are req : HTTP request; file : info about the file ; cb : call back when we've decided where to store it//
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // Null because no errors accepted, uploads is name of the folder//
	},
	// Then saying what to name the file, keeping exact date and extension, FILE : //
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + path.extname(file.originalname);
		cb(null, uniqueName);
  }
});

const upload = multer({ storage });
// So now WHEN WE USE UPLOAD IT BECOMES USE MULTER AND GIVE DESTINATION AND NAME// 

// Recent events// 
// Tableau global pour stocker les derniers événements
let recentEvents = [];
const MAX_EVENTS = 5; // on garde les 20 derniers
let nameentered; 
// Same thing as counter file for ranking// 
const RANKING_FILE = 'ranking.json';

// Creating votes file// 
const VOTES_FILE = 'votes.json';

if (!fs.existsSync(VOTES_FILE)) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify({}));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Créer le fichier s'il n'existe pas
if (!fs.existsSync(RANKING_FILE)) {
    fs.writeFileSync(RANKING_FILE, JSON.stringify([]));
}

// Endpoint to receive user data from script.js
app.post('/submit-name', (req, res) => {
    nameentered = req.body.username;      // grab "username" field from POST
    console.log("User entered:", nameentered);  // prints it in CMD
    res.send("Hi " + nameentered + "! Your name was received."); // optional response for user
});

app.use(express.static(__dirname));

// User id check 
const USERID_FILES = 'userid.json';

if (!fs.existsSync(USERID_FILES)) {
    fs.writeFileSync(USERID_FILES, JSON.stringify({}));
}

// First request : when file is asked in opening popup or not ?// 
app.get('/api/verifyID', (req, res) => {
    const userfiles= JSON.parse(fs.readFileSync(USERID_FILES, 'utf8'));
    // convertit JSON en tableau JS
    res.json({
		userfiles: userfiles 
	});
		// renvoie le tableau au client, qui est vide la première fois
});

app.post('/api/verifyID', (req, res) => { 
	const user_id = req.body.Topthree; 
	if (!Topthree) { 
		return res.status(400).json({error : 'Missing fields'}); 
	}
	fs.writeFileSync(ranking3, JSON.stringify(Topthree, null, 2));
	console.log(Topthree);
	res.json({ success: true }); //allows fetch to stop hanging//
}); 

// making sure 

//Creating file 
if (!fs.existsSync(COUNTER_FILE)) {
    fs.writeFileSync(COUNTER_FILE, '0');
}

app.get('/ranking', (req, res) => {
    const ranking = JSON.parse(fs.readFileSync(RANKING_FILE, 'utf8'));
    const votes = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'));              // convertit JSON en tableau JS
    res.json({
		ranking: ranking, 
		votes: votes
	});
		// renvoie le tableau au client, qui est vide la première fois
});

// Creating POST endpoint for submit credits, answering to fetch ranking//
app.post('/ranking', (req, res) => {
	//Firstly getting the date//
	const today = new Date().toISOString().split('T')[0];
    const { name, creditsToAdd, userId } = req.body;
	// Reading votes file and making it a variable//
	let votes = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'))
	// If user is getting connected first time or date resets, reset credits// 
	// votes is now an object that stores vote.userId.date.credits//
	if (!votes[userId] || votes[userId].date !== today) {
    votes[userId] = {
        date: today,
        creditsUsed: 0
    };
	}
	if (votes[userId].creditsUsed + creditsToAdd > 15) { 
		return res.status(400).json({
        error: "Epepep petit malin. Eugène a repéré que tu as essayé d'ajouter plus de 3 crédits en une journée. Utilise un VPN (jrigole ça marchera pas non plus) ou attends jusqu'à demain " + "tu es repéré comme le user " + userId + "tu as voté à la date " + votes[userId].date + "/" + today
    });
	} else { 
	// If valid, add to counter// 
	votes[userId].creditsUsed += creditsToAdd; 
	}
	// Finally, because it is still stored in js, we must convert into json string, with null because we don't modifiy properties, to update file// 
	fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2)); 
    if (!name || isNaN(creditsToAdd) || !userId) {
        return res.status(400).json({ error: "Nom ou crédits invalides" });
    }
    const data = fs.readFileSync(RANKING_FILE, 'utf8');
    let ranking = JSON.parse(data);
    let existing = ranking.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.credits += creditsToAdd;
    } else {
        ranking.push({ name, credits: creditsToAdd });
    }
	console.log("BODY RECEIVED:", req.body);
    ranking.sort((a, b) => b.credits - a.credits); //crédits décroissants//
	// Ajouter un événement récent au tableau des évènements//
	recentEvents.push({
    message: `${nameentered} a donné ${creditsToAdd} crédits à ${name}`,
    timestamp: new Date().toISOString()
	});
	console.log(recentEvents); 
	// Limiter le nombre d'événements stockés
	if (recentEvents.length > MAX_EVENTS) {
    recentEvents.shift(); // supprime le plus ancien
	}
	fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));//réécrit en json//
    res.json({ 
		ranking: ranking, 
		votes: votes
	});//renvoie au client//
});


// Asso com//
// Architecture : we have one main json text file. In this JSON, we save content, etc, but we also save image in text. This file lives in my folder uploads which is on my server//
// Then, the HTML will be able to upload the image through this json file//
/*
 ├─ uploads image + form data → POST /api/promo
 │
Server
 ├─ Multer saves image to /uploads/1700000000000.png
 ├─ Server writes JSON object to promo.json:
 │   { name, content, date, image: "1700000000000.png" }
 │
Client Browser (on refresh)
 ├─ GET /api/promo → gets JSON
 ├─ Uses image filename to load actual file: /uploads/1700000000000.png */ 
 
 // Warning : filename is assocom, no filepath given// 

app.post('/api/promo', upload.single('image'), (req, res) => {
	// Checking names are authorised//
  const { name, content, date, sectionId } = req.body;
  const allowed = JSON.parse(fs.readFileSync(ranking3));
	if (!allowed.includes(name)) {
    return res.status(403).json({ error: "Association not allowed" });
	}
  const image = req.file; // image info
  if (!name || !content || !image || !date) {
    return res.status(400).json({ error: "Missing fields" });
  }
  // Reading existing promos//
  let promoData = [];
  if (fs.existsSync(assocom)) {
    const fileContent = fs.readFileSync(assocom);
    promoData = JSON.parse(fileContent);
  }
    // Create new promo object
  const newPromo = {
    id: Date.now(),
    name,
    content,
    image: image.filename, // just store filename
    date,
	sectionId : sectionId
  };

  // Add to JSON array or replace if existing//
  const existingIndex = promoData.findIndex(p => p.sectionId === sectionId);

  if (existingIndex !== -1) {
    promoData[existingIndex] = newPromo;
  } else {
    promoData.push(newPromo);
  }


  // Save back to JSON file
  fs.writeFileSync(assocom, JSON.stringify(promoData, null, 2));

  console.log("Promo saved:", newPromo);
  

  res.json({ success: true });
});


// Get function to load//
app.get('/api/promo', (req, res) => {
	if (!fs.existsSync(assocom)) {
    return res.json([]);
	}
	// Previous line saying : if it doesn't exist return nothing//
	const fileContent = fs.readFileSync(assocom);
	const promoData = JSON.parse(fileContent);
	res.json(promoData);
});

// We need to allow browser to display images//
// Sttaic files are images and files// 
// It allows client to access my file stored on server, which normally isn't possible//
// app use means use middleware globally in app//
app.use('/uploads', express.static('uploads'));


// Still ranking, but this time managing eventcredits// 






// Endpoint to create get module, which sends a request and makes of it an answer *
// let is the other way (other than const) to create a variable 
//The following means that when someone visits this function is executed
// Now that we have requested a thing named "visit", we must go and fetch it on the browser

app.get('/visit', (req, res) => {

  // Read current count from file, parse makes it readable into numbers and utf 8 converts it
    let count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8'));

    // Increase count by 1
    count++;

    // Save new count back to file
    fs.writeFileSync(COUNTER_FILE, count.toString());

    // Send updated count back to browser
    res.json({ visitors: count });
});


// Endpoint to just get current visitor count (without increasing)
app.get('/count', (req, res) => {

    let count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8'));

    res.json({ visitors: count });
});

//This parses POST data 
//It acts like a translator from url encoded to text, extended meaning we can cet complex text

//Endpoint si jamais il y a demande des past events// 
app.get('/recent-events', (req, res) => {
    res.json(recentEvents);
});


// Endpoint for three top rankings// 
const ranking3 = 'ranking3.json';
if (!fs.existsSync(ranking3)) {
    fs.writeFileSync(ranking3, JSON.stringify([])); // empty array
}

app.get('/api/fetchthreefirst', (req, res) => {
	const fileContent = fs.readFileSync(ranking3);
    const topThreeData = JSON.parse(fileContent);
    res.json(topThreeData); 
}); 
// Getting events// 

app.post('/api/fetchthreefirst', (req, res) => { 
	const Topthree = req.body.Topthree; 
	if (!Topthree) { 
		return res.status(400).json({error : 'Missing fields'}); 
	}
	fs.writeFileSync(ranking3, JSON.stringify(Topthree, null, 2));
	console.log(Topthree);
	res.json({ success: true }); //allows fetch to stop hanging//
}); 
	

app.get('/api/page2events', (req, res) => {
	res.json(page2events); 
}); 

// Creating events on demand// 

app.post('/api/page2events', (req, res) => {
	const {title, date, time, place, Eventassoname, eventid, attenders} = req.body; 
	if (!title || !date || !time || !place ||!Eventassoname) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    page2events.push({ title, date, time, place, Eventassoname, eventid, attenders });
	// Modifying file// 
	fs.writeFileSync(
        filePath3,
        JSON.stringify(page2events, null, 2)
    );
	// Adding credits// 
	// Setting new variable to name we have in rankings//
	// I can't use eventassoname because it's already defined as part of my object//
	// Needing to redefine ranking// 
	const data = fs.readFileSync(RANKING_FILE, 'utf8');
    let ranking = JSON.parse(data);
	const association = ranking.find(a => a.name.toLowerCase() === Eventassoname.toLowerCase());
	if(association) {
		association.credits+=3;
	} else {
        ranking.push({ name: Eventassoname, credits: 3 });
    }		
	// Saving ranking file // 
	fs.writeFileSync(
    RANKING_FILE,
    JSON.stringify(ranking, null, 2)
	);
    res.json({ success: true });
	console.log(page2events, ranking); 
});


// Attenderslist// 


app.get('/api/attenderslist', (req, res) => {
	if (!fs.existsSync(filePath3)) {
		return res.json([]);
	}
  const { eventid } = req.query; //Query is the parameter eventif that comes after? in fetch// 

  if (!eventid) {
    return res.status(400).json({ error: "Missing eventid" });
  }

  const fileContent = fs.readFileSync(filePath3);
  const events = JSON.parse(fileContent);

  const event = events.find(e => e.eventid == eventid);

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json(event.attenders || []);
});




app.post('/api/attenderslist', (req, res) => {

  const { eventid, name } = req.body;

  if (!eventid || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const fileContent = fs.readFileSync(filePath3);
  const events = JSON.parse(fileContent);

  const eventIndex = events.findIndex(e => e.eventid == eventid);

  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  // Initialize attenders if not existing
  if (!events[eventIndex].attenders) {
    events[eventIndex].attenders = [];
  }
  if (!events[eventIndex].attenders.includes(name)) {
    events[eventIndex].attenders.push(name); // That adds name// 
	}

 

  fs.writeFileSync(filePath3, JSON.stringify(events, null, 2));

  res.json({ success: true });
});


// Adding key events listener post and get//
// Creating key events file// 


const filePath5 = './keyevents.json';

// Loading files when starting server// 
let keyevents = [];
if (!fs.existsSync(filePath5)) {
    fs.writeFileSync(filePath5, JSON.stringify([])); // empty array
}
if (fs.existsSync(filePath5)) {
    keyevents = JSON.parse(fs.readFileSync(filePath5, 'utf8'));
}

app.post('/api/keyevents', (req, res) => {
	const {title, date, time, place, Eventassoname, eventid, } = req.body; 
	if (!title || !date || !time || !place ||!Eventassoname) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    keyevents.push({ title, date, time, place, Eventassoname, eventid, });
	// Modifying file// 
	fs.writeFileSync(
        filePath5,
        JSON.stringify(keyevents, null, 2)
    );
    res.json({ success: true });
	console.log(keyevents); 
});

// Showing keyevents for loading// 
app.get('/api/keyevents', (req, res) => {
	res.json(keyevents); 
}); 

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

//no other event listener is needed because submit name is 
// launched by my HTML on click button 

//linking to html file because express does not normally serve html 
//dirname is a vs code variable that means serve html file which is in the same folder as server.js


// Notifications // 
/* Browser asks for permission
Service worker is registered, background js file that operated out of the browser
Browser creates a push subscription (endpoint + keys) 
You store subscription on server 
Your backend send messages to that subscription
Public Key:
BK6D5ZFZZeM-zklBGvpdivHgaeYa4YL_EbKT9rO81T5D_0VgusDFGicNKvjl1BfSBlV6WC5aXAY5oVmFbnMS1-o
Private Key:
33YGrBefpSDG8AtceFp_MZI1Ntsk4-Bgu1eC6kRPrpM */

// What you have to understand : when browser receives push through server, it triggers sw.js in background !!!!//

const webpush = require("web-push"); 
const publicVapidKey = "BK6D5ZFZZeM-zklBGvpdivHgaeYa4YL_EbKT9rO81T5D_0VgusDFGicNKvjl1BfSBlV6WC5aXAY5oVmFbnMS1-o";
const privateVapidKey = "33YGrBefpSDG8AtceFp_MZI1Ntsk4-Bgu1eC6kRPrpM";

// Identifying server //
webpush.setVapidDetails(
  "mailto:eugene.hector@sciencespo.fr",
  publicVapidKey,
  privateVapidKey
);

// SToring subscriptions// 
const subscriptionsFile = path.join(__dirname, "subscriptions.json");
if (!fs.existsSync(subscriptionsFile)) {
    fs.writeFileSync(subscriptionsFile, JSON.stringify([])); // empty array
}

app.post("/subscribe", (req, res) => {
	// Reading existing file// 
	let subscriptions = JSON.parse(fs.readFileSync(subscriptionsFile, "utf8"));
	const newSub = req.body;
	const exists = subscriptions.find(sub => sub.endpoint === newSub.endpoint); // Beware I have to check that endpoint is stored in subscription//
	if (!exists) {
		subscriptions.push(newSub);
		fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
	}
	res.status(201).json({});
});

//Now sending notifications, when fetch send is sent from client// 
// Daily notifications//
const cron = require("node-cron");
// Reminder that no send needs to be configured //
// Await is used to pause until function is done so that we receive the log when it's actually done// 

cron.schedule("29 15 * * *", async () => {
	let subscriptions = JSON.parse(fs.readFileSync(subscriptionsFile, "utf8"));
	const payload = JSON.stringify({
    title: "Daily Reminder",
    body: "Vous avez 3 crédits à utilier pour soutenir les assos"
	});
	// Loops over file of subscritions, creates constant named sub, and sends to everyone// 
	for (const sub of subscriptions) {
		try {
		await webpush.sendNotification(sub, payload);
		console.log("Notification sent to:", sub.endpoint);
		} catch (err) {
		console.error("Failed to send notification to:", sub.endpoint, err);
		}
	}
});

// Other notifications from fetch// 
// Notice how payload is always defined on server// 
  
app.post("/send", async (req, res) => {
	let subscriptions = JSON.parse(fs.readFileSync(subscriptionsFile, "utf8"));

	const payload = JSON.stringify({
		title: "Speedschedule",
		body: "Un nouvel évènement a été ajouté ! Inscrivez-vous !"
	});

	for (const sub of subscriptions) {
		try {
			await webpush.sendNotification(sub, payload);
			console.log("Notification sent to:", sub.endpoint);
		} catch (err) {
			console.error("Failed to send notification to:", sub.endpoint, err);
		}
	}

	res.sendStatus(200); // optional but recommended
});



