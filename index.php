<?php
$page_title = "Marwin Ritschel – Portfolio | Design, 3D & Frontend";
$page_path = "/";
$page_description =
  "Portfolio von Marwin Ritschel – Mediengestalter, Designer, 3D-Artist und Frontend Developer. Projekte aus Design, 3D und Webentwicklung.";
$page_keywords = "Adobe, Blender, 3D-Artist, Frontend";
$page_styles = ["/css/splitter.css"];
$page_scripts = [
  "/javascript/splitter.js",
  "/javascript/popup.js",
  "/javascript/sectionUrls.js",
  "/javascript/navIndicator.js",
  "/javascript/contact.js",
];
$page_fonts = ["/fonts/Quadrangle-Regular.woff2"];
require __DIR__ . "/includes/head.php";

// CV download in the About card. The size shown next to the button is read
// from the file, so it stays right when the PDF is replaced.
$cv_path = "/dokumente/Lebenslauf_website.pdf";
$cv_bytes = @filesize(__DIR__ . $cv_path);
$cv_size = "";
if ($cv_bytes) {
  $cv_size =
    $cv_bytes >= 1048576
      ? number_format($cv_bytes / 1048576, 1, ",", ".") . " MB"
      : max(1, round($cv_bytes / 1024)) . " KB";
}

// Status after a form post without JavaScript (see mailer.php)
$contact_messages = require __DIR__ . "/includes/contact_messages.php";
$contact_status = $_GET["formular"] ?? "";
$contact_message = is_string($contact_status)
  ? $contact_messages[$contact_status] ?? ""
  : "";

// Signed render time for the spam check in mailer.php. Without config.php the
// signature stays empty and mailer.php reports an error anyway.
$form_time = time();
$form_config = is_file(__DIR__ . "/../config.php")
  ? require __DIR__ . "/../config.php"
  : [];
$form_sig = is_string($form_config["smtp_password"] ?? null)
  ? hash_hmac("sha256", "form_time|" . $form_time, $form_config["smtp_password"])
  : "";
