// ==UserScript==
// @name         KenaMobile - MNO Injector
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Aggiunge gli operatori mancanti al menu e agli input hidden, mantiene l'ordine alfabetico e mostra il numero CORRETTO di operatori effettivamente aggiunti (non quelli già presenti). Implementa conteggio su creazioni reali e riordino non distruttivo, come nel favlet funzionante.
// @author       YourWaifu
// @match        https://www.kenamobile.it/prodotto/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG = false; // true per log dettagliati in console

  // Lista completa operatori (mantieni qui l'elenco; eventuali duplicati vengono deduplicati per code)
  const allOperators = [
    { code: "code_9",  name: "1MOBILE" },
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
    { code: "code_2",  name: "TIM" },
    { code: "code_6",  name: "TISCALI" },
    { code: "code_3",  name: "VODAFONE" },
    { code: "code_43", name: "WELCOME ITALIA" },
    { code: "code_55", name: "WINDTRE" },
    { code: "code_59", name: "WINGS MOBILE" },
    { code: "code_51", name: "WITHU MOBILE" }
  ];

  // Dedup difensivo per code (mantiene la prima occorrenza)
  const uniqueOperators = Array.from(new Map(allOperators.map(o => [o.code, o])).values());

  // Ordinamento alfabetico (locale it)
  const sortedOperators = [...uniqueOperators].sort((a, b) =>
    a.name.localeCompare(b.name, 'it', { sensitivity: 'base', numeric: true })
  );

  // --- Toast ---
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

  // --- Select: riordino non distruttivo + conteggio reale ---
  function injectSelectOptions() {
    const select = document.querySelector('select#operator');
    if (!select) {
      if (DEBUG) console.log("[KenaPatch] select#operator non trovato");
      return { added: 0 };
    }

    const first = select.querySelector('option[disabled]') || select.options[0] || null;
    if (!first) {
      if (DEBUG) console.log("[KenaPatch] option di riferimento non trovata");
      return { added: 0 };
    }

    const ourCodes = new Set(uniqueOperators.map(o => o.code));
    // Mappa delle nostre option già presenti
    const ourMap = new Map();
    Array.from(select.options).forEach(o => {
      if (o.disabled) return;
      if (ourCodes.has(o.value) && !ourMap.has(o.value)) {
        ourMap.set(o.value, o);
      }
    });

    const selectedValue = select.value; // preserva la selezione

    let ref = first;
    let added = 0;
    sortedOperators.forEach(op => {
      const ex = ourMap.get(op.code);
      if (ex) {
        // Sposta nella posizione corretta
        ref.insertAdjacentElement('afterend', ex);
        ref = ex;
      } else {
        // Crea nuovo solo se mancante
        const no = document.createElement('option');
        no.value = op.code;
        no.textContent = op.name;
        ref.insertAdjacentElement('afterend', no);
        ref = no;
        added++;
      }
    });

    // Ripristina selezione se ancora presente
    if (selectedValue && select.querySelector(`option[value="${selectedValue}"]`)) {
      select.value = selectedValue;
    }

    if (DEBUG) console.log(`[KenaPatch] Select: aggiunti ${added}`);
    return { added };
  }

  // --- Hidden inputs: crea solo i mancanti + conteggio reale ---
  function injectHiddenInputs() {
    const container = document.querySelector('div.col-md-8.col-xs-10');
    if (!container) {
      if (DEBUG) console.log("[KenaPatch] input container non trovato");
      return { added: 0 };
    }

    let ref = container.querySelector('input#numberToCheck');
    if (!ref) {
      if (DEBUG) console.log("[KenaPatch] input#numberToCheck non trovato");
      return { added: 0 };
    }

    const existingSet = new Set(
      Array.from(container.querySelectorAll('input[name="valid_operators"]')).map(i => i.value)
    );

    let added = 0;
    sortedOperators.forEach(op => {
      if (existingSet.has(op.code)) {
        const existing = container.querySelector(`input[name="valid_operators"][value="${op.code}"]`);
        if (existing) ref = existing;
      } else {
        const ni = document.createElement('input');
        ni.type = 'hidden';
        ni.name = 'valid_operators';
        ni.value = op.code;
        ref.insertAdjacentElement('afterend', ni);
        ref = ni;
        existingSet.add(op.code);
        added++;
      }
    });

    if (DEBUG) console.log(`[KenaPatch] Inputs: aggiunti ${added}`);
    return { added };
  }

  // --- Esecuzione e monitoraggio ---
  let lastRun = 0;
  function throttledRun() {
    const now = Date.now();
    if (now - lastRun <= 500) return; // max 2/sec

    const sel = injectSelectOptions(); // { added }
    const inp = injectHiddenInputs();  // { added }

    // Mostra un solo numero (come richiesto). In genere coincidono: privilegia il select.
    const count = sel.added > 0 ? sel.added : inp.added;
    if (count > 0) {
      showToast(`✅ ${count} OPERATORI AGGIUNTI`, "success");
    }

    if (DEBUG) console.log("[KenaPatch] Run:", { selectAdded: sel.added, inputsAdded: inp.added });
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

    throttledRun(); // prima esecuzione
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    runObserver();
  } else {
    window.addEventListener("DOMContentLoaded", runObserver);
  }

  setTimeout(runObserver, 1000); // fallback per caricamenti ajax tardivi
})();
