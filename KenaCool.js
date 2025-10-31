// ==UserScript==
// @name         KenaMobile - Iniezione Operatori Definitiva (Ottimizzata)
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Aggiunge gli operatori mancanti al menu e agli input hidden, mantiene l'ordine alfabetico e mostra il numero CORRETTO di operatori effettivamente aggiunti (non quelli già presenti).
// @author       AI Assistant
// @match        https://www.kenamobile.it/prodotto/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG = false; // true per log dettagliati in console

  // Lista completa operatori
  const allOperators = [
      { code: "code_9", name: "1MOBILE" },
      { code: "code_9", name: "1MOBILE" },
      { code: "code_64", name: "2APPY" },
      { code: "code_58", name: "CHINA MOBILE" },
      { code: "code_52", name: "COOP VOCE" },
      { code: "code_12", name: "DAILY TELECOM" },
      { code: "code_36", name: "DIGI MOBIL" },
      { code: "code_62", name: "ELITE MOBILE" },
      { code: "code_54", name: "ENEGAN MOBILE" },
      { code: "code_42", name: "FASTWEB" },
      { code: "code_61", name: "FEDER MOBILE" },
      { code: "code_24", name: "GREEN" },
      { code: "code_45", name: "HO MOBILE" },
      { code: "code_46", name: "ILIAD" },
      { code: "code_32", name: "INTERMATICA" },
      { code: "code_63", name: "ITALIA POWER" },
      { code: "code_27", name: "LYCA MOBILE" },
      { code: "code_25", name: "NETVALUE" },
      { code: "code_49", name: "NOITEL" },
      { code: "code_18", name: "NOVERCA" },
      { code: "code_50", name: "NTMOBILE" },
      { code: "code_44", name: "OPTIMA" },
      { code: "code_60", name: "OVUNQUE" },
      { code: "code_47", name: "PLINTRON" },
      { code: "code_10", name: "POSTEMOBILE (pre2014)" },
      { code: "code_30", name: "POSTEMOBILE FULL" },
      { code: "code_57", name: "PROFESSIONAL LINK" },
      { code: "code_48", name: "RABONA MOBILE" },
      { code: "code_53", name: "SPUSU" },
      { code: "code_56", name: "TELMEKOM" },
      { code: "code_2", name: "TIM" },
      { code: "code_6", name: "TISCALI" },
      { code: "code_3", name: "VODAFONE" },
      { code: "code_43", name: "WELCOME ITALIA" },
      { code: "code_55", name: "WINDTRE" },
      { code: "code_59", name: "WINGS MOBILE" },
      { code: "code_51", name: "WITHU MOBILE" }
  ];

  // Copia ordinata alfabeticamente (locale it)
  const sortedOperators = [...allOperators].sort((a, b) =>
    a.name.localeCompare(b.name, 'it', { sensitivity: 'base', numeric: true })
  );

  // --- Notifica in stile Kena ---
  function showToast(message, type = "success") {
    const old = document.getElementById("kena-toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "kena-toast";
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: type === "success" ? "#FFD200" : "#555",
      color: type === "success" ? "#000" : "#fff",
      fontFamily: "Arial, sans-serif",
      fontWeight: "600",
      fontSize: "14px",
      padding: "12px 18px",
      borderRadius: "8px",
      boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
      zIndex: "99999",
      opacity: "0",
      transition: "opacity 0.3s ease"
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => { try { toast.remove(); } catch (e) {} }, 400);
    }, 3000);
  }

  // --- Sezione 1: Iniezione nel Menu a Tendina (ordinamento robusto + conteggio corretto) ---
  // Restituisce { created: number }
  function injectSelectOptions() {
    const select = document.querySelector('select#operator');
    if (!select) {
      if (DEBUG) console.log("[KenaPatch] select#operator non trovato");
      return { created: 0 };
    }

    // Riferimento robusto: option[disabled] se presente, altrimenti la prima option
    const initialReference =
      select.querySelector('option[disabled]') || select.options[0] || null;

    if (!initialReference) {
      if (DEBUG) console.log("[KenaPatch] option di riferimento non trovata");
      return { created: 0 };
    }

    // Fotografa gli operatori nostri già presenti PRIMA della ricostruzione
    const ourCodes = new Set(allOperators.map(o => o.code));
    const preExistingOurSet = new Set(
      Array.from(select.options)
        .filter(o => !o.disabled && ourCodes.has(o.value))
        .map(o => o.value)
    );

    // Rimuovi tutte le nostre option preesistenti (lascia "Seleziona" e altri non nostri)
    Array.from(select.querySelectorAll('option')).forEach(opt => {
      if (opt.disabled) return;
      if (ourCodes.has(opt.value)) opt.remove();
    });

    // Reinserisci tutte le nostre option ordinate in blocco subito dopo la reference
    let ref = initialReference;
    sortedOperators.forEach(op => {
      const exists = select.querySelector(`option[value="${op.code}"]`);
      if (!exists) {
        const no = document.createElement('option');
        no.value = op.code;
        no.textContent = op.name;
        ref.insertAdjacentElement('afterend', no);
        ref = no;
      } else {
        // In casi limite in cui l'opzione sia stata appena (ri)creata dalla pagina
        ref = exists;
      }
    });

    // Conteggio CORRETTO: quanti non erano presenti prima
    const created = sortedOperators.reduce(
      (sum, op) => sum + (preExistingOurSet.has(op.code) ? 0 : 1),
      0
    );

    if (DEBUG) {
      console.log(
        `[KenaPatch] Select ricostruita. Pre-esistenti: ${preExistingOurSet.size}, creati: ${created}`
      );
    }
    return { created };
  }

  // --- Sezione 2: Iniezione negli Input Hidden (conteggio corretto) ---
  // Restituisce { created: number }
  function injectHiddenInputs() {
    const container = document.querySelector('div.col-md-8.col-xs-10');
    if (!container) {
      if (DEBUG) console.log("[KenaPatch] input container non trovato");
      return { created: 0 };
    }

    let ref = container.querySelector('input#numberToCheck');
    if (!ref) {
      if (DEBUG) console.log("[KenaPatch] input#numberToCheck non trovato");
      return { created: 0 };
    }

    // Fotografa gli input esistenti PRIMA, limitando la ricerca al container
    const preExistingSet = new Set(
      Array.from(container.querySelectorAll('input[name="valid_operators"]'))
        .map(i => i.value)
    );

    let created = 0;
    sortedOperators.forEach(op => {
      if (!preExistingSet.has(op.code)) {
        const ni = document.createElement('input');
        ni.type = 'hidden';
        ni.name = 'valid_operators';
        ni.value = op.code;
        ref.insertAdjacentElement('afterend', ni);
        ref = ni;
        created++;
        preExistingSet.add(op.code);
      } else {
        const existing = container.querySelector(`input[name="valid_operators"][value="${op.code}"]`);
        if (existing) ref = existing;
      }
    });

    if (DEBUG) console.log(`[KenaPatch] Inputs creati: ${created}`);
    return { created };
  }

  // --- Sezione 3: Esecuzione e Monitoraggio ---
  let lastRun = 0;
  function throttledRun() {
    const now = Date.now();
    if (now - lastRun <= 500) return; // max 2/sec

    const sel = injectSelectOptions(); // { created }
    const inp = injectHiddenInputs();  // { created }

    // Mostra SOLO il numero di operatori effettivamente aggiunti (come da richiesta).
    // In condizioni normali sel.created === inp.created; in caso di divergenza mostriamo quello del select.
    const createdToShow = sel.created > 0 ? sel.created : inp.created;
    if (createdToShow > 0) {
      showToast(`${createdToShow} OPERATORI AGGIUNTI`, "success");
    }

    if (DEBUG) console.log("[KenaPatch] Run:", { selectCreated: sel.created, inputsCreated: inp.created });
    lastRun = now;
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

  if (document.readyState === "complete" || document.readyState === "interactive") {
    runObserver();
  } else {
    window.addEventListener("DOMContentLoaded", runObserver);
  }

  // Fallback per caricamenti ajax tardivi
  setTimeout(runObserver, 1000);

})();
