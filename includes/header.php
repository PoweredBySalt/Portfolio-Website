<header id="header">
  <nav class="navigation" aria-label="Hauptnavigation">
    <a
      aria-label="Zur Startseite"
      href="/"
      class="mobileLogo"
      style="z-index: 0"
      ><img src="/images/logo.svg" alt=""
    /></a>
    <div>
      <div class="hamburgerWrapper">
        <button
          id="menu_open"
          aria-label="Menü öffnen"
          aria-controls="hamburgerMenu"
          aria-expanded="false"
        >
          <img src="/images/SVG/hamburgerMenu.svg" alt="" />
        </button>
        <div class="hamburgerMenu" id="hamburgerMenu" inert>
          <div></div>
          <div>
            <a href="/impressum" class="link">Impressum</a>
            <span style="color: var(--white)">|</span>
            <a href="/datenschutz" class="link">Datenschutz</a>
          </div>
          <div>
            <button id="menu_close" aria-label="Menü schließen">
              <img src="/images/SVG/hamburgerExit.svg" alt="" />
            </button>
            <a class="button_primary" href="/" data-text="Start">Start</a>
            <a class="button_primary" href="/ueber-mich" data-text="Über Mich">Über Mich</a>
            <a class="button_primary" href="/projekte" data-text="Projekte">Projekte</a>
            <a class="button_primary" href="/kontakt" data-text="Kontakt">Kontakt</a>
          </div>
        </div>
      </div>
    </div>
    <div class="hideOnMobile">
      <a href="/" aria-label="Zur Startseite"
        ><img src="/images/logo.svg" alt=""
      /></a>
      <a href="/" class="button_primary" data-text="Start">Start</a>
      <a href="/ueber-mich" class="button_primary" data-text="Über Mich">Über Mich</a>
      <a href="/projekte" class="button_primary" data-text="Projekte">Projekte</a>
      <a href="/kontakt" class="button_primary" data-text="Kontakt">Kontakt</a>
    </div>
  </nav>
</header>
