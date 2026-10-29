<?php
/*
 * Messages for the contact form, keyed by the status mailer.php reports.
 * mailer.php sends them to contact.js as JSON; without JavaScript, index.php
 * shows them from /kontakt?formular=<status>.
 */
return [
    "eingabe" =>
        "Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzerklärung.",
    "zu_schnell" =>
        "Das ging etwas zu schnell. Bitte senden Sie das Formular in ein paar Sekunden erneut.",
    "zu_viele" =>
        "Sie haben bereits mehrere Nachrichten gesendet. Bitte versuchen Sie es später erneut.",
    "fehler" =>
        "Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an contact@marwin-ritschel.de.",
];
