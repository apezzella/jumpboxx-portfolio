// Theme (light/dark with persistence)
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  const setMode = (dark) => {
    root.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };
  // Initialize
  const isDark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  setMode(isDark);
  btn?.addEventListener('click', () => setMode(!root.classList.contains('dark')));
})();





// Scroll-shrink header
(function(){
  const header = document.querySelector('.header');
  let last = 0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if (y > 40 && !header.classList.contains('shrink')) {
      header.classList.add('shrink');
    } else if (y <= 40 && header.classList.contains('shrink')) {
      header.classList.remove('shrink');
    }
    last = y;
  });
})();


/* ======================================
   NAV ACTIVE LINKS — MIDDLE-OF-VIEWPORT SCROLL SPY
   ====================================== */
(function () {
  const headerOffset = 80; // keep in sync with your smooth-scroll offset
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  // Map section id -> link element for fast lookup
  const linkById = new Map(
    links.map((a) => [a.getAttribute('href').slice(1), a])
  );

  // Helper: set active by id
  function setActive(id) {
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  }

  // Click handler: instant highlight + smooth scroll
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();

      // Immediate visual feedback
      setActive(id);

      // Smooth scroll to section (with header offset)
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    });
  });

  // Scroll spy: pick the section that contains the viewport midpoint
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const midY = window.scrollY + window.innerHeight / 4; // Scroll to viewport 2=middle

      // Find the first section whose [top, bottom) contains midY
      let currentId = null;
      for (const sec of sections) {
        const top = sec.offsetTop - headerOffset;
        const bottom = top + sec.offsetHeight;
        if (midY >= top && midY < bottom) {
          currentId = sec.id;
          break;
        }
      }
      if (currentId) setActive(currentId);
      ticking = false;
    });
  }

  // Init + listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  // If there’s a hash on load, ensure correct active
  if (location.hash) {
    const id = location.hash.slice(1);
    if (linkById.has(id)) setActive(id);
  }
})();








// Reveal on scroll
(function(){
  const obs = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();

// Clients marquee (pause on hover handled in CSS)
// Seamless marquee duplication for Clients section
(function(){
  const marquee = document.querySelector('.marquee-track');
  if (!marquee) return;
  // clone its children once for a seamless loop
  marquee.innerHTML += marquee.innerHTML;
})();


// Skills toggle
(function(){
  document.querySelectorAll('.skills .item').forEach(item=>{
    item.addEventListener('click', ()=>{
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.skills .item').forEach(i=>i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
})();




// Skills toggle with fade-out short text and full collapse
(function(){
  const cards = document.querySelectorAll('.skill-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const isActive = card.classList.contains('active');

      // Reset all
      cards.forEach(c => c.classList.remove('active', 'hiding-short', 'hidden-short'));
      cards.forEach(c => {
        const short = c.querySelector('.skill-short');
        if (short) short.style.display = '';
      });

      if (!isActive) {
        card.classList.add('hiding-short');
        const short = card.querySelector('.skill-short');

        // Fade short, then hide and expand desc
        setTimeout(() => {
          card.classList.add('hidden-short');
          if (short) short.style.display = 'none';
          card.classList.add('active');
        }, 220); // small overlap creates smoother sequence
      }
    });
  });
})();






// ===============================
// MOBILE NAVIGATION TOGGLE
// ===============================
// Mobile drawer (sticky menu)
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (!menuToggle || !mobileNav) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  // Optional: close menu when a link is clicked
  mobileNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });
});




// Fade-in hero on load
window.addEventListener('load', ()=>{
  document.body.classList.add('loaded');
});


