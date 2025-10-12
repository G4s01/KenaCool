<h2>Kena Mobile Operator Unlock Script</h2>
<p>>A robust UserScript (for Tampermonkey/Greasemonkey) designed to dynamically add all known Italian mobile operators to the port-in selection menu and hidden validation inputs on Kena Mobile's product pages (/prodotto/*). This script uses a MutationObserver to ensure the added operators persist, even when the page's own JavaScript attempts to overwrite the menu.</p>

<h3>Usage Options</h3>

<h4>Option 1: Tampermonkey/Greasemonkey</h4>
<p>Install <code>KenaCool.js</code> in your userscript manager (Tampermonkey or Greasemonkey). The script will automatically run on Kena Mobile product pages.</p>

<h4>Option 2: Bookmarklet</h4>
<p>Use the bookmarklet for one-time injection on Kena Mobile product pages (<code>https://www.kenamobile.it/prodotto/...</code>):</p>

<p><strong>Bookmarklet (CDN - main branch):</strong></p>
<pre><code>javascript:(()=>{const U='https://cdn.jsdelivr.net/gh/G4s01/KenaCool@main/userscripts/kena-mobile-injection.js';if(!/^https?:\/\/www\.kenamobile\.it\/prodotto\//i.test(location.href)){alert('Open a Kena product page first.');return;}const s=document.createElement('script');s.src=U+'?t='+Date.now();document.head.appendChild(s);})()
</code></pre>

<p><strong>How to use the bookmarklet:</strong></p>
<ol>
<li>Create a new bookmark in your browser</li>
<li>Copy the bookmarklet code above</li>
<li>Paste it as the URL/location of the bookmark</li>
<li>Navigate to a Kena product page (e.g., <code>https://www.kenamobile.it/prodotto/...</code>)</li>
<li>Click the bookmark</li>
<li>A toast notification will appear showing the number of operators injected</li>
</ol>

<p><strong>Notes:</strong></p>
<ul>
<li>The bookmarklet validates the domain before executing</li>
<li>Cache-busting ensures you always get the latest version</li>
<li>The script shows a brief toast notification when operators are injected</li>
<li>Re-injection occurs automatically if the DOM changes</li>
</ul>

<h3>⚠️ Warning/Disclaimer:</h3> This script only modifies your local browser experience by adjusting the HTML form data. 
<p>Its use is primarily intended for testing and personal analysis. 
Kena Mobile's port-in process is subject to their internal business rules and server-side validation. 
Use of this script to bypass official processes is entirely at the user's own risk, and the author assumes no responsibility for any consequences, errors, or service interruptions that may arise from its use. Use responsibly or, even better, do not use.</p>
