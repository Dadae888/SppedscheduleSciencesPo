// Listening to push sent by server//
// sw.js
//Permanent update// 
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// 1️⃣ Listen for push events from the server
self.addEventListener('push', event => { // event is now the payload we received//

  // 2️⃣ Extract the data sent from the server
  // event.data.json() parses the payload we sent from server
  const data = event.data ? event.data.json() : { 
    title: 'Speedschedule', // If we receive nothing then we send this//
    body: 'Hey !!' 
  };

  // 3️⃣ Display the notification
  // event.waitUntil() ensures the service worker stays alive until the notification is shown
// 3️⃣ Display the notification
event.waitUntil(
  self.registration.showNotification("✨ " + data.title + " ✨", {
    body: "💖 " + data.body + "\n\n🔥 Inscrivez-vous vite !",
    
    icon: "/icone.png",          // small icon (required)
    badge: "/badge.png",         // monochrome small icon (Android status bar)
    image: "/banner1.png",        // BIG banner image (makes it premium)
    
    vibrate: [200, 100, 200, 100, 400], // glow-feel vibration pulse
    
    tag: "speedschedule-event",
    renotify: true,              // vibrates again if replaced
    requireInteraction: true,    // stays until user interacts
    
    color: "#ff4fd8",            // pink glow accent (Android)
    
    actions: [
      {
        action: "open",
        title: "💎 View Event"
      },
      {
        action: "close",
        title: "❌ Later"
      }
    ]
  })
);
});

// 4️⃣ Optional: Listen for clicks on the notification
self.addEventListener('notificationclick', event => {
  
  // 5️⃣ Close the notification after click
  event.notification.close();

  // 6️⃣ Open or focus the app/page when notification is clicked
  event.waitUntil(
    clients.openWindow('/') // You can customize the URL
  );

});
