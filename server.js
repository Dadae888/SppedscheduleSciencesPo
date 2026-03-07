// Database server code// 
// Still have to resolve : credits in ranking 3 for promo ; and keyevents not loading// 
// starting server// 



// Establishing connection// 
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("Connected to database"))
  .catch(err => console.error("DB connection error", err));
  
  
 // All needed consts packages// 
const express = require('express');
const bodyParser = require('body-parser'); 
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');

// Secret environment// 
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
console.log(CLIENT_ID); 

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



// Loading file system module 




const COUNTER_FILE = 'counter.txt';

const app = express (); 
const PORT = 8000 

app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json si nécessaire
  

// Now file image module// 
const multer = require('multer');

// Configure multer disk storage// 


const storage = multer.memoryStorage();

const upload = multer({ storage });
// So now WHEN WE USE UPLOAD IT BECOMES USE MULTER AND GIVE DESTINATION AND NAME// 
  
  
  
 // Inform login// 
 
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

app.use(cookieParser());


app.use((req, res, next) => {

    let visitorId = req.cookies.visitorId;

    if (!visitorId) {

        visitorId = crypto.randomUUID();

        res.cookie('visitorId', visitorId, {
            maxAge: 1000 * 60 * 60 * 24, // 24h
            httpOnly: true
        });

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        console.log(`[NEW VISIT] ${new Date().toISOString()} | IP: ${ip} | visitorId: ${visitorId}`);
    }

    next();

});

app.post('/login-log', (req, res) => {

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log(`[LOGIN] ${new Date().toISOString()} | IP: ${ip}`);

    res.json({ success: true });

});
  
  
  

  
  
  
  
  
  
  
  
 // Calendar// 
 



// Other necessary parameters for calendar// 
// Session is a way to store data, accross multiple HTTP requests : so when user connects again, cookie sends id and retrieves info of session// 
// Order matters, we can use as many app use as we want, it just means that when requests are sent we add middlewares, but we must first initialise session, then passport// 
// Order : 1 : initialising session)// 
/* architecture : when request comes (await), first go through middleware then route handler, which is app get*/ 

app.use(session({
	secret: CLIENT_SECRET, 
	resave: false, // If nothing changed no resave// 
	saveUninitialized: false
})) 

// Order : 2 : now initialise passport, has to be after session : it ads login to req// 
// Precision : it doesn't force login : it checks login info through req.user. Now every request goes through a login check. No force login// 
app.use(passport.initialize()); 
//Order : 3 now link passport to section// 
// Same thing here : does req.user contain valid cookie ? If yes, session logged, if not, req.user undefinded// 
app.use(passport.session()); 

// Telling passport how to setup login ; go through google //
// Next line means : when someone tries to login, use this strategy//  

passport.use(new GoogleStrategy(
{ //giving first parameter ; configuration id// 
	clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/auth/google/callback' // That's where google redirects, it must match exactly// 
}, 
// Now second parameter : callback function : it is a function that runs for every request going through that path ; in express call back function always has req, res, and next (allows to move on to next middleware//
// this functions runs after login and allowing permissions and google sendback// 
// These are parameters of function : accesstoken is used for google calendar ; second is to get new one when expired; profile is all info (name etc) ; done is provided by passport to state success //
// Creating user object manually//  
(accessToken, refreshToken, profile, done) => { 
	const user = {  
		profile: profile,
		accessToken: accessToken
	};
	return done(null, user); 
}
)); 

// Then : storing user to passport session, but serialise allows to select information about user to store// 
// user here will be profile + accesstoken// 
// Next are function we call with passport// 

passport.serializeUser((user, done) => {
  done(null, user);
});

// Next function means : take user stored in session and convert it back to a full user object for this request// 

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Now done returns REQ.USER for every route !!// 

// Endpoint to receive user data from script.js
app.post('/submit-name', (req, res) => {
    nameentered = req.body.username;      // grab "username" field from POST
    console.log("User entered:", nameentered);  // prints it in CMD
    res.send("Hi " + nameentered + "! Your name was received."); // optional response for user
});

// Finally : setting routes : we first need a get for login, with a callback (what happens after user accepted login// 

