// ==UserScript==
// @name         KenaMobile - Iniezione Operatori Definitiva (Ottimizzata)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Aggiunge tutti gli operatori mancanti al menu a tendina e agli input hidden, garantendo persistenza e feedback visivo; mantiene l'ordine alfabetico nel menu.
// @author       AI Assistant
// @match        https://www.kenamobile.it/prodotto/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const DEBUG = false; // Imposta su true per log dettagliati in console

    // Lista completa operatori (codice server corretto)
    // Aggiornata con i provider aggiuntivi rilevati nella schermata fornita.
    const allOperators = [
        { code: "code_9",  name: "1MOBILE" },
        { code: "code_64", name: "2APPY" },
        { code: "code_58", name: "CHINA MOBILE" },
        { code: "code_52", name: "COOP VOCE" },
        { code: "code_12", name: "DAILY TELECOM" },
        { code: "code_36", name: "DIGI MOBIL" },
        { code: "code_54", name: "ENEGAN MOBILE" },
        { code: "code_42", name: "FASTWEB" },
        { code: "code_61", name: "FEDER MOBILE" },
        { code: "code_24", name: "GREEN" },
        { code: "code_45", name: "HO MOBILE" },
        { code: "code_46", name: "ILIAD" },
        { code: "code_27", name: "LYCA MOBILE" },
        { code: "code_49", name: "NOITEL" },
        { code: "code_44", name: "OPTIMA" },
        { code: "code_47", name: "PLINTRON" },
        { code: "code_30", name: "POSTEMOBILE FULL" },
        { code: "code_10", name: "POSTEMOBILE (pre2014)" },
        { code: "code_53", name: "SPUSU" },
        { code: "code_2",  name: "TIM" },
        { code: "code_6",  name: "TISCALI" },
        { code: "code_3",  name: "VODAFONE" },
        { code: "code_55", name: "WINDTRE" },
        { code: "code_62", name: "ELITE MOBILE" },
        { code: "code_32", name: "INTERMATICA" },
        { code: "code_60", name: "OVUNQUE" },
        { code: "code_63", name: "ITALIA POWER" },
        { code: "code_25", name: "NETVALUE" },
        { code: "code_18", name: "NOVERCA" },
        { code: "code_50", name: "NTMOBILE" },
        { code: "code_48", name: "RABONA MOBILE" },
        { code: "code_56", name: "TELMEKOM" },
        { code: "code_57", name: "PROFESSIONAL LINK" },
        { code: "code_43", name: "WELCOME ITALIA" },
        { code: "code_59", name: "WINGS MOBILE" },
        { code: "code_51", name: "WITHU MOBILE" }
    ];

    // Creiamo una copia ordinata alfabeticamente (locale it) per le iniezioni
    const sortedOperators = [...allOperators].sort((a, b) =>
        a.name.localeCompare(b.name, 'it', { sensitivity: 'base', numeric: true })
    );

    const FIRST_ELEMENT_SELECTOR = 'select#operator option[disabled="disabled"]';

    // --- Notifica in stile Kena ---
    function showToast(message, type = "success") {
        const old = document.getElementById("kena-toast");
        if (old) old.remove();

        const toast = document.createElement("div");
        toast.id = "kena-toast";
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.top = "20px";
        toast.style.right = "20px";
        toast.style.backgroundColor = type === "success" ? "#FFD200" : "#555";
        toast.style.color = type === "success" ? "#000" : "#fff";
        toast.style.fontFamily = "Arial, sans-serif";
        toast.style.fontWeight = "600";
        toast.style.fontSize = "14px";
        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "8px";
        toast.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
        toast.style.zIndex = "99999";
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s ease";
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.style.opacity = "1");
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // --- Sezione 1: Iniezione nel Menu a Tendina ---
    function injectSelectOptions() {
        const initialReference = document.querySelector(FIRST_ELEMENT_SELECTOR);
        if (!initialReference) {
            if (DEBUG) console.log("[KenaPatch] FIRST_ELEMENT_SELECTOR non trovato:", FIRST_ELEMENT_SELECTOR);
            return false;
        }

        // Troviamo tutte le option esistenti (eccetto la prima "Seleziona") per capire ordine corrente
        const select = document.querySelector('select#operator');
        if (!select) {
            if (DEBUG) console.log("[KenaPatch] select#operator non trovato");
            return false;
        }

        // Costruiamo una mappa delle option esistenti per evitare duplicati
        const existingValues = new Set(Array.from(select.options).map(o => o.value));

        // Rimuoviamo tutte le option aggiunte in precedenza dalla nostra lista (solo se presenti),
        // così possiamo ricostruire l'ordine correttamente (utile se la pagina rimescola elementi)
        // Nota: non rimuoviamo le option che non fanno parte della nostra allOperators.
        Array.from(select.querySelectorAll('option')).forEach(opt => {
            if (opt.disabled) return; // lasciamo l'elemento "Seleziona"
            if (allOperators.some(x => x.code === opt.value)) {
                // se è un'opzione nostra, la rimuoviamo per poi reinserirla in ordine corretto
                opt.remove();
            }
        });

        // Inseriamo tutte le option ordinate subito dopo l'elemento "Seleziona"
        let reference = initialReference;
        let added = 0;
        sortedOperators.forEach(operator => {
            // Se l'opzione non esisteva inizialmente (o è stata rimossa/reinserita), inseriamo
            // controlliamo comunque che non esista già (per sicurezza)
            if (!select.querySelector(`option[value="${operator.code}"]`)) {
                const newOption = document.createElement('option');
                newOption.value = operator.code;
                newOption.textContent = operator.name;
                reference.insertAdjacentElement('afterend', newOption);
                reference = newOption;
                added++;
            } else {
                // se per qualche motivo esiste (edge-case), spostiamo il riferimento su quella option
                reference = select.querySelector(`option[value="${operator.code}"]`);
            }
        });

        if (added > 0) {
            if (DEBUG) console.log(`[KenaPatch] Aggiunte ${added} opzioni mancanti al menu.`);
            showToast(`Aggiunti ${added} operatori ✅`);
        } else {
            if (DEBUG) console.log("[KenaPatch] Nessuna opzione da aggiungere (tutto già presente).");
        }
        return added > 0;
    }

    // --- Sezione 2: Iniezione negli Input Hidden ---
    function injectHiddenInputs() {
        const inputContainer = document.querySelector('div.col-md-8.col-xs-10');
        if (!inputContainer) {
            if (DEBUG) console.log("[KenaPatch] input container non trovato");
            return false;
        }

        let currentReference = inputContainer.querySelector('input#numberToCheck');
        if (!currentReference) {
            if (DEBUG) console.log("[KenaPatch] input#numberToCheck non trovato");
            return false;
        }

        let added = 0;
        // Usiamo sortedOperators anche per gli input per mantenere coerenza nell'ordine
        sortedOperators.forEach(operator => {
            const existingInput = document.querySelector(`input[name="valid_operators"][value="${operator.code}"]`);
            if (!existingInput) {
                const newInput = document.createElement('input');
                newInput.type = 'hidden';
                newInput.name = 'valid_operators';
                newInput.value = operator.code;
                currentReference.insertAdjacentElement('afterend', newInput);
                currentReference = newInput;
                added++;
            } else {
                currentReference = existingInput;
            }
        });

        if (added > 0 && DEBUG) console.log(`[KenaPatch] Aggiunti ${added} input hidden mancanti.`);
        return added > 0;
    }

    // --- Sezione 3: Esecuzione e Monitoraggio ---
    let lastRun = 0;
    function throttledRun() {
        const now = Date.now();
        if (now - lastRun > 500) { // massimo 2 esecuzioni al secondo
            const selectAdded = injectSelectOptions();
            const inputAdded = injectHiddenInputs();
            if (selectAdded || inputAdded) {
                if (DEBUG) console.log("[KenaPatch] Iniezione aggiornata.");
            }
            lastRun = now;
        }
    }

    function runObserver() {
        const select = document.getElementById('operator');
        const container = document.querySelector('div.col-md-8.col-xs-10');
        if (!select || !container) {
            if (DEBUG) console.log("[KenaPatch] elementi target non ancora presenti");
            return;
        }

        const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] };
        const observer = new MutationObserver(() => throttledRun());
        observer.observe(select, config);
        observer.observe(container, config);

        throttledRun(); // prima iniezione immediata
    }

    // fallback se gli elementi non sono ancora pronti
    if (document.readyState === "complete" || document.readyState === "interactive") {
        runObserver();
    } else {
        window.addEventListener("DOMContentLoaded", runObserver);
    }

    // in caso di caricamenti ajax tardivi
    setTimeout(runObserver, 1000);

})();