// Seamless marquee duplication + dynamic width animation
window.addEventListener('load', () => {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  // 1️⃣ Duplicate its children once
  if (!track.dataset.duplicated) {
    track.innerHTML += track.innerHTML;
    track.dataset.duplicated = "true";
  }

  // 2️⃣ Calculate total width after images load
  const imgs = track.querySelectorAll('img');
  let loaded = 0;
  imgs.forEach(img => {
    if (img.complete) loaded++;
    else img.addEventListener('load', () => { loaded++; if (loaded === imgs.length) setAnimation(); });
  });
  if (loaded === imgs.length) setAnimation();

  function setAnimation() {
    const totalWidth = track.scrollWidth / 2; // width of one set
    track.style.setProperty('--scroll-width', `${totalWidth}px`);
    track.style.animation = 'marqueeAnim var(--marquee-speed, 50s) linear infinite';
  }
});








/* ======================================
   OVERLAY CONTROL — GUARANTEED STABLE VERSION
   ====================================== */

let scrollY = 0;

function toggleOverlay(id, show) {
  const overlay = document.getElementById(id);

  // ✅ Safety guard: handle missing or mis-typed overlay IDs
  if (!overlay) {
    console.warn(`toggleOverlay(): No overlay found with ID "${id}"`);
    document.body.classList.remove("overlay-open");
    const lock = document.querySelector(".overlay-lock");
    if (lock) lock.remove();
    return;
  }

  if (show) {
    // Save scroll position
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;

    // Add scroll lock overlay if not present
    if (!document.querySelector(".overlay-lock")) {
      const lock = document.createElement("div");
      lock.className = "overlay-lock";
      document.body.appendChild(lock);
    }

    // Apply overlay-open state
    document.body.classList.add("overlay-open");

    // Trigger fade-in
    overlay.classList.add("active");
  } else {
    // Begin fade-out
    overlay.classList.remove("active");
    document.body.classList.remove("overlay-open");

    // Finish cleanup after fade duration
    const y = parseInt(document.body.dataset.scrollY || "0", 10);
    setTimeout(() => {
      const lock = document.querySelector(".overlay-lock");
      if (lock) lock.remove();

      // Restore scrolling
      document.documentElement.style.overflow = "";
      delete document.body.dataset.scrollY;
      window.scrollTo({ top: y, behavior: "auto" });
    }, 450); // match CSS transition time
  }
}



/* ======================================
   ESC KEY CLOSE — FORCED REPAINT FIX
   ====================================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    const active = document.querySelector(".modal-backdrop.active");
    if (active) {
      // Remove overlay and blur immediately
      active.classList.remove("active");
      document.body.classList.remove("overlay-open");

      // Force a repaint to flush the compositor layer
      void document.body.offsetHeight; // triggers reflow
      document.documentElement.style.willChange = "transform";
      requestAnimationFrame(() => {
        document.documentElement.style.willChange = "auto";
      });

      // Ensure full cleanup after transition
      setTimeout(() => {
        const lock = document.querySelector(".overlay-lock");
        if (lock) lock.remove();
        document.body.style.overflow = "";
      }, 500);
    }
  }
});






/* Close overlay on backdrop click (no scroll jump) */
document.addEventListener("click", (e) => {
  const backdrop = e.target.closest(".modal-backdrop.active");
  if (backdrop && e.target === backdrop) {
    const id = backdrop.id;
    toggleOverlay(id, false);
  }
});

/* Prevent scroll bleed when user scrolls outside overlay */
["wheel", "touchmove"].forEach(evt => {
  document.addEventListener(
    evt,
    (e) => {
      const overlay = document.querySelector(".modal-backdrop.active");
      if (!overlay) return;
      if (!overlay.contains(e.target)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
});




/* ======================================
   CLIENTS SPOTLIGHT (Option C)
   ====================================== */
function initClientSpotlight() {
  const container = document.querySelector(".clients-spotlight");
  if (!container) return;
  const logos = container.querySelectorAll("img");
  let current = 0;
  setInterval(() => {
    logos.forEach((l, i) => l.classList.toggle("active", i === current));
    current = (current + 1) % logos.length;
  }, 2500);
}
document.addEventListener("DOMContentLoaded", initClientSpotlight);




const revealEls = document.querySelectorAll('.scroll-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
});
revealEls.forEach(el => observer.observe(el));






/* Auto update year in footer */
document.getElementById("year").textContent = new Date().getFullYear();
