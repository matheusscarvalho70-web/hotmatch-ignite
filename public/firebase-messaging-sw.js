importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBIP8SwNJRYMTuwwRM_C7KBFy6qKSsPgsk",
  authDomain: "hotmatch.firebaseapp.com",
  projectId: "hotmatch",
  storageBucket: "hotmatch.firebasestorage.app",
  messagingSenderId: "506499959092",
  appId: "1:506499959092:web:d0672785e9140b12153d61"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
