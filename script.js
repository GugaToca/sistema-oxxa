// ===== Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function toast(title, msg) {
  const el = $("#toast");
  $("#toastTitle").textContent = title;
  $("#toastMsg").textContent = msg;
  el.hidden = false;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => (el.hidden = true), 220);
  }, 2400);
}

// ===== Theme
const THEME_KEY = "kalshi_theme";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("#themeLabel").textContent = theme === "light" ? "Claro" : "Escuro";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return;
  }
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

$("#themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ===== Mobile menu
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

burger.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});

$$(".mobile__link").forEach(a => {
  a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
  });
});

// Close mobile menu on resize up
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
  }
});

// ===== Scroll progress
const fill = $("#scrollbarFill");
window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  fill.style.width = `${pct}%`;
});

// ===== Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => io.observe(el));

// ===== Market mock
const MARKET_DATA = [
  { tag: "Economia", q: "A inflação anual ficará acima de 3,0%?", p: 0.62 },
  { tag: "Esportes", q: "O Time A vence o próximo jogo?", p: 0.54 },
  { tag: "Clima", q: "Vai chover amanhã na cidade X?", p: 0.41 },
  { tag: "Política", q: "Um projeto será aprovado até o fim do mês?", p: 0.33 },
  { tag: "Tech", q: "Uma big tech lançará um produto novo este trimestre?", p: 0.48 },
  { tag: "Economia", q: "A taxa de juros cairá na próxima reunião?", p: 0.57 },
];

function renderMarkets(list) {
  const wrap = $("#markets");
  wrap.innerHTML = "";

  list.slice(0, 5).forEach((m, idx) => {
    const pct = Math.round(clamp(m.p, 0.01, 0.99) * 100);
    const el = document.createElement("div");
    el.className = "market";
    el.tabIndex = 0;
    el.role = "button";
    el.setAttribute("aria-label", `Mercado: ${m.q}`);

    el.innerHTML = `
      <div class="market__top">
        <div class="market__q">${m.q}</div>
        <div class="market__tag">${m.tag}</div>
      </div>
      <div class="market__bar" aria-hidden="true">
        <span style="width:${pct}%"></span>
      </div>
      <div class="market__actions">
        <div class="odds">${pct}% Yes • ${100 - pct}% No</div>
        <div class="pair">
          <button type="button" data-action="yes" data-idx="${idx}">Yes</button>
          <button type="button" data-action="no" data-idx="${idx}">No</button>
        </div>
      </div>
    `;

    el.addEventListener("click", () => {
      toast("Mercado", `${pct}% de probabilidade implícita (demo).`);
    });

    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        el.click();
      }
    });

    wrap.appendChild(el);
  });

  // Buttons
  $$(".pair button", wrap).forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const action = btn.dataset.action;
      toast(action.toUpperCase(), `Você clicou em ${action === "yes" ? "YES" : "NO"} (demo).`);
    });
  });
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

$("#shuffleBtn").addEventListener("click", () => {
  renderMarkets(shuffle(MARKET_DATA));
  toast("Atualizado", "Mercados misturados.");
});

// ===== Waitlist form (UI only)
$("#waitlistForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();

  if (!name || !email) {
    toast("Ops", "Preencha nome e e-mail.");
    return;
  }

  // Aqui seria onde você integraria Firebase / API etc.
  toast("Boa!", `Você entrou na lista, ${name}. (demo)`);
  ev.target.reset();
});

// ===== Year
$("#year").textContent = new Date().getFullYear();

// Init
initTheme();
renderMarkets(MARKET_DATA);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
