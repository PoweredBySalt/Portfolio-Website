# CLAUDE.md

Personal portfolio website of Marwin Ritschel (marwin-ritschel.de): designer, 3D artist and frontend developer. PHP pages with shared includes, CSS and vanilla JS, plus one PHP endpoint for the contact form. Hosted on Strato (Apache). Site content and most code comments are in German.

## Running locally

There is no build step, package manager or test suite. Files are deployed as they are.

- The pages are `.php` files and need PHP; VS Code Live Server cannot render them. On the home PC PHP 8.3 is on the PATH (`C:\php8.3\php.exe`) and Git is installed, and the folder is now a git repository (branch `main`, created on the home PC; the work PC has no Git). The work PC has no PHP on the PATH and no Git; there XAMPP's PHP 8.1 is at `C:\xampp\php\php.exe`.
- Preview with `php -S localhost:8000 dev-router.php` from this directory, then open `http://localhost:8000`. `dev-router.php` mimics the `.htaccess` rewrites (extensionless URLs, section URLs, 404s), which PHP's built-in server ignores. It does nothing outside the built-in server. It does **not** copy the access blocks, so locally `/includes/*.php`, and `/PHPMailer/` are reachable (Apache denies them).
- Syntax check: `php -l <file>` (on the work PC use the full XAMPP path).
- Headless Chrome (`"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new`; Edge wasn't found at home, on the work PC use `msedge.exe`) can drive the page for tests. Plain `--screenshot` can't capture scrolled positions, so use the DevTools protocol (`--remote-debugging-port`) for that. Never submit a valid contact form while testing: it sends a real email.
- On Apache, `.htaccess` sets `DirectoryIndex index.php`, maps `/impressum` to `impressum.php`, and redirects old `*.html` URLs to the extensionless form.
- Without `../config.php` (see below), only the contact form fails; everything else works.

## Structure

| Path | Purpose |
|---|---|
| `index.php` | One-page site with sections `#start`, `#about`, `#projects`, `#contact`, plus the project popup `<dialog>` |
| `impressum.php`, `datenschutz.php` | Legal pages (use `css/datenschutz.css`) |
| `sent.php` | Confirmation page that `mailer.php` redirects to |
| `includes/head.php` | Doctype and `<head>` for every page: meta, font preloads, CSS, scripts |
| `includes/header.php`, `includes/footer.php` | Navigation and footer (with the SiteLock badge, `.sitelock`), included by every page |
| `includes/contact_messages.php` | Contact form error messages, shared by `mailer.php` and `index.php` |
| `popup_information.json` | Data for the project popups (one entry per project tile) |
| `mailer.php` | Contact form handler: validation, spam protection, PHPMailer over Strato SMTP |
| `dev-router.php` | Router for local preview with `php -S` |
| `css/style.css` | Main stylesheet: design tokens, layout, popup, responsive rules |
| `css/splitter.css` | Hero title "splitter" decoration (index only) |
| `javascript/` | Site scripts (see below); `librarys/gsap.min.js` is the vendored GSAP core |
| `PHPMailer/` | Vendored PHPMailer library (only `src/`, `LICENSE`, `VERSION`), do not edit. Its `.htaccess` blocks direct requests |
| `images/`, `videos/`, `fonts/` | Assets. Self-hosted fonts are Inter (200/500/900) and Quadrangle. `favicon-32.png` and `apple-touch-icon.png` were generated from the archived `logo.png` |

Source files (large PNG originals) and unused images live outside the web root in `../v11_archiv/`. Only web-ready `.webp`/`.svg` files belong in `images/`.

## How the pages work

**Page template.** Each page sets a few variables and includes the shared parts:

```php
<?php
$page_title = "Impressum";
$page_path = "/impressum";                 // canonical link and og:url
$page_description = "…";                   // meta and og:description
$page_styles = ["/css/datenschutz.css"];   // optional
$page_scripts = ["/javascript/popup.js"];  // optional, loaded after site.js
require __DIR__ . "/includes/head.php";
?>
  <body>
    <?php require __DIR__ . "/includes/header.php"; ?>
    <main>…</main>
    <?php require __DIR__ . "/includes/footer.php"; ?>
  </body>
</html>
```

`head.php` documents all its variables (also `$page_keywords`, `$page_robots`, `$page_fonts`). It outputs the canonical link, Open Graph tags (share image: the hero photo), and the icons. Every new page needs `$page_path` and `$page_description`, and a public page also needs an entry in `sitemap.xml`. Navigation changes go into `includes/header.php`. `includes/.htaccess` blocks direct requests to the includes. Internal links use extensionless URLs (`/impressum`).

**Section URLs.** The start page's sections have their own URLs: `/` (`#start`), `/ueber-mich` (`#about`), `/projekte` (`#projects`), `/kontakt` (`#contact`). The ids stay English because the CSS uses them; the URL is in each section's `data-path`. `.htaccess` (and `dev-router.php`) serve `index.php` for these paths, and `sectionUrls.js` scrolls to the section. Links to sections use the path (`href="/kontakt"`), not `#contact`. A new section URL must be added in all three places. Old `/#contact` links still work and are rewritten to the new URL.

**Cache busting.** `asset($path)` in `head.php` appends `?v=<file modification time>`. All CSS and JS go through it, and `index.php` passes the JSON URL to `popup.js` via `data-source` on the dialog. That's why `.htaccess` can cache CSS, JS and JSON for a year. Any new CSS/JS/JSON URL must go through `asset()`. Images and videos aren't versioned (cached for a month), so give a replaced image a new file name.

**Scripts.** Every script is loaded from `<head>` with `defer`, in this order: `gsap.min.js`, `site.js`, then the page's `$page_scripts`. Each file is wrapped in an IIFE and wires its own event listeners. There are no inline `onclick` handlers or globals.

- `site.js` (all pages): hamburger menu (open/close with GSAP, `inert` and `aria-expanded` while closed, Escape closes it), and `fitUnderline()`, which sets `--underline-w` on `h1`, `h2` and project tile titles so the CSS underline matches the text width.
- `sectionUrls.js` (index): makes the section URLs work. Clicks on section links scroll smoothly and `pushState` the path (no reload; back/forward use the browser's scroll restoration). Opening `/kontakt` jumps to the section, again after `load` unless the visitor has started scrolling. The address bar changes only on clicks, not while scrolling.
- `navIndicator.js` (index): desktop nav underline that slides with GSAP to the link of the section in view (scroll spy); the mobile menu gets a static `.active` underline. It maps links to sections through `data-path`.
- `splitter.js` (index): rotates the splitter SVGs to point away from the hero title, recalculates on load, font load and resize, and pushes them outward on hover.
- `contact.js` (index): sends the contact form with `fetch` (asking `mailer.php` for JSON), so errors appear in `#contact-status` without losing the input. While sending, the button reads "Wird gesendet…". An error is shown in `#contact-status` (`role="alert"`, `tabindex="-1"`) and focus moves to it. On success it goes to `/sent`.
- `popup.js` (index): project popup, a native `<dialog>` opened with `showModal()`, which provides focus trapping and Escape-to-close. A tile's `data-project` attribute is the index into `popup_information.json` (loaded once, cached). The script fills the header, description, worksteps and tool list, and builds an infinite slider. Only the middle (visible) slide is interactive, and only its video plays. Videos use `preload="none"`. All cleanup runs in the dialog's `close` event, however it was closed. The slider button classes are swapped: `.controll_next` is the **left** button (previous, `slide(-1)`), `.controll_prev` the right one (next); the `aria-label`s are correct.

**Reduced motion.** Every animation checks `prefers-reduced-motion`: the JS animations via `matchMedia`, the CSS transitions via a block at the end of `style.css` (and of `splitter.css`). Keep this when adding animations.

**Naming.** `popup.js` uses `snake_case`; `site.js`, `navIndicator.js`, `splitter.js`, `sectionUrls.js` and `contact.js` use `camelCase`. CSS ids and classes are mixed too (`project_popup`, `hamburgerMenu`, `nav_indicator`). Follow the style of the file you are editing.

## Adding or changing a project

1. Add or edit an entry in `popup_information.json`. Fields: `name`, `short_description`, `description` (inserted as HTML, so `<br>` and links work), `worksteps` (strings), `used_software` (`programm_name`, `programm_description`, `programm_path` pointing to a logo, usually in `images/SVG/logos/`), and optional `slider_images` (`image_path`, `image_description`) and `slider_videos` (`video_path`, `video_description`). All paths start with `/`. `worksteps` and `used_software` are required (`popup.js` maps over them; a missing one breaks the popup). Links in `description` are styled by `#project_description a`; give external ones `target="_blank" rel="noopener noreferrer"` and quoted attributes.
2. Add a matching `<button class="project_tile" data-project="N">` in the `#projects` section of `index.php`. `N` is the **zero-based array index** in the JSON, so order matters: inserting an entry in the middle shifts every later tile.
3. Put the media under `images/mockups/projekte/<project>/` as `.webp` (keep the PNG source in `../v11_archiv/`), and videos as `.webm` in `videos/`. Use file names without spaces. Give the tile image `width`, `height` (its pixel size) and `loading="lazy"`.

## Styling

- Design tokens live in `:root` at the top of `css/style.css`: colors `--xrot`, `--xrot_dunkel`, `--ygrün`, `--zblau`, `--text`, `--white`, `--grey`, `--darkgrey`, plus spacing and popup sizes. Use them instead of hard-coded values.
- **Contrast:** text must reach 4.5 : 1.
  - On blue (`--zblau`) use white for text and links; `--grey` fails there.
  - For pink text or hovers on white use `--xrot_dunkel`. `--xrot` is decoration only.
- **Layout grid:** every section's content sits in one centred container of at most 75rem (1200px).
  - Full-width sections use `padding-inline: var(--page_gutter)`; the header and footer logos use `left: var(--page_gutter)`.
  - Two-column sections (hero, About, Contact) use `repeat(2, minmax(0, 1fr))` with `gap: var(--grid_gap)`, so their second columns line up.
  - New sections should do the same rather than adding their own `vw` paddings.
- The stylesheet uses native CSS nesting.
- The base rule `* { text-decoration: none; list-style: none; }` removes all link underlines and list bullets. Every link in running text needs an explicit underline (`.link`, or a rule like `#contact a`) so it isn't marked by colour alone.
- `css/datenschutz.css` is shared by both legal pages and styles bare elements (`section`, `h1`, `h2`…). Scope new rules there to `main`, or they also hit the header and footer (links are already `main a`).
- Font stacks end with `sans-serif` as fallback; keep that when adding a `font-family`.
- Inline `style` attributes beat the stylesheet: `includes/header.php` sets `style="z-index: 0"` on `.mobileLogo`, so the `z-index: 1000` in the 1000px block has no effect.
- `style.css` is divided into numbered sections; the table of contents is at the top of the file:
  1. Variablen (tokens)
  2. Grundlagen (base)
  3. Typografie
  4. Gemeinsame Bausteine (shared components)
  5. Kopfzeile & Navigation
  6. Abschnitte (sections in page order)
  7. Projekt-Popup
  8. Fußzeile (footer)
  9. Responsive (all media queries, wide to narrow)
  10. Hover & reduzierte Bewegung (reduced motion)

  The section headings and the table of contents are in German.

  New rules go into the matching section. Media-query rules go into the existing breakpoint block, not next to the base rule. That keeps the cascade order (media rules after all base rules).
- The footer's jagged top (`.border_footer::after`, `top: -5rem`) hangs above the footer; `.border_footer` needs an explicit `top: 0`, because without it the box starts below the footer's top padding (absolute positioning inside a flex container) and the edge moves down with any extra padding. The footer has `padding-top: 5rem` so the text keeps its distance from the edge.
- Breakpoints: 1440px (About stacks), 1200px, 1000px (desktop nav becomes the hamburger menu; the contact section becomes one column from here down), 900px, 700px. **1200px is also hard-coded in `popup.js`** (`MOBILE_LAYOUT`), which switches the popup description to a toggle panel; keep the two in sync.
- Keyboard focus uses `:focus-visible` (blue outline, white inside `nav` and `footer`). Text fields show focus with their blue border instead. Don't remove outlines without a replacement.
- Only the font weights 500 and 900 of Inter exist in practice (body text renders as 500, bold as 900). Both are preloaded in `head.php`, and Quadrangle is preloaded on index only.
- While the popup is open, `<html>` has the class `popup_open` (blocks scrolling). Safari < 16 falls back to pinning `body` with `position: fixed`.

## Contact form and mail

- The only public email address is `contact@marwin-ritschel.de` (footer, Impressum, Datenschutz, mailer). Don't add others.
- Layout: `#contact-form` is a two-column grid: intro (`.contact_intro`: heading, text, email and GitHub links with icons) on the left, the form on the right (one column from 1000px down). The consent checkbox, status message and send button sit in `.contact_end` (a plain `div`, not a `fieldset`, so screen readers don't announce an unnamed group); the "* Pflichtfeld" note sits next to the send button.
- `index.php#contact` posts to `/mailer.php` with fields `name`, `nachname`, `firma` (optional), `email`, `betreff`, `nachricht`, the consent checkbox `dse=1`, plus the spam-protection fields `website` (hidden honeypot) and `form_time` (set to `time()` when the page renders).
- `mailer.php` checks, in order:
  1. A filled honeypot pretends success.
  2. `form_time` must carry a valid signature (`form_sig`, HMAC with the key from `config.php`, created in `index.php`), and the form must take at least `MIN_FILL_SECONDS` to fill in. `config.php` is loaded before this check.
  3. Required fields, the maximum lengths in `FIELDS` (keep in sync with the `maxlength` attributes; line breaks are normalised to `\n` first, because browsers count `\r\n` as one character), the email, and consent.
  4. At most `RATE_LIMIT_COUNT` messages per IP per hour. The attempt is recorded (`record_send()`) only after the mail was sent, so failed SMTP attempts don't count. Only a keyed hash (`hash_hmac`, key from `config.php`) of the IP is stored, in the server temp folder; files older than the window are deleted, and if the folder can't be written, nobody is blocked. The SMTP timeout is `SMTP_TIMEOUT` (20 s).
- It sends via `smtp.strato.com:465` (SMTPS) as `contact@marwin-ritschel.de`.
- `finish()` reports the result. A request asking for JSON (from `contact.js`) gets `{status, message}`. A plain post is redirected to `/sent`, or to `/kontakt?formular=<status>`, where `index.php` shows the message from `includes/contact_messages.php`.
- The SMTP password is read from `__DIR__ . '/../config.php'`, i.e. **one level above the web root** (locally `../config.php` next to this folder), which must `return ['smtp_password' => '...'];`. Never put credentials into any file inside the web root, and never read out or print that config file. Without it, `mailer.php` logs `Kontaktformular: config.php fehlt` and reports `fehler` (HTTP 500).
- PHPMailer is version 7.0.1 (`PHPMailer/VERSION`). It strips line breaks from the subject and names itself, so header injection via the form is covered.

## Other files

- `.htaccess` contains:
  - `DirectoryIndex index.php`, `LimitRequestBody`, and blocking of a few bots. `CLAUDE.md`, `dev-router.php` and the other dev files are not uploaded to the server, so they need no block;
  - 301 redirects (`/index*` to `/`, `*.html` to extensionless), section URLs (`/kontakt` etc.) to `index.php`, and extensionless URLs to `.php`;
  - MIME types, caching (`mod_expires`), compression (`mod_deflate`) and security headers (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, HSTS, `Permissions-Policy`, `Content-Security-Policy`).
  - The CSP allows only own resources, plus the SiteLock badge image from `shield.sitelock.com` (footer), no inline scripts, but inline `style` attributes. A new external source (font, script, embed) or an inline script needs a CSP change, or the browser blocks it. `dev-router.php` doesn't send these headers, so test the CSP on the live site (console).

  There is no HTTP-to-HTTPS redirect in it; set that in the Strato panel.
- `robots.txt`, `sitemap.xml`: SEO. The sitemap lists `/`, `/impressum`, `/datenschutz`. `/sent` is `noindex` and stays out of it.
- `index.php` contains schema.org `Person` JSON-LD at the end of `<body>`; keep it in line with the visible content.
- Home PC: `C:\website` has no `v11_archiv/`, no backup zips and no `config.php` (the contact form fails here), so the paths above that point to them don't exist at home.
- Branches: `main` is what is deployed. The branch `magnetic-edges` (on GitHub) holds a generated, mouse-reactive version of the low-poly edges (`javascript/magneticEdges.js`, side and corner pieces, a redesigned About card) that isn't merged. Its `CLAUDE.md` documents it, so expect conflicts in `CLAUDE.md`, `style.css` and `index.php` when merging.
- Backups: besides the git repository (home PC only), snapshots are zip files next to this folder (e.g. `../v11_backup_2026-10-29.zip`).

## Open issues

Found in a full review on 2026-10-29. Delete an item once it is fixed. Bugs and typos from that review were fixed the same day (backup: `../v11_backup_2026-10-29_vor-bugfixes.zip`).

**Content and legal** (the owner decides; Claude isn't a lawyer)
- The Impressum and the "verantwortliche Stelle" in the Datenschutz page give only a name and email address, no postal address. A site that offers services to businesses probably needs one (§ 5 DDG).
- The Datenschutz page describes things the site doesn't do: analytics tools, contact by phone or fax, cookie consent. It doesn't mention the hashed IP addresses the contact form stores. It states that a data processing agreement (AVV) with Strato exists; check that it does.
- The "Portfolio Website" project says it was built "ohne Hilfe außenstehender Tools oder Hilfsmittel", but the site uses GSAP and PHPMailer, and the skills section lists Claude.

**Cleanup and ideas**
- `images/Dave_decoration.webp` (54 KB) is no longer used since the contact section lost its decoration image; per the rule above it belongs in `../v11_archiv/`.
- Unused code: the tokens `--xrot`, `--ygrün`, `--darkgrey`, `--popup_height` and `--slider_width`; the selector `#projects h3`; the grid properties on the flex `div:nth-child(2)` of `.hamburgerMenu`; the `min-width`/`margin` of the base `.info` rule (always overridden); the ids `project-1`…`project-7`; the Inter 200 `@font-face` (never downloaded, harmless).
- `robots.txt`: the empty `Disallow:`, `Allow: /` and `Disallow: /cgi-bin/` (no such folder) are redundant, and Google ignores `Crawl-delay`. `User-agent: *`, `Allow: /` and the `Sitemap` line are enough.
- Replace inline styles with classes: the struck-through "musste" (use `<s>`), `sent.php`, the `|` in the header, the `#slider` width and the `style="z-index: 0"` on `.mobileLogo`.
- `100vh` on `#start` and `.hamburgerMenu` can be cut off by mobile browser bars; consider `100svh`/`100dvh`.
- The scrollbar is hidden in Chromium and Safari (`html::-webkit-scrollbar`) but still shows in Firefox.
- There is no custom 404 page (Apache shows its default English one); `/impressum.php` also answers as a duplicate of `/impressum` (the canonical link covers it).
- Videos have no `poster`, so a slide is blank until its video loads. The share image is WebP, which some link-preview crawlers don't support; a JPEG copy is safer.
- Contact form ideas: split the generic `eingabe` error into specific messages (too long, expired form); let the signed `form_time` expire (e.g. after 24 h); rename the honeypot `website`, which browsers may autofill; add a character counter to the textarea; a fallback when SMTP fails so no message is lost; subject prefix such as `[Website]`; skip the empty `Firma:` line in the mail.
- Contact form accessibility (reviewed 2026-10-29; no screen reader test): the light-grey field borders (`--grey` on white, ~1.4:1) are below the 3:1 of WCAG 1.4.11 (a `--darkgrey` border plus a focus outline fixes it; the owner reverted that for looks); errors aren't tied to a field (the generic `eingabe` message has no `aria-invalid`/`aria-describedby`); the blue left/bottom border is a small focus cue; the "* Pflichtfeld" note comes after the fields, WCAG 3.3.2 prefers it before (the `required` attributes already tell screen readers); the honeypot can still be focused with a mouse or script.
- Accessibility: the open hamburger menu doesn't trap focus or lock scrolling (it covers the screen at ≤ 700px); the hero portrait has `alt=""`; the footer logo's label "Zurück zum Anfang der Seite" is wrong on the legal pages.
- Small JS/PHP details: `navIndicator.js` lacks `"use strict"` and uses `pageYOffset` (use `scrollY`); the slider arrow hover `scale` sits outside `@media (hover: hover)`; `FALLBACK_MESSAGE` in `contact.js` duplicates the `fehler` message without the email address; the contact form's width cap (`#contact form`, 40rem) and the Dave overlap between 1000 and 1200px haven't been checked visually.
