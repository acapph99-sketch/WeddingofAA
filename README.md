# AA_Wedding_Website

A premium Malay Muslim wedding invitation website for the Walimatulurus of Anis Zulaikha and Mohamad Asyraf.

The site is static and GitHub Pages-ready. It uses only HTML, CSS and vanilla JavaScript, with no backend and no Firebase dependency.

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
      wedding-illustration.png
      wedding-illustration.webp
      bride.svg
      groom.svg
    music/
      wedding-music.wav
    icons/
      favicon.svg
```

## Edit Wedding Details

Open `config.js`. Editable content lives there:

- Bride and groom names
- Monogram
- Date and time
- Venue
- Bride's parents
- Contact people
- Google Maps links
- Music path
- Image paths
- Timeline items

## Replace Images

Replace these files with your final assets:

```text
assets/images/wedding-illustration.png
assets/images/bride.svg
assets/images/groom.svg
```

If you change filenames, update the paths inside `config.js` and `style.css`.

Recommended sizes:

- Hero/background image: 1600px wide or larger, compressed
- Couple photos: 800px by 800px, square crop

## Replace Music

The included music file is a generated placeholder:

```text
assets/music/wedding-music.wav
```

To replace it:

1. Add your music file inside `assets/music/`.
2. Use a compressed `.mp3` file if possible.
3. Update `music.path` in `config.js`.

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

## Contact Buttons

Contacts are configured in `config.js`:

```js
contacts: [
  {
    name: "En. Musher",
    relationship: "Family Representative",
    phone: "+060125221040"
  }
]
```

The site automatically creates WhatsApp and Call buttons.

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

## Notes

The design uses a dreamy baby-blue, ivory and soft champagne palette inspired by the provided wedding illustration.
