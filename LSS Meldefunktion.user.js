// ==UserScript==
// @name         LSS Meldefunktion
// @namespace    www.leitstellenspiel.de
// @version      0.5
// @description  Fügt meldefunktion ein.
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/messages/*
// @match        https://xyrality.helpshift.com/hc/de/23-mission-chief/contact-us/?p=web
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Function to add a button and bind the click event to extract and save report data
    function addButton() {
        const button = document.createElement('button');
        button.textContent = 'Extract Report Data';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.addEventListener('click', extractAndSaveReportData);
        document.body.appendChild(button);
    }

    // Function to extract user data using the User API
    async function fetchUserData() {
        try {
            const response = await fetch('https://www.leitstellenspiel.de/api/credits');
            const userData = await response.json();
            return { username: userData.user_name, userId: userData.user_id };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Function to extract report data and save as GM_Value
    function extractAndSaveReportData() {
        // Extracting reporting user data from User API
        fetchUserData().then(userData => {
            if (!userData) {
                console.error('Failed to get reporting user data');
                return;
            }

            const { username: reportingUsername, userId: reportingUserId } = userData;

            // Extracting report ID from current URL
            const reportId = window.location.href;

            // Extracting reported username and user ID
            const reportedUsernameElement = document.querySelector('a[href^="/profile/"]');
            const reportedUsername = reportedUsernameElement ? reportedUsernameElement.textContent.trim() : null;
            const reportedUserId = reportedUsernameElement ? reportedUsernameElement.getAttribute('href').match(/\d+/)[0] : null;

            // Extracting report text
            const reportTextElement = document.querySelector('.well');
            const reportText = reportTextElement ? reportTextElement.textContent.trim() : null;

            // Extracting report time
            const reportTime = new Date().toLocaleString();

            // Generating report message
            const reportMessage = `Der Nutzer ${reportingUsername} meldet um ${reportTime} den Nutzer ${reportedUsername} mit der ID ${reportedUserId} melden. In der Nachricht ${reportId} hat dieser den folgenden Text versendet: ${reportText}. Die stellt in den Augen von ${reportingUsername} einen Verstoß gegen die AGB oder Geltendes Recht dar. Da ${reportingUsername} über keine Emailadresse verfügt, setzten sie sich für nachfragen mit dem Nutzer Ingame (Profil: ${reportedUserId}) in Verbindung.`;

            // Saving data as GM_Values
            GM_setValue('reportingUsername', reportingUsername);
            GM_setValue('reportingUserId', reportingUserId);
            GM_setValue('reportId', reportId);
            GM_setValue('reportedUsername', reportedUsername);
            GM_setValue('reportedUserId', reportedUserId);
            GM_setValue('reportText', reportText);
            GM_setValue('reportTime', reportTime);
            GM_setValue('reportMessage', reportMessage);

            // Outputting data to console
            console.log('Reporting Username:', reportingUsername);
            console.log('Reporting User ID:', reportingUserId);
            console.log('Report ID:', reportId);
            console.log('Reported Username:', reportedUsername);
            console.log('Reported User ID:', reportedUserId);
            console.log('Report Text:', reportText);
            console.log('Report Time:', reportTime);
            console.log('Report Message:', reportMessage);

            // Call fillReportData after extracting and saving report data
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
    const reportMessage = `Der Nutzer ${reportingUsername} meldet um ${reportTime} den Nutzer ${reportedUsername} mit der ID ${reportedUserId}. In der Nachricht ${reportId} hat dieser den folgenden Text versendet:\n\n${reportText}\n\nDies stellt in den Augen von ${reportingUsername} einen Verstoß gegen die AGB oder geltendes Recht dar.\nDa ${reportingUsername} über keine Emailadresse verfügt, setzten sie sich für Nachfragen mit dem Nutzer Ingame (Profil: ${reportedUserId}) in Verbindung.`;

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

                // Das hc-textarea Element finden
                const hcTextarea = shadowRoot.querySelector('hc-textarea');
                if (hcTextarea) {
                    // Den Shadow Root von hc-textarea bekommen
                    const hcTextareaShadowRoot = hcTextarea.shadowRoot;
                    if (hcTextareaShadowRoot) {
                        // Das textarea-Feld im Shadow Root finden und ausfüllen
                        const textarea = hcTextareaShadowRoot.querySelector('textarea');
                        if (textarea) {
                            textarea.value = reportMessage;
                            console.log('Report Nachricht eingefügt:', textarea.value);
                        } else {
                            console.error('Textarea nicht gefunden im Shadow Root von hc-textarea');
                        }
                    } else {
                        console.error('Shadow Root von hc-textarea nicht gefunden');
                    }
                } else {
                    console.error('hc-textarea nicht gefunden');
                }
            } else {
                console.error('Shadow Root von contact-us-form nicht gefunden');
            }
        } else {
            console.error('contact-us-form nicht gefunden');
        }
    }, 1000); // 1 Sekunde Wartezeit vor dem Ausfüllen der Report Daten
}

    // Fill report data when the page is loaded
    window.addEventListener('load', function() {
        if (window.location.href.startsWith('https://www.leitstellenspiel.de/messages/')) {
            addButton();
        } else if (window.location.href === 'https://xyrality.helpshift.com/hc/de/23-mission-chief/contact-us/?p=web') {
            fillReportData();
        }
    });
})();