app.get('/auth/google', 
	// Telling passport to use google strategy with scope of permissions// 
	passport.authenticate('google', {
		scope : [
			'profile',
			'email', 
			'https://www.googleapis.com/auth/calendar.events'
			]
	}) 
); 

// To call this route, we will need a window location so that request doesn't run in background like it does with fetch : window.location.href = '/auth/google';//

// Next : after login permission// 
// This function is magic set by passport : basically : passport uses google strategy to : POST a request to google, through a code given when callback called//
// Then, google sends JSON file with accesstoken, etc// 
// Then, passport calls the callback function in strategy : storing info// 
// And when the done of the callback function is called, serialise and deserialise is used to store into session. Pure magic// 
// Now req user exists, so basically that get function was just a way to call all our functions defined before//
// And the response is to redirect somewhere//  
/* [Browser clicks login]
      |
      v
[GET /auth/google] -- Passport redirects --> [Google Login Page]
      |
      v
[User logs in, grants access] -- Google redirects with code --> [GET /auth/google/callback]
      |
      v
[Passport exchanges code for tokens]
      |
      v
[GoogleStrategy callback(accessToken, refreshToken, profile)]
      |
      v
[serializeUser stores user ID in session]
      |
      v
[req.user is set, next() is called]
      |
      v
[Your route handler executes, e.g., res.redirect('/')] 
*/ 

// This runs after login// For the moment user is redirected to home page// 
app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	(req, res) => {
    // User is logged in at this point
    res.redirect('/calendar'); // <-- redirect to the calendar page, be careful, here it is a route not a filepath, so calendar route must be defined// 
	}
);

// Creating redirection route// 
app.get('/calendar', (req,res) => {
	if (!req.user) return res.redirect('/'); // That's my homepage// Return ensures rest of the route is not executed// 
	console.log("calendar called"); 
}); 



