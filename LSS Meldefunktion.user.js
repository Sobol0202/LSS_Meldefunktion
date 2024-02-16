// ==UserScript==
// @name         LSS Meldefunktion
// @namespace    www.leitstellenspiel.de
// @version      0.1
// @description  Fügt meldefunktion ein, weil Team zu unfähig.
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/messages/*
// @match        https://xyrality.helpshift.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Funktion zum Abrufen des Benutzernamens von der API und Öffnen des Modals
    function fetchUserNameAndOpenModal() {
        // Versuche, den Benutzernamen aus dem GM-Speicher abzurufen
        var userName = GM_getValue('userName');
        // Wenn der Benutzername im Speicher gefunden wird, öffne das Modal mit dem Benutzernamen
        if (userName) {
            openModal(userName);
        } else {
            // Andernfalls rufe den Benutzernamen von der API ab und öffne dann das Modal
            fetchUserName(function(userName) {
                // Speichere den Benutzernamen im GM-Speicher
                GM_setValue('userName', userName);
                // Öffne das Modal mit dem abgerufenen Benutzernamen
                openModal(userName);
            });
        }
    }

    // Funktion zum Abrufen des Benutzernamens von der API
    function fetchUserName(callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://www.leitstellenspiel.de/api/credits",
            onload: function(response) {
                if (response.status == 200) {
                    var userData = JSON.parse(response.responseText);
                    var userName = userData["user_name"];
                    callback(userName);
                } else {
                    console.error("Fehler beim Abrufen von Benutzerdaten: ", response.statusText);
                }
            }
        });
    }

    // Funktion zum Öffnen des Modals
    function openModal(userName) {
        // Erstelle ein Modal-Element
        var modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.border = '2px solid #333';
        modal.style.zIndex = '9999';
        modal.style.width = '50%';
        modal.style.height = '80%';

        // Erstelle ein iframe-Element
        var iframe = document.createElement('iframe');
        iframe.src = "https://xyrality.helpshift.com/hc/de/23-mission-chief/contact-us/?p=web";
        iframe.style.width = '100%';
        iframe.style.height = 'calc(100% - 40px)';
        iframe.style.border = 'none';
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

        // Füge das iframe dem Modal hinzu
        modal.appendChild(iframe);

        // Füge das Modal dem body hinzu
        document.body.appendChild(modal);

        // Setze den Benutzernamen-Wert im Input-Feld innerhalb des Modals
        iframe.onload = function() {
            var nameInput = iframe.contentDocument.querySelector('input[placeholder="Vollständigen Namen eingeben"]');
            if (nameInput) {
                nameInput.value = userName;
            } else {
                console.error("Eingabefeld wurde nicht innerhalb des Modals gefunden.");
            }
        };

        // Schließe das Modal, wenn außerhalb davon geklickt wird
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }

    // Erstelle und style den Button
    var button = document.createElement('button');
    button.textContent = 'Modal öffnen';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';

    // Füge einen Event-Listener hinzu, um das Modal zu öffnen, wenn der Button geklickt wird
    button.addEventListener('click', fetchUserNameAndOpenModal);

    // Füge den Button dem body hinzu
    document.body.appendChild(button);

})();
