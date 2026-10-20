(function () {
  var C = window.SAMYARA || {};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

  var SERVICES = [
    { n: "Standard Cleaning", d: "General cleaning and upkeep to keep your home fresh, tidy and comfortable.", i: "kitchen-stainless.jpg", a: "Clean kitchen with stainless steel appliances and polished wood floors" },
    { n: "Deep Cleaning", d: "A more detailed clean of every area of your home, from baseboards to appliances.", i: "kitchen-wood.jpg", a: "Spotless kitchen with shining hardwood floor and clean countertops" },
    { n: "Move-In / Move-Out Cleaning", d: "Get a property ready for new residents or ready to hand back the keys.", i: "living-room.jpg", a: "Empty living room with freshly vacuumed carpet and a fireplace" },
    { n: "Apartment Cleaning", d: "Careful cleaning for apartments, kitchens and bathrooms included.", i: "bathroom-tub.jpg", a: "Clean apartment bathroom with tub, vanity and mirror" },
    { n: "Customized Cleaning", d: "Tell us what you need and we will shape the cleaning around your space.", i: "room-deck.jpg", a: "Bright room with fresh carpet and sliding doors to a deck" }
  ];

  // Footer (all pages)
  if ($("fservices")) $("fservices").innerHTML = SERVICES.map(function (s) { return "<li>" + esc(s.n) + "</li>"; }).join("");
  if ($("yr")) $("yr").textContent = new Date().getFullYear();
  if ($("fcontact")) {
    var extra = "";
    if (C.phone) extra += '<li><a href="tel:' + esc(C.phone) + '">' + esc(C.phone) + "</a></li>";
    if (C.email) extra += '<li><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a></li>";
    if (C.address) extra += "<li>" + esc(C.address) + "</li>";
    if (C.hours) extra += "<li>" + esc(C.hours) + "</li>";
    if (C.serviceArea) extra += "<li>Serving " + esc(C.serviceArea) + "</li>";
    $("fcontact").insertAdjacentHTML("afterbegin", extra);
  }

  // Mobile menu
  var menu = $("menu"), nav = $("nav");
  if (menu) {
    menu.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", o);
      menu.textContent = o ? "✕" : "☰";
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); menu.textContent = "☰"; } });
  }

  var hdr = document.querySelector("header");
  var onScroll = function () { hdr.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  if (!$("cards")) return; // rest is home page only

  var SPARK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.8 6.2 5.8 11.2 12 12-6.2.8-11.2 5.8-12 12-.8-6.2-5.8-11.2-12-12C6.2 11.2 11.2 6.2 12 0z"/></svg>';

  $("cards").innerHTML = SERVICES.map(function (s) {
    return '<article class="card reveal"><div class="ph"><img src="images/' + s.i + '" alt="' + esc(s.a) + '" loading="lazy"><span class="badge" aria-hidden="true">' + SPARK + '</span></div><div class="b"><h3>' + esc(s.n) + "</h3><p>" + esc(s.d) +
      '</p><span class="q">Request a Quote</span><a class="sel" href="#request" data-s="' + esc(s.n) + '">Request This Service →</a></div></article>';
  }).join("");
  $("service").insertAdjacentHTML("beforeend", SERVICES.map(function (s) { return "<option>" + esc(s.n) + "</option>"; }).join(""));
  document.querySelectorAll("a.sel").forEach(function (a) { a.addEventListener("click", function () { $("service").value = a.dataset.s; }); });

  function iso(o) { var d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  $("preferredDate").min = iso(1);
  var started = Date.now();

  // Soap bubbles (3D) in decorated sections
  document.querySelectorAll("[data-bubbles]").forEach(function (sec) {
    var n = +sec.dataset.bubbles || 6;
    for (var k = 0; k < n; k++) {
      var b = document.createElement("span"), size = 28 + Math.random() * 84;
      b.className = "bubble"; b.setAttribute("aria-hidden", "true");
      b.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (Math.random() * 94) + "%;top:" + (Math.random() * 88) + "%;--dur:" + (7 + Math.random() * 7) + "s;animation-delay:-" + (Math.random() * 8) + "s;opacity:" + (0.75 + Math.random() * 0.25);
      sec.insertBefore(b, sec.firstChild);
    }
  });

  // Reveal on scroll
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });
  function phoneOk(p) { var d = p.replace(/\D/g, ""); if (d.length === 11 && d[0] === "1") d = d.slice(1); return /^[2-9]\d{2}[2-9]\d{6}$/.test(d); }
  var F = ["fullName", "phone", "service", "address", "preferredDate"];
  function validate(v) {
    var e = {};
    if (v.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
    if (!phoneOk(v.phone)) e.phone = "Please enter a valid 10-digit US phone number.";
    if (!v.service) e.service = "Please choose a service.";
    if (v.address.trim().length < 8) e.address = "Please enter the full property address.";
    if (!v.preferredDate) e.preferredDate = "Please choose a preferred date.";
    else if (v.preferredDate < iso(0)) e.preferredDate = "Please choose today or a future date.";
    return e;
  }

  $("form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    $("form-e").textContent = "";
    var v = {};
    ["fullName", "phone", "service", "address", "preferredDate", "details"].forEach(function (k) { v[k] = $(k).value; });
    var e = validate(v);
    F.forEach(function (k) { $(k + "-e").textContent = e[k] || ""; $(k).setAttribute("aria-invalid", e[k] ? "true" : "false"); });
    var first = F.filter(function (k) { return e[k]; })[0];
    if (first) { $(first).focus(); return; }
    var num = (C.SMS_NUMBER || "").replace(/[^\d+]/g, "");
    if (!num) { $("form-e").textContent = "Messaging is not available yet. Please check back soon."; return; }

    var msg = [
      "Hi! I'd like to request a cleaning from Samyara Clean LLC.",
      "Name: " + v.fullName.trim(),
      "Phone: " + v.phone.trim(),
      "Service: " + v.service,
      "Address: " + v.address.trim(),
      "Preferred date: " + v.preferredDate
    ];
    if (v.details.trim()) msg.push("Details: " + v.details.trim());
    msg = msg.join("\n");
    // "?&body=" works on both iPhone (Messages) and Android.
    var link = "sms:" + num + "?&body=" + encodeURIComponent(msg);
    $("smsLink").href = link;
    $("smsText").textContent = msg;
    $("smsNum").textContent = C.SMS_NUMBER;
    $("form").hidden = true; $("done").hidden = false;
    $("done").scrollIntoView({ block: "center" });
    window.location.href = link; // opens the Messages app on phones
  });
  $("copy").addEventListener("click", function () {
    var t = $("smsText").textContent, btn = $("copy");
    var ok = function () { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy message"; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, function () {});
  });
  $("again").addEventListener("click", function () { $("done").hidden = true; $("form").hidden = false; $("form").reset(); });
})();