unset($form_config);
?>

  <body>
    <?php require __DIR__ . "/includes/header.php"; ?>
    <main>
      <dialog
        id="project_popup"
        aria-labelledby="project_popup_title"
        data-source="<?= e(asset("/popup_information.json")) ?>"
      >
        <div id="project_popup_window">
          <div id="project_popup_nav">
            <div id="description_header">
              <h2 id="project_popup_title">ÜBERSCHRIFT</h2>
              <span>UNTERÜBERSCHRIFT</span>
            </div>
            <button id="close_popup" aria-label="Projekt schließen">
              <img src="/images/SVG/CloseButton.svg" alt="" />
            </button>
          </div>
          <div id="project_popup_content">
            <div>
              <div id="slider" style="width: auto">
                <button class="controll_next" aria-label="Vorheriges Bild">
                  <img src="/images/SVG/sliderNav.svg" alt="" />
                </button>
                <button class="controll_prev" aria-label="Nächstes Bild">
                  <img src="/images/SVG/sliderNav.svg" alt="" />
                </button>
                <ul></ul>
              </div>
            </div>
            <div id="project_description" style="height: 0">
              <div id="description_left">
                <h3>Beschreibung</h3>
                <p>INFORMATIONEN</p>
              </div>
              <div id="description_right">
                <h3>Tätigkeiten</h3>
                <ul></ul>
                <h3>Genutzte Tools</h3>
                <ul></ul>
              </div>
            </div>
          </div>
          <button
            id="toggle_description"
            class="button_secondary"
            data-text="Infos"
            aria-controls="project_description"
            aria-expanded="false"
          >
            Infos
          </button>
        </div>
      </dialog>
      <!-- data-path: the section's URL, see javascript/sectionUrls.js and .htaccess -->
      <section id="start" data-path="/">
        <img
          fetchpriority="high"
          src="/images/auch_ich.webp"
          alt=""
          width="1174"
          height="1271"
        />
        <div class="hero_text">
          <a href="/ueber-mich">
            <div class="splitter_anim">
              <h1 class="splitterObject">
                <span>Marwin <br />Ritschel</span>
                <span>
                  <span>Designer</span>
                  <span aria-hidden="true">–</span>
                  <span>3D-Artist</span>
                  <span aria-hidden="true">–</span>
                  <span>Frontend Developer</span>
                </span>
              </h1>
              <img
                src="/images/SVG/splitter/splitter_01.svg"
                alt=""
                class="splitter1"
              />
              <img
                src="/images/SVG/splitter/splitter_02.svg"
                alt=""
                class="splitter2"
              />
              <img
                src="/images/SVG/splitter/splitter_03.svg"
                alt=""
                class="splitter3"
              />
            </div>
          </a>
          <div class="hero_actions">
            <a class="button_secondary" href="/kontakt" data-text="Kontakt aufnehmen">Kontakt aufnehmen</a>
            <a class="button_tertiary" href="/projekte" data-text="Projekte ansehen">Projekte ansehen</a>
          </div>
        </div>
      </section>
      <section id="about" data-path="/ueber-mich">
        <div class="borders"></div>
        <div>
          <div>
            <div class="info">
              <div style="width: fit-content">
                <h2>Über Marwin</h2>
              </div>
              <p>
                Marwin ist ein sehr engagierter und leidenschaftlicher Designer,
                der es sehr befremdlich findet, von sich selbst in der dritten
                Person zu schreiben. Sein Interesse an Kunst, Design und allem,
                was damit verbunden ist, hat sich bereits mit fünf Jahren
                offenbart, als er zum ersten Mal Art Attack schaute. Mit seinem
                ersten PC kam auch das Interesse an Videospielen und der damit
                zusammenhängenden Entwicklung ins Spiel, weswegen er mit 15
                anfing, erste Erfahrungen mit Blender zu sammeln. Diese
                Besessenheit setzt sich bis heute fort. <br /><br />
                Zurzeit macht Marwin seine Ausbildung als Mediengestalter mit
                der Spezialisierung digital, während welcher er nicht nur die
                gesamte Adobe Suite kennenlernen
                <span style="font-size: 1em !important"
                  ><span
                    style="
                      text-decoration: line-through;
                      font-size: 1em !important;
                    "
                    >musste</span
                  >
                  durfte,</span
                >
                sondern auch sein Interesse fürs Programmieren entdecken konnte.
              </p>
              <p class="download">
                <a
                  class="button_secondary"
                  href="<?= $cv_path ?>"
                  download="Marwin_Ritschel_Lebenslauf.pdf"
                  data-text="Lebenslauf herunterladen"
                  >Lebenslauf herunterladen</a
                >
                <?php if ($cv_size): ?>
                  <span class="file_info">PDF, <?= $cv_size ?></span>
                <?php endif; ?>
              </p>
            </div>
          </div>
          <div style="z-index: 1">
            <h2>Fähigkeiten</h2>
            <div class="barGraph">
              <h3>Programme</h3>
              <ul>
                <li>
                  <img
                    src="/images/SVG/logos/Blender.svg"
                    alt=""
                    width="181"
                    height="148"
                    loading="lazy"
                  />
                  <div>
                    <h4>Blender</h4>
                    <span> 10 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/Illustrator.svg"
                    alt=""
                    width="240"
                    height="234"
                    loading="lazy"
                  />
                  <div>
                    <h4>Illustrator</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/InDesign.svg"
                    alt=""
                    width="240"
                    height="234"
                    loading="lazy"
                  />
                  <div>
                    <h4>InDesign</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/Photoshop.svg"
                    alt=""
                    width="240"
                    height="234"
                    loading="lazy"
                  />
                  <div>
                    <h4>Photoshop</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/HTML.svg"
                    alt=""
                    width="512"
                    height="512"
                    loading="lazy"
                  />
                  <div>
                    <h4>HTML</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/CSS.svg"
                    alt=""
                    width="1000"
                    height="1000"
                    loading="lazy"
                  />
                  <div>
                    <h4>CSS</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/JavaScript.svg"
                    alt=""
                    width="630"
                    height="630"
                    loading="lazy"
                  />
                  <div>
                    <h4>JavaScript</h4>
                    <span> 2 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/Godot.svg"
                    alt=""
                    width="1024"
                    height="1024"
                    loading="lazy"
                  />
                  <div>
                    <h4>Godot</h4>
                    <span> 3 Jahre</span>
                  </div>
                </li>
                <li>
                  <img
                    src="/images/SVG/logos/Claude.svg"
                    alt=""
                    width="100"
                    height="100"
                    loading="lazy"
                  />
                  <div>
                    <h4>Claude</h4>
                    <span> 1 Jahr</span>
                  </div>
                </li>
              </ul>
            </div>
            <div class="kenntnisse">
              <div>
                <h3>Weitere Kenntnisse</h3>
                <ul>
                  <li>
                    <span> MS Office </span>
                  </li>
                  <li>
                    <span> TV Paint </span>
                  </li>
                  <li>
                    <span> Adobe After Effects </span>
                  </li>
                  <li>
                    <span> Adobe Premiere </span>
                  </li>
                  <li>
                    <span> Adobe Substance Painter </span>
                  </li>
                  <li>
                    <span> Computertechnik </span>
                  </li>
                  <li>
                    <span> Führerschein Klasse B </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3>Sprachen</h3>
                <ul>
                  <li>
                    <span> Deutsch (Muttersprache) </span>
                  </li>
                  <li>
                    <span> Englisch (C1) </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3>Hobbys</h3>
                <ul>
                  <li>
                    <span> 3D-Modelling</span>
                  </li>
                  <li>
                    <span> Zeichnen </span>
                  </li>
                  <li>
                    <span> Bass spielen</span>
                  </li>
                  <li>
                    <span> Angeln </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="projects" data-path="/projekte">
        <h2>Projekte</h2>
        <div>
          <button id="project-1" class="project_tile" data-project="0">
            <span>
              <span>Limondo</span>
              <span>Erstellung einer fiktiven Limo</span>
            </span>
            <img
              src="/images/mockups/projekte/limondo/limondo_mockup.webp"
              alt=""
              width="648"
              height="810"
              loading="lazy"
            />
          </button>
          <button id="project-2" class="project_tile" data-project="1">
            <span>
              <span>Chronometer</span>
              <span>Vektorisierung eines Chronometers</span>
            </span>
            <img
              src="/images/mockups/projekte/chronometer/chronometer.webp"
              alt=""
              width="826"
              height="1032"
              loading="lazy"
            />
          </button>
          <button id="project-3" class="project_tile" data-project="2">
            <span>
              <span>Viva La Musica</span>
              <span>Logo Redesign</span>
            </span>
            <img
              src="/images/mockups/projekte/vivaLaMusica/Free_90x50mm_Business_Card_Mockup_1.webp"
              alt=""
              width="600"
              height="750"
              loading="lazy"
            />
          </button>
          <button id="project-4" class="project_tile" data-project="3">
            <span>
              <span>Autismus Dresden e.V.</span>
              <span>Logo Redesign</span>
            </span>
            <img
              src="/images/mockups/projekte/autismusdresden/Business_Card_Mockup_1.webp"
              alt=""
              width="600"
              height="750"
              loading="lazy"
            />
          </button>
          <button id="project-5" class="project_tile" data-project="4">
            <span>
              <span>D4-VE</span>
              <span>3D-modellierter Roboter</span>
            </span>
            <img
              src="/images/mockups/projekte/dave/D4VE.webp"
              alt=""
              width="1080"
              height="1350"
              loading="lazy"
            />
          </button>
          <button id="project-6" class="project_tile" data-project="5">
            <span>
              <span>Praktikum bei adsbe</span>
              <span>Ansammlung von Projekten</span>
            </span>
            <img
              src="/images/mockups/projekte/adsbe/title_adsbe.webp"
              alt=""
              width="567"
              height="709"
              loading="lazy"
            />
          </button>
          <button id="project-7" class="project_tile" data-project="6">
            <span>
              <span>Portfolio Website</span>
              <span>Front- und Backend-Programmierung</span>
            </span>
            <img
              src="/images/mockups/projekte/website/ipadMockup.webp"
              alt=""
              width="627"
              height="640"
              loading="lazy"
            />
          </button>
        </div>
      </section>
      <section id="contact" data-path="/kontakt">
        <div class="borderWhite"></div>
        <div id="contact-form">
          <div class="contact_intro">
            <h2>Kontakt</h2>
            <h3>Let's Talk!</h3>
            <p class="contact_text">
              Sie haben eine Stelle oder ein Praktikum zu vergeben oder möchten mich kennenlernen? Schreiben Sie mir über das Formular oder direkt per E-Mail.
            </p>
            <ul class="contact_links">
              <li>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"></path>
                </svg>
                <a href="mailto:contact@marwin-ritschel.de">contact@marwin-ritschel.de</a>
              </li>
              <li>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
                </svg>
                <a href="https://github.com/PoweredBySalt" target="_blank" rel="noopener noreferrer">Mein GitHub-Profil</a>
              </li>
              <li>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"></path>
                </svg>
                <a href="https://www.linkedin.com/in/marwin-ritschel/" target="_blank" rel="noopener noreferrer">Mein LinkedIn-Profil</a>
              </li>
            </ul>
          </div>
          <!-- maxlength values match FIELDS in mailer.php -->
          <form action="/mailer.php" id="contactForm" method="POST">
            <div class="field">
              <label for="contact-name">Vorname <span class="required" aria-hidden="true">*</span></label>
              <input
                type="text"
                name="name"
                id="contact-name"
                autocomplete="given-name"
                maxlength="100"
                required
              />
            </div>
            <div class="field">
              <label for="contact-nachname">Nachname <span class="required" aria-hidden="true">*</span></label>
              <input
                type="text"
                name="nachname"
                id="contact-nachname"
                autocomplete="family-name"
                maxlength="100"
                required
              />
            </div>
            <div class="field field_wide">
              <label for="contact-firma">Firma (optional)</label>
              <input
                type="text"
                name="firma"
                id="contact-firma"
                autocomplete="organization"
                maxlength="100"
              />
            </div>
            <div class="field field_wide">
              <label for="contact-email">E-Mail <span class="required" aria-hidden="true">*</span></label>
              <input
                type="email"
                name="email"
                id="contact-email"
                autocomplete="email"
                maxlength="254"
                required
              />
            </div>
            <div class="field field_wide">
              <label for="contact-betreff">Betreff <span class="required" aria-hidden="true">*</span></label>
              <input
                type="text"
                name="betreff"
                id="contact-betreff"
                maxlength="200"
                required
              />
            </div>
            <div class="field field_wide">
              <label for="contact-nachricht">Ihre Nachricht <span class="required" aria-hidden="true">*</span></label>
              <textarea
                name="nachricht"
                id="contact-nachricht"
                maxlength="5000"
                required
              ></textarea>
            </div>
            <!-- Spam protection: bots fill in the hidden field and send faster
                 than the minimum time after form_time (see mailer.php). -->
            <div class="contact_trap" aria-hidden="true">
              <label for="contact-website">Website</label>
              <input
                type="text"
                name="website"
                id="contact-website"
                tabindex="-1"
                autocomplete="off"
              />
            </div>
            <input type="hidden" name="form_time" value="<?= $form_time ?>" />
            <input type="hidden" name="form_sig" value="<?= e($form_sig) ?>" />
            <div class="contact_end">
              <div>
                <input type="checkbox" name="dse" value="1" id="contact-dse" required />
                <label id="datenschutz" for="contact-dse">
                  Ich habe die
                  <a class="link" href="/datenschutz">Datenschutzerklärung</a>
                  zur Kenntnis genommen. <span class="required" aria-hidden="true">*</span>
                </label>
              </div>
              <p id="contact-status" role="alert" tabindex="-1"><?= e($contact_message) ?></p>
              <div class="contact_submit">
                <p class="required_note">* Pflichtfeld</p>
                <button class="button_secondary" type="submit" data-text="Senden">Senden</button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
    <?php require __DIR__ . "/includes/footer.php"; ?>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Marwin Ritschel",
        "url": "https://marwin-ritschel.de/",
        "image": "https://marwin-ritschel.de/images/auch_ich.webp",
        "email": "contact@marwin-ritschel.de",
        "sameAs": [
          "https://github.com/PoweredBySalt",
          "https://www.linkedin.com/in/marwin-ritschel/"
        ],
        "jobTitle": ["Designer", "3D-Artist", "Frontend Developer"]
      }
    </script>
  </body>
</html>
