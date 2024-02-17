// ==UserScript==
// @name         LSS Meldefunktion
// @namespace    www.leitstellenspiel.de
// @version      0.3
// @description  Fügt meldefunktion ein, weil Team zu unfähig.
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/messages/*
// @match        https://xyrality.helpshift.com/hc/de/23-mission-chief/contact-us/?p=web
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Funktion, um einen Button hinzuzufügen und den Klick-Event zum Extrahieren und Speichern der Report Daten zu binden
    function addButton() {
        const button = document.createElement('button');
        button.textContent = 'Report Daten extrahieren';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.addEventListener('click', extractAndSaveReportData);
        document.body.appendChild(button);
    }

    // Funktion, um Benutzerdaten über die Benutzer-API abzurufen
    async function fetchUserData() {
        try {
            const response = await fetch('https://www.leitstellenspiel.de/api/credits');
            const userData = await response.json();
            return { username: userData.user_name, userId: userData.user_id };
        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', error);
            return null;
        }
    }

    // Funktion zum Extrahieren von Report Daten und Speichern als GM_Value
    function extractAndSaveReportData() {
        // Extrahieren von Benutzerdaten aus der Benutzer-API
        fetchUserData().then(userData => {
            if (!userData) {
                console.error('Abrufen der Benutzerdaten fehlgeschlagen');
                return;
            }

            const { username: reportingUsername, userId: reportingUserId } = userData;

            // Extrahieren der Report ID aus der aktuellen URL
            const reportId = window.location.href;

            // Extrahieren des gemeldeten Benutzernamens und der Benutzer-ID
            const reportedUsernameElement = document.querySelector('a[href^="/profile/"]');
            const reportedUsername = reportedUsernameElement ? reportedUsernameElement.textContent.trim() : null;
            const reportedUserId = reportedUsernameElement ? reportedUsernameElement.getAttribute('href').match(/\d+/)[0] : null;

            // Extrahieren des Report Texts
            const reportTextElement = document.querySelector('.well');
            const reportText = reportTextElement ? reportTextElement.textContent.trim() : null;

            // Extrahieren der Report Zeit
            const reportTime = new Date().toLocaleString();

            // Generieren der Report Nachricht
            const reportMessage = `Der Nutzer ${reportingUsername} meldet um ${reportTime} den Nutzer ${reportedUsername} mit der ID ${reportedUserId} melden. In der Nachricht ${reportId} hat dieser den folgenden Text versendet: ${reportText}. Die stellt in den Augen von ${reportingUsername} einen Verstoß gegen die AGB oder Geltendes Recht dar. Da ${reportingUsername} über keine Emailadresse verfügt, setzten sie sich für nachfragen mit dem Nutzer Ingame (Profil: ${reportedUserId}) in Verbindung.`;

            // Speichern der Daten als GM_Values
            GM_setValue('reportingUsername', reportingUsername);
            GM_setValue('reportingUserId', reportingUserId);
            GM_setValue('reportId', reportId);
            GM_setValue('reportedUsername', reportedUsername);
            GM_setValue('reportedUserId', reportedUserId);
            GM_setValue('reportText', reportText);
            GM_setValue('reportTime', reportTime);
            GM_setValue('reportMessage', reportMessage);

            // Ausgabe der Daten in die Konsole
            console.log('Meldender Benutzername:', reportingUsername);
            console.log('Meldende Benutzer ID:', reportingUserId);
            console.log('Report ID:', reportId);
            console.log('Gemeldeter Benutzername:', reportedUsername);
            console.log('Gemeldete Benutzer ID:', reportedUserId);
            console.log('Report Text:', reportText);
            console.log('Report Zeit:', reportTime);
            console.log('Report Nachricht:', reportMessage);

            // Nach dem Extrahieren und Speichern der Report Daten fillReportData aufrufen
            fillReportData();
        });
    }

    // Funktion zum Ausfüllen der Report Daten in die Felder
    function fillReportData() {
        const reportingUsername = GM_getValue('reportingUsername');
        const reportTime = GM_getValue('reportTime');
        const reportedUsername = GM_getValue('reportedUsername');
        const reportedUserId = GM_getValue('reportedUserId');
        const reportId = GM_getValue('reportId');
        const reportText = GM_getValue('reportText');
        const reportMessage = GM_getValue('reportMessage');

        console.log('Fill Report Data Function Called');

        // Warten auf 1 Sekunde, bevor die Report Daten eingefügt werden
        setTimeout(() => {
            // Das contact-us-form Element finden
            const contactUsForm = document.querySelector('contact-us-form');
            if (contactUsForm) {
                // Den Shadow Root von contact-us-form bekommen
                const shadowRoot = contactUsForm.shadowRoot;

                // Die Input-Felder im Shadow Root finden und ausfüllen
                if (shadowRoot) {
                    const inputFields = shadowRoot.querySelectorAll('hc-input');
                    inputFields.forEach(input => {
                        switch (input.getAttribute('placeholder')) {
                            case 'Vollständigen Namen eingeben':
                                input.value = reportingUsername;
                                console.log('Meldender Name eingefügt:', reportingUsername);
                                break;
                            case 'Ihre E-Mail-Adresse eingeben':
                                input.value = `${reportingUsername}@leitstellenspiel.de`;
                                console.log('Email eingefügt:', `${reportingUsername}@leitstellenspiel.de`);
                                break;
                            case 'Benutzernamen eingeben':
                                input.value = reportingUsername;
                                console.log('Benutzername eingefügt:', reportingUsername);
                                break;
                            default:
                                console.log('Unbekanntes Eingabefeld');
                        }
                    });

                    // Das Textarea-Feld im Shadow Root finden und ausfüllen
                    const textarea = shadowRoot.querySelector('hc-textarea');
                    if (textarea) {
                        textarea.value = reportMessage;
                        console.log('Report Nachricht eingefügt:', textarea.value);
                    } else {
                        console.log('Textarea nicht gefunden');
                    }
                } else {
                    console.error('Shadow Root nicht gefunden');
                }
            } else {
                console.error('contact-us-form nicht gefunden');
            }
        }, 1000); // 1 Sekunde Wartezeit vor dem Ausfüllen der Report Daten
    }

    // Funktion zum Hinzufügen des Buttons und Binden des Klick-Events
    function addButton() {
        const button = document.createElement('button');
        button.textContent = 'Report Daten extrahieren';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.addEventListener('click', extractAndSaveReportData);
        document.body.appendChild(button);
    }

    // Funktion zum Ausführen von fillReportData beim Laden der Seite
    window.addEventListener('load', function() {
        if (window.location.href.startsWith('https://www.leitstellenspiel.de/messages/')) {
            addButton();
        } else if (window.location.href === 'https://xyrality.helpshift.com/hc/de/23-mission-chief/contact-us/?p=web') {
            fillReportData();
        }
    });
})();
