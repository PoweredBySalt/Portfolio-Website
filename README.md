# marwin-ritschel.de

Personal portfolio of Marwin Ritschel: designer, 3D artist and frontend developer. Live at [marwin-ritschel.de](https://marwin-ritschel.de).

The site is a one-page portfolio (start, about, projects, contact) plus two legal pages. It is written in plain PHP, CSS and vanilla JavaScript, with no build step, framework or package manager. The site content is in German.

## Features

- **One page, real URLs:** the sections have their own paths (`/ueber-mich`, `/projekte`, `/kontakt`) that scroll to the section without a reload.
- **Project popups:** each project tile opens a native `<dialog>` with a description, work steps, tools and a slider of images and videos. The content comes from `popup_information.json`.
- **Contact form:** sent with `fetch` and PHPMailer over SMTP, with spam protection (honeypot, signed form timestamp, minimum fill time) and a per-IP rate limit. It works without JavaScript too.
- **Accessible by default:** keyboard focus styles, labelled form fields, a focus-trapping dialog, `prefers-reduced-motion` respected by every animation.
- **Self-hosted:** fonts, scripts and images are served from the site itself, with a strict Content Security Policy.

## Running it locally

You need PHP (8.1 or newer). Then, from this folder:

```
php -S localhost:8000 dev-router.php
```

and open <http://localhost:8000>.

`dev-router.php` imitates the rewrite rules from `.htaccess` (extensionless URLs, section URLs, 404s), which PHP's built-in server ignores. It does nothing on a real server.

The contact form needs an SMTP password and fails locally unless you provide one (see below). Everything else works without it.

## Contact form setup

`mailer.php` reads its secrets from a `config.php` that lives **one level above the web root**, so it is never served or committed:

```php
<?php
return [
  'smtp_password' => '...',
  'contact_address' => 'you@example.com', // SMTP login, sender and recipient
];
```

The password also serves as the key for the signed form timestamp and the hashed IPs of the rate limit.

Without this file, the form reports an error and logs `Kontaktformular: config.php fehlt`. Never put credentials inside the web root.

## Project structure

| Path | Purpose |
|---|---|
| `index.php` | The one-page site and the project popup |
| `impressum.php`, `datenschutz.php`, `sent.php` | Legal pages and the confirmation page |
| `includes/` | Shared `head`, `header` and `footer`, and the contact form messages |
| `mailer.php` | Contact form handler |
| `popup_information.json` | Data for the project popups |
| `css/` | `style.css` (tokens, layout, components, responsive rules), plus the splitter and legal page styles |
| `javascript/` | One small script per feature, plus the vendored GSAP core |
| `images/`, `videos/`, `fonts/` | Web-ready assets |
| `PHPMailer/` | Vendored PHPMailer, unmodified |
| `.htaccess` | Rewrites, caching, compression and security headers (Apache) |
| `dev-router.php` | Router for local preview only |

Every page sets a few variables (`$page_title`, `$page_path`, `$page_description`, …) and includes the shared parts. All CSS, JS and JSON URLs go through `asset()`, which adds the file's modification time as a version, so the server can cache them for a year.

## Deployment

The files are uploaded as they are to an Apache host (Strato). `CLAUDE.md`, `README.md` and `dev-router.php` are not uploaded. HTTPS redirection is set in the hosting panel, not in `.htaccess`.

## Adding a project

1. Add an entry to `popup_information.json`.
2. Add a matching `<button class="project_tile" data-project="N">` in the projects section of `index.php`. `N` is the zero-based index of the entry in the JSON.
3. Put images (`.webp`) under `images/mockups/projekte/<project>/` and videos (`.webm`) in `videos/`.

## Branches

`main` is the deployed version. The `magnetic-edges` branch holds an experiment with randomly generated low-poly edges whose corners react to the mouse. It is not merged.

## More documentation

`CLAUDE.md` describes the code in detail (scripts, styling rules, the contact form checks, known open issues). It is written as instructions for the Claude Code assistant, but it also works as developer documentation.

## License

No license has been chosen. The code, texts, images and project material are the property of Marwin Ritschel. `PHPMailer` and GSAP keep their own licenses.
