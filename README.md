# AA_Wedding_Website

A premium static Malay Muslim wedding invitation website for Mohamad Asyraf and Anis Zulaikha.

Built with:

- HTML
- CSS
- Vanilla JavaScript

No backend, build tools, frameworks, Bootstrap, React, Vue or Angular are required. The project is compatible with GitHub Pages.

## Project Structure

```text
AA_Wedding_Website/
  index.html
  style.css
  script.js
  config.js
  README.md
  assets/
    images/
      hero.svg
      groom.svg
      bride.svg
      gallery/
    music/
      wedding-music.wav
    icons/
```

## Editing Wedding Information

Edit `config.js` to change:

- Bride name
- Groom name
- Wedding date
- Invitation time
- Arrival time
- Venue
- Parents
- WhatsApp number
- Google Maps URL
- Image paths
- Music path

## Replacing Images

Replace these files with your real photos:

- `assets/images/hero.svg`
- `assets/images/groom.svg`
- `assets/images/bride.svg`
- `assets/images/gallery/gallery-1.svg` through `gallery-6.svg`

You may use `.jpg`, `.png` or `.webp` files. If filenames change, update the paths in `config.js`.

## Adding Music

Place your wedding music file here, or update `musicPath` in `config.js`:

```text
assets/music/wedding-music.wav
```

The included `.wav` file is a small generated placeholder. Music does not autoplay. It starts only after the guest clicks **Open Invitation**.

## Personalized Guest Link

Use the `to` URL parameter:

```text
https://yourusername.github.io/AA_Wedding_Website/?to=John
```

The website will display:

```text
Dear
John
```

If no `to` parameter exists, the guest section is hidden.

## Deploying to GitHub Pages

1. Upload the `AA_Wedding_Website` folder to a GitHub repository.
2. Go to repository **Settings**.
3. Open **Pages**.
4. Select the branch and folder where the site is stored.
5. Save and wait for GitHub Pages to publish.
