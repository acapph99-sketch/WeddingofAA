# AA_Wedding_Website

A premium Malay Muslim wedding invitation website for the Walimatulurus of Anis Zulaikha and Mohamad Asyraf.

The site is static and GitHub Pages-ready. It uses only HTML, CSS and vanilla JavaScript. RSVP storage uses Firebase Firestore directly from the browser, so no custom backend is required.

## Folder Structure

```text
AA_Wedding_Website/
  index.html
  style.css
  script.js
  config.js
  README.md
  assets/
    images/
      wedding-illustration.webp
      bride.svg
      groom.svg
    music/
      wedding-music.wav
    icons/
      favicon.svg
```

## Edit Wedding Details

Open `config.js`. All editable content lives there:

- Bride and groom names
- Monogram
- Date and time
- Venue
- Bride's parents
- Contacts
- Google Maps links
- Music path
- Image paths
- Firebase configuration
- Timeline items

You should not need to edit `index.html` for normal wedding information changes.

## Replace Images

Replace these files with your final assets:

```text
assets/images/wedding-illustration.webp
assets/images/bride.svg
assets/images/groom.svg
```

Recommended formats:

- `.webp` for best performance
- `.jpg` for photos
- `.png` only when transparency is needed

If you change filenames, update the paths inside `config.js`.

Recommended sizes:

- Hero/background image: 1600px wide or larger, compressed
- Couple photos: 800px by 800px, square crop

## Replace Music

The included music file is a small generated placeholder:

```text
assets/music/wedding-music.wav
```

To replace it:

1. Add your music file inside `assets/music/`.
2. Use a compressed `.mp3` file if possible.
3. Update `music.path` in `config.js`.

Example:

```js
music: {
  path: "assets/music/my-wedding-song.mp3"
}
```

Music does not autoplay. It starts only after the guest taps **Open Invitation**.

## Personalized Guest Link

Use the `to` URL parameter:

```text
https://yourusername.github.io/AA_Wedding_Website/?to=John
```

The site will show:

```text
Jemputan Khas Buat
John
```

If `to` is missing, the section is hidden.

## Firebase Firestore Setup

The RSVP form stores submissions in Firebase Firestore.

### 1. Create Firebase Project

1. Go to `https://console.firebase.google.com/`.
2. Click **Add project**.
3. Follow the setup steps.
4. Analytics is optional.

### 2. Create Web App

1. In Firebase Project Overview, click the web icon `</>`.
2. Register the app.
3. Copy the Firebase config object.

### 3. Update `config.js`

Replace the placeholder values:

```js
firebase: {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  collectionName: "wedding_rsvps"
}
```

### 4. Enable Firestore

1. Open **Build** > **Firestore Database**.
2. Click **Create database**.
3. Start in production mode.
4. Choose a region near your guests.

### 5. Firestore Rules

For a public invitation, use rules that allow guests to create RSVP records and read wishes/statistics, but prevent editing existing RSVP records from the website.

Example starter rules:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wedding_rsvps/{docId} {
      allow read: if true;
      allow create: if request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.attendance in ['attending', 'not_attending']
        && request.resource.data.guestCount is number
        && request.resource.data.guestCount >= 0
        && request.resource.data.guestCount <= 10;
      allow update, delete: if false;
    }

    match /wedding_rsvps_stats/{docId} {
      allow read, create, update: if true;
      allow delete: if false;
    }
  }
}
```

For stricter security, add Firebase App Check before sharing the invitation widely.

## RSVP Dashboard

The dashboard reads from a Firestore stats document:

```text
wedding_rsvps_stats / summary
```

When a guest submits the RSVP form, the site updates:

- Responses
- Guests Attending
- Guests Not Attending

The dashboard updates live for everyone viewing the page.

## Guest Wishes

Guest wishes are loaded newest first.

Only 20 records are loaded initially. Guests can tap **Load More** to fetch the next 20 records.

## Google Maps

Update both links in `config.js`:

```js
maps: {
  embedUrl: "https://www.google.com/maps?q=Your%20Venue&output=embed",
  openUrl: "https://maps.app.goo.gl/yourLink"
}
```

Use `embedUrl` for the map shown on the page. Use `openUrl` for the button.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of `AA_Wedding_Website`.
3. Go to repository **Settings**.
4. Open **Pages**.
5. Select your branch, usually `main`.
6. Select root folder or `/docs`, depending where you uploaded the files.
7. Click **Save**.
8. Wait for the GitHub Pages URL to appear.

## Performance Tips

Before publishing:

- Compress real photos.
- Prefer `.webp` for large images.
- Keep music file small.
- Do not upload unused gallery images.
- Test on Android Chrome, Samsung Internet and iPhone Safari.

## Notes

The design intentionally uses a dreamy baby-blue, ivory and champagne-gold palette inspired by the provided wedding illustration. It keeps the illustration as a soft visual anchor without recreating it in code.


