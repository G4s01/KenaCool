// ==UserScript==
// @name         KenaMobile - MNO Inject
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Aggiunge tutti gli operatori mancanti al menu a tendina e agli input hidden, garantendo la persistenza su pagine dinamiche.
// @author       AI Assistant
// @match        https://www.kenamobile.it/prodotto/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Lista COMPLETA di tutti gli operatori, ordinata per nome (come nelle liste generate)
    const allOperators = [
        { code: "code_9", name: "1MOBILE" },
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
        { code: "code_10", name: "POSTEMOBILE (pre-2024)" },
        { code: "code_53", name: "SPUSU" },
        { code: "code_2", name: "TIM" },
        { code: "code_6", name: "TISCALI" },
        { code: "code_3", name: "VODAFONE" },
        { code: "code_55", name: "WINDTRE" }
    ];

    // L'operatore "seleziona" è sempre il primo e non ha un codice operatore.
    const FIRST_ELEMENT_SELECTOR = 'select#operator option[disabled="disabled"]';

// --- Sezione 1: Iniezione nel Menu a Tendina (SELECT) ---

    /**
     * Inietta o ri-inietta le opzioni mancanti nel menu a tendina.
     */
    function injectSelectOptions() {
        // Tenta di usare l'ultima opzione valida come riferimento se presente
        const initialReference = document.querySelector(FIRST_ELEMENT_SELECTOR);
        if (!initialReference) return; // Non si può procedere senza il punto di inizio

        let currentReference = initialReference;

        allOperators.forEach(operator => {
            const operatorCode = operator.code;
            const existingOption = document.querySelector(`select#operator option[value="${operatorCode}"]`);

            if (!existingOption) {
                // L'opzione è mancante: la creiamo e la iniettiamo
                const newOption = document.createElement('option');
                newOption.value = operatorCode;
                newOption.textContent = operator.name;

                // Inserisce il nuovo elemento immediatamente dopo l'attuale riferimento
                currentReference.insertAdjacentElement('afterend', newOption);

                // Il nuovo elemento diventa il riferimento per l'inserimento successivo
                currentReference = newOption;

            } else {
                // L'opzione è già presente: la usiamo come riferimento per l'operatore successivo
                currentReference = existingOption;
            }
        });
    }

// --- Sezione 2: Iniezione negli Input Hidden ---

    /**
     * Inietta o ri-inietta gli input hidden 'valid_operators' mancanti.
     */
    function injectHiddenInputs() {
        const inputContainer = document.querySelector('div.col-md-8.col-xs-10');
        if (!inputContainer) return; // Non si può procedere senza il contenitore

        // Usiamo l'ultimo input 'valid_operators' presente come punto di riferimento iniziale.
        // Se non ce ne sono, usiamo l'input 'numberToCheck'
        let currentReference = inputContainer.querySelector('input#numberToCheck');
        if (!currentReference) return;

        allOperators.forEach(operator => {
            const operatorCode = operator.code;
            // Cerchiamo l'input hidden specifico
            const existingInput = document.querySelector(`input[name="valid_operators"][value="${operatorCode}"]`);

            if (!existingInput) {
                // L'input è mancante: lo creiamo e lo iniettiamo
                const newInput = document.createElement('input');
                newInput.type = 'hidden';
                newInput.name = 'valid_operators';
                newInput.value = operatorCode;

                // Inserisce il nuovo elemento immediatamente dopo l'attuale riferimento
                currentReference.insertAdjacentElement('afterend', newInput);

                // Il nuovo elemento diventa il riferimento per l'inserimento successivo
                currentReference = newInput;
            } else {
                // L'input è già presente: lo usiamo come riferimento per l'operatore successivo
                currentReference = existingInput;
            }
        });
    }

// --- Sezione 3: Esecuzione e Monitoraggio (MutationObserver) ---

    /**
     * Esegue entrambe le iniezioni.
     */
    function runInjections() {
        injectSelectOptions();
        injectHiddenInputs();
    }

    const targetSelect = document.getElementById('operator');
    const targetInputContainer = document.querySelector('div.col-md-8.col-xs-10');

    if (targetSelect && targetInputContainer) {
        const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] };

        const callback = function(mutationsList, observer) {
            // Rieseguiamo l'iniezione ad ogni mutazione significativa per garantire la persistenza
            runInjections();
        };

        const observer = new MutationObserver(callback);

        // Osserviamo sia il menu a tendina che il contenitore degli input nascosti
        observer.observe(targetSelect, config);
        observer.observe(targetInputContainer, config);

        // Esegui la prima iniezione immediatamente
        runInjections();

    } else {
        // Fallback: se i target non sono disponibili subito, prova dopo 500ms
        setTimeout(runInjections, 500);
    }
})();