// Then, add event to google calendar route !!!!!// 
app.post('/add-to-calendar', async (req, res) => {
	if (!req.user) return res.redirect('/');
  
	// Setting token for this session// 
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: req.user.accessToken
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
	// So now frontend needs to correspond ! // 
  const event = {
    summary: req.body.summary,
    start: { dateTime: req.body.startdate, timeZone: 'Europe/Paris' },
    end: { dateTime: req.body.enddate, timeZone: 'Europe/Paris' }
  };

  try {
    await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    res.json({ success: true, message: "Event added to Google Calendar" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
	

// Checking login : we are using req.user not req.tokens// 
app.get('/auth/status', (req, res) => {
    res.json({ loggedIn: !!req.user });
});






app.use(express.static(__dirname));



// Refonte des tables// 
// Tout passe par express, peu importe pour le frontend qu'on transforme en SQL ou sur fichier après// 
/* système 

Frontend
   │
   │ POST /api/verifyID
   │ { userId: "user42" }
   ▼
Express route
   ▼
req.body.userId
   ▼
SQL query
INSERT INTO users
   ▼
PostgreSQL database
   ▼
res.json({ success: true })
   ▼
Frontend reçoit la réponse

*/ 



// 1. USER ID now is equal to google//  

app.get('/api/verifyID', (req,res)=>{
   if(!req.user) return res.json(false)
   res.json(true)
})
// C'est la fonction de vérification d'existence d'un id, pas d'ajout de crédits// 
app.post('/api/verifyID', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });

  const googleId = req.user.profile.id; // ID Google unique

  await pool.query(
    "INSERT INTO users(google_id, name) VALUES($1,$2) ON CONFLICT DO NOTHING", // Extrême imp : stocke le google id dans la base, si il y a déjà laisse le//
    [googleId, req.user.profile.displayName]
  );

  res.json({ success: true });
});



//2 Ranking // 
app.get('/ranking', async (req, res) => {

  const rankingResult = await pool.query(
    "SELECT * FROM ranking ORDER BY credits DESC"
  );

  const votesResult = await pool.query(
    "SELECT * FROM votes"
  );

  res.json({
    ranking: rankingResult.rows,
    votes: votesResult.rows
  });

});


	// Ranking push// 
	// Understanding query : ONCONFLICT signifie si il y a déjà une ligne avec userid, qui elle correspond à une clé unique normalement, rajoute le à cette ligne//
	// Les dollars servent à protéger des injections SQL. On pourrait juste dire associe à cellule 1 valeur req 1 mais pour éviter du code SQL on met $ pour protéger//
app.post('/ranking', async (req, res) => {
	let googleId; 
  if (!req.user) { 
	googleId= 0000 ; 
	/*return res.status(401).json({ error: 'Not logged in' });*/ 
  } else { 
		const googleId = req.user.profile.id; 
  }
  
  const name = req.body.name
	.trim()
	.toLowerCase()
	.normalize("NFD")
	.replace(/[\u0300-\u036f]/g, "");         // nom de l'asso à créditer
  const creditsToAdd = parseInt(req.body.creditsToAdd);

  if (!name || isNaN(creditsToAdd)) return res.status(400).json({ error: 'Nom ou crédits invalides' });

  const today = new Date().toISOString().split('T')[0];

  // --- Reset journalier --- Chaque jour, on injecte des nouvelles dates dans la ligne//
  await pool.query(
    `INSERT INTO votes(google_id,date,creditsused)
	VALUES($1,$2,0)
	ON CONFLICT (google_id)
	DO UPDATE SET
	date = EXCLUDED.date,
	creditsused =
    CASE
        WHEN votes.date <> EXCLUDED.date THEN 0
        ELSE votes.creditsused
    END `, 
    [googleId, today] // Ces valeurs sont transmises à la base//
  );

  // --- Vérification du plafond ---
  const voteCheck = await pool.query(
    "SELECT creditsused FROM votes WHERE google_id=$1",
    [googleId] // Définit votecheck comme le google id correspondant//
  );

  if (voteCheck.rows[0].creditsused + creditsToAdd > 50) {
    return res.status(400).json({ error: "Limite dépassée" });
  } // Ici la row [0] car c'est la valeur de créditsused//

  // --- Ajout des crédits ---
  await pool.query(
    "UPDATE votes SET creditsused = creditsused + $1 WHERE google_id=$2",
    [creditsToAdd, googleId]
  );

  // --- Mise à jour du ranking ---
  await pool.query(
    `INSERT INTO ranking(name,credits)
     VALUES($1,$2)
     ON CONFLICT (name)
     DO UPDATE SET credits = ranking.credits + $2`,
    [name, creditsToAdd]
  );

  // --- Retourne le ranking mis à jour ---
  const rankingResult = await pool.query("SELECT * FROM ranking ORDER BY credits DESC");
  res.json({ ranking: rankingResult.rows });
});




// ------GESTION DES PROMOS------// 
// Elles sont identifiées par id primary key// 
app.get('/api/promo', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM promo ORDER BY id ASC");
    res.json(result.rows); // renvoie toutes les promos
  } catch (err) {
    console.error("Error fetching promo:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/promo', upload.single('image'), async (req, res) => {
  try {
    let googleId; 
	if (!req.user) { 
		googleId= 0000 ; 
		/*return res.status(401).json({ error: 'Not logged in' });*/ 
	} else { 
		const googleId = req.user.profile.id; 
  }

    // 2️⃣ Récupération des données
    const { name, content, date, sectionId } = req.body;
	
	// Gestion image 
	const file = req.file;
	if (!file) return res.status(400).json({ error: "No file uploaded" });
	// Create unique name 
	const fileName = Date.now() + "-" + file.originalname;
	// Sending to bucket// 
	const { data, error } = await supabase.storage
		.from('promo-images')
		.upload(fileName, file.buffer, {
		contentType: file.mimetype
	})	;

	if (error) {
		console.error("Error uploading image:", error);
		return res.status(500).json({ error: "Image upload failed" });
	}

	// URL publique (puisque le bucket est public)
	const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/promo-images/${fileName}`;
   

    if (!name || !content || !file || !date || !sectionId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 3️⃣ Vérification que le nom fait partie des 3 premières associations : LIMIT 3 créé 3 lignes comme slice// 
    const top3Result = await pool.query(
      "SELECT name FROM ranking ORDER BY credits DESC LIMIT 3"
    );
    const top3Names = top3Result.rows.map(r => r.name); // Récupère les trois premiers noms : r veut dire "cette ligne//

    if (!top3Names.includes(name)) {
      return res.status(403).json({ error: "Only top 3 associations are allowed to add promos" });
    }

    // 4️⃣ Création de l'objet promo
    const newPromo = {
      id: Date.now(),
      name,
      content,
      image: imageUrl,
      date,
      sectionId
    };

    // 5️⃣ Insérer ou remplacer si sectionId existe// Excluded permet de redécaler en cas d'existence d'ID//
    // 5️⃣ Insérer ou remplacer si sectionId existe// Excluded permet de redécaler en cas d'existence d'ID//
	await pool.query(
	`INSERT INTO promo(id, name, content, image, date, "sectionId")
	VALUES($1,$2,$3,$4,$5,$6)
	ON CONFLICT ("sectionId")
	DO UPDATE SET
		name = EXCLUDED.name,
		content = EXCLUDED.content,
		image = EXCLUDED.image,
		date = EXCLUDED.date`,
	[newPromo.id, newPromo.name, newPromo.content, newPromo.image, newPromo.date, newPromo.sectionId]
	);

    console.log("Promo saved:", newPromo);
    res.json({ success: true, promo: newPromo });

  } catch (err) {
    console.error("Error saving promo:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// --------GESTION DE PAGE2EVENTS. VIGILANCE + EVENTID----------// 
// get : pas de modification, les rows sont renvoyées// 
app.get('/api/page2events', async (req, res) => {
  try {
    const result = await pool.query(
	`SELECT eventassoname AS eventassoname, date, time, place, title, eventid 
	FROM page2events
	ORDER BY date, time`
	);

    res.json(result.rows); // renvoie exactement un tableau d'objets comme avant
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Database error" });
  }
});




// Gestion des attenders : pas de modification frontend// 
app.get('/api/attenderslist', async (req, res) => {
  try {
    const { eventid } = req.query;
	console.log(eventid); 
    if (!eventid) return res.status(400).json({ error: "Missing eventid" });

    const result = await pool.query(
      "SELECT attenders FROM page2events WHERE eventid = $1",
      [eventid]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Event not found" });

    res.json(result.rows[0].attenders || []);
  } catch (err) {
    console.error("Error fetching attenders:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Gestion du POST ; erreur 401 : pas de login// On la met en comment pour l'instant// 
app.post('/api/page2events', async (req, res) => {
  try {
    // 0️⃣ Vérification login Google
	/*if (!req.user) return res.status(401).json({ error: "User not logged in" });
    const googleId = req.user.profile.id; // on conserve le Google ID pour usage futur ou audit */

    // 1️⃣ Récupération des données envoyées par le frontend
    const { title, date, time, endtime, place, Eventassoname, eventid, attenders } = req.body;
	console.log(req.body); 
	const name = req.body.Eventassoname
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, ""); 

    if (!title || !date || !time || !place || !name || !eventid) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 2️⃣ Ajouter ou remplacer l'événement dans la base SQL
    await pool.query(
      `INSERT INTO page2events(eventid, title, date, time, endtime, place, eventassoname, attenders)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (eventid) DO UPDATE
       SET title = EXCLUDED.title,
           date = EXCLUDED.date,
           time = EXCLUDED.time,
           endtime = EXCLUDED.endtime,
           place = EXCLUDED.place,
           eventassoname = EXCLUDED.eventassoname,
           attenders = EXCLUDED.attenders`,
      [eventid, title, date, time, endtime, place, name, attenders || []]
    );

    // 3️⃣ Mettre à jour le ranking (+3 crédits pour l’association)
    const rankingResult = await pool.query(
      "SELECT * FROM ranking WHERE LOWER(name) = LOWER($1)",
      [name]
    );

    if (rankingResult.rows.length > 0) { 
      // Si existant, ajouter 3 crédits
      await pool.query(
        "UPDATE ranking SET credits = credits + 3 WHERE LOWER(name) = LOWER($1)",
        [name]
      );
    } else {
      // Sinon, créer nouvelle entrée
      await pool.query(
        "INSERT INTO ranking(name, credits) VALUES($1, $2)",
        [Eventassoname, 3]
      );
    }

    // 4️⃣ Réponse au frontend
    res.json({ success: true, /*googleId,*/ eventid });

  } catch (err) {
    console.error("Error saving event:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// -------GESTION DES KEYEVENTS--------// 

app.post('/api/keyevents', async (req, res) => {
  try {
    // 0️⃣ Vérification login Google
    /*if (!req.user) return res.status(401).json({ error: "User not logged in" });
    const googleId = req.user.profile.id; // utile pour audit/log si nécessaire*/

    // 1️⃣ Récupération des données du frontend
    const { title, date, time, place, Eventassoname, eventid } = req.body;

    if (!title || !date || !time || !place || !Eventassoname || !eventid) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 2️⃣ Insertion ou update dans PostgreSQL
    await pool.query(
      `INSERT INTO keyevents(eventid, title, date, time, place, eventassoname)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT (eventid) DO UPDATE
       SET title = EXCLUDED.title,
           date = EXCLUDED.date,
           time = EXCLUDED.time,
           place = EXCLUDED.place,
           eventassoname = EXCLUDED.eventassoname`,
      [eventid, title, date, time, place, Eventassoname]
    );

    // 3️⃣ Réponse au frontend (inchangée)
    res.json({ success: true, eventid });

  } catch (err) {
    console.error("Error saving keyevent:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/keyevents', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM keyevents ORDER BY date, time"
    );
    res.json(result.rows); // renvoie exactement le même tableau qu’avant
  } catch (err) {
    console.error("Error fetching keyevents:", err);
    res.status(500).json({ error: "Database error" });
  }
});


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

app.post("/subscribe", async (req, res) => {

	const newSub = req.body;

	if (!newSub || !newSub.endpoint) {
		return res.status(400).json({ error: "Invalid subscription" });
	}

	await pool.query(
		`INSERT INTO subscriptions(endpoint, subscription)
		 VALUES($1,$2)
		 ON CONFLICT (endpoint) DO NOTHING`,
		[newSub.endpoint, newSub]
	);

	res.status(201).json({});
});

// Quotidien version SQL// 
const cron = require("node-cron");

cron.schedule("29 15 * * *", async () => {

	const result = await pool.query("SELECT subscription FROM subscriptions");
	const subscriptions = result.rows.map(row => row.subscription);

	const payload = JSON.stringify({
		title: "Daily Reminder",
		body: "Vous avez 3 crédits à utiliser pour soutenir les assos"
	});

	for (const sub of subscriptions) {

		try {
			await webpush.sendNotification(sub, payload);
			console.log("Notification sent to:", sub.endpoint);

		} catch (err) {
			console.error("Failed to send notification:", err);
		}
	}
});

app.post("/send", async (req, res) => {

	const result = await pool.query("SELECT subscription FROM subscriptions");
	const subscriptions = result.rows.map(row => row.subscription);

	const payload = JSON.stringify({
		title: "Speedschedule",
		body: "Un nouvel évènement a été ajouté ! Inscrivez-vous !"
	});

	for (const sub of subscriptions) {

		try {
			await webpush.sendNotification(sub, payload);
			console.log("Notification sent to:", sub.endpoint);

		} catch (err) {
			console.error("Failed to send notification:", err);
		}
	}

	res.sendStatus(200);
});

// Finally : COUNTER//
app.get('/visit', async (req, res) => {

  const result = await pool.query(
    `UPDATE counter
     SET visitors = visitors + 1
     WHERE id = 1
     RETURNING visitors`
  );

  res.json({ visitors: result.rows[0].visitors });

});



app.get('/api/fetchthreefirst', async (req, res) => {

  const result = await pool.query(
    "SELECT * FROM ranking3 ORDER BY position ASC"
  );

  res.json(result.rows);

});



app.post('/api/fetchthreefirst', async (req, res) => {

	const Topthree = req.body.Topthree;

	if (!Topthree) {
		return res.status(400).json({ error: 'Missing fields' });
	}

	await pool.query("DELETE FROM ranking3");

	for (const entry of Topthree) {

		await pool.query(
			`INSERT INTO ranking3(position,name)
			 VALUES($1,$2)`,
			[entry.position, entry.name]
		);

	}

	console.log(Topthree);

	res.json({ success: true });

});


// Finally 2 : recent events// 
let recentEvents = [];
const MAX_EVENTS = 3


app.get('/recent-events', (req, res) => {
    res.json(recentEvents);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Making privacy file public// 

app.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname + '/public/privacy-policy.html');
});

app.get('/terms-of-service', (req, res) => {
  res.sendFile(__dirname + '/public/terms-of-service.html');
});
// Starting real code for uploads //