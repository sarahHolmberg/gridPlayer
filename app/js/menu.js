// app/js/menu.js: The ⋯ menu (top right): Help, Update, shortcuts on/off, settings, where the links come from, the key list.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- ⋯ menu: everything that is not needed all the time lives here, so the side panel only shows the current step ----
function menuToggle(on) {
  $("menu").hidden = !on;
  $("menuBtn").setAttribute("aria-expanded", on);
  console.log(`[menu] ${on ? "open" : "closed"}`);
}
$("menuBtn").onclick = (e) => { e.stopPropagation(); menuToggle($("menu").hidden); };
// A click anywhere else closes it; so do Escape and opening Help / Update from it
addEventListener("click", (e) => { if (!$("menu").hidden && !$("menu").contains(e.target)) menuToggle(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("menu").hidden) menuToggle(false); });
["helpBtn", "updBtn"].forEach((id) => $(id).addEventListener("click", () => menuToggle(false)));
