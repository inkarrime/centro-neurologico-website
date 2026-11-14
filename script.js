
const CONFIG = {

    whatsappUrl: "https://wa.link/kxj6s8",

    mapsUrl: "https://www.google.com/maps/place/CENTRO+NEUROL%C3%93GICO+%22VIRGEN+DE+YAUCA%22+E.I.R.L/@-9.5343287,-77.5304988,21z/data=!4m6!3m5!1s0x91a90d1ec499490b:0x46e0069f871e7a57!8m2!3d-9.5342485!4d-77.5303566!16s%2Fg%2F11n80zgh2l?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",

    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d245.91906939600833!2d-77.5304988!3d-9.5343287!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91a90d1ec499490b%3A0x46e0069f871e7a57!2sCENTRO%20NEUROL%C3%93GICO%20%22VIRGEN%20DE%20YAUCA%22%20E.I.R.L!5e0!3m2!1ses!2spe!4v1794648913492!5m2!1ses!2spe\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"strict-origin-when-cross-origin",

    linkedinUrl: "https://www.linkedin.com/in/rubi%C3%B1os-casavilca-quispe-72315186/"
};

(function () {
    "use strict";

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("js");


    const links = {
        whatsapp: CONFIG.whatsappUrl,
        maps: CONFIG.mapsUrl,
        linkedin: CONFIG.linkedinUrl
    };

    $$("[data-link]").forEach((el) => {
        const url = links[el.dataset.link];
        if (url) {
            el.href = url;
        } else {

            el.removeAttribute("target");
            el.addEventListener("click", (e) => {
                e.preventDefault();
                console.warn(`Falta configurar la URL de "${el.dataset.link}" en CONFIG (script.js).`);
            });
        }
    });

    const map = $("#map");
    if (map && CONFIG.mapsEmbedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = CONFIG.mapsEmbedUrl;
        iframe.title = "Ubicación del Centro Neurológico Virgen de Yauca en Google Maps";
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.allowFullscreen = true;
        map.innerHTML = "";
        map.appendChild(iframe);
    }

    $$(".photo-arch img").forEach((img) => {
        const markMissing = () => {
            const box = img.closest(".photo-arch");
            box.classList.add("is-missing");
            box.dataset.fallback = img.dataset.fallback || "Imagen pendiente";
        };
        if (img.complete && img.naturalWidth === 0) markMissing();
        img.addEventListener("error", markMissing);
    });

    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const menu = $("#menu");
    const openBtn = $("#menuOpen");
    const closeBtn = $("#menuClose");
    let lastFocus = null;

    const focusables = () =>
        $$("a[href], button:not([disabled])", menu).filter((el) => el.offsetParent !== null);

    function openMenu() {
        lastFocus = document.activeElement;
        menu.hidden = false;

        void menu.offsetWidth;
        menu.classList.add("is-open");
        document.body.classList.add("is-locked");
        openBtn.setAttribute("aria-expanded", "true");
        closeBtn.focus();
    }

    function closeMenu({ restoreFocus = true } = {}) {
        if (!menu.classList.contains("is-open")) return;
        menu.classList.remove("is-open");
        document.body.classList.remove("is-locked");
        openBtn.setAttribute("aria-expanded", "false");
        const finish = () => { menu.hidden = true; };
        if (reduceMotion) finish();
        else setTimeout(finish, 300);
        if (restoreFocus && lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", () => closeMenu());

    // Los enlaces del menú son anclas de la misma página: cierran el menú y hacen scroll
    $$("[data-menu-link]", menu).forEach((link) => {
        link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    // El botón de WhatsApp dentro del menú también lo cierra
    $$("[data-link]", menu).forEach((link) => {
        link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    document.addEventListener("keydown", (e) => {
        if (!menu.classList.contains("is-open")) return;
        if (e.key === "Escape") {
            closeMenu();
            return;
        }
        if (e.key === "Tab") {
            // Mantener el foco dentro del menú
            const items = focusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    window.matchMedia("(min-width: 1021px)").addEventListener("change", (e) => {
        if (e.matches) closeMenu({ restoreFocus: false });
    });

    const navLinks = $$("[data-nav]");
    const sectionIds = [...new Set(navLinks.map((a) => a.getAttribute("href").slice(1)))];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    function setActive(id) {
        navLinks.forEach((a) => {
            const active = a.getAttribute("href") === `#${id}`;
            a.classList.toggle("is-active", active);
            if (active) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
        });
    }

    function updateActive() {
        if (clickLock) return;
        const line = header.offsetHeight + (window.innerHeight - header.offsetHeight) * 0.4;
        let current = sections[0];
        for (const s of sections) {
            if (s.getBoundingClientRect().top <= line) current = s;
        }
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 60) current = sections[sections.length - 1];
        if (current) setActive(current.id);
    }

    let clickLock = false;
    navLinks.forEach((a) => {
        a.addEventListener("click", () => {
            setActive(a.getAttribute("href").slice(1));
            clickLock = true;
        });
    });
    const unlock = () => { clickLock = false; };
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchmove", unlock, { passive: true });
    window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) unlock();
    });

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateActive();
            ticking = false;
        });
    }, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();

    const sticky = $("#stickyCta");
    const heroCtas = $("#heroCtas");
    const footer = $(".footer");

    if (sticky && heroCtas && "IntersectionObserver" in window) {
        let heroVisible = true;
        let footerVisible = false;
        const refresh = () => sticky.classList.toggle("is-visible", !heroVisible && !footerVisible);

        new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
            refresh();
        }).observe(heroCtas);

        new IntersectionObserver(([entry]) => {
            footerVisible = entry.isIntersecting && entry.intersectionRatio > 0.6;
            refresh();
        }, { threshold: [0, 0.6, 1] }).observe(footer);
    } else if (sticky) {
        sticky.classList.add("is-visible");
    }

    const revealEls = $$("[data-reveal]");

    revealEls.forEach((el) => {
        const siblings = Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal"));
        const index = siblings.indexOf(el);
        const cols = window.innerWidth > 640 ? 3 : 1;
        el.style.setProperty("--reveal-delay", `${(index % cols) * 0.08}s`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("is-revealed", "is-done"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("is-revealed");
                el.addEventListener("transitionend", () => el.classList.add("is-done"), { once: true });
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach((el) => io.observe(el));
    }

    /* ---------- 9. Año del footer ---------- */
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
})();

(function () {
    "use strict";

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("js");

    /* ---------- 1. Enlaces configurables ---------- */
    const links = {
        whatsapp: CONFIG.whatsappUrl,
        maps: CONFIG.mapsUrl,
        linkedin: CONFIG.linkedinUrl
    };

    $$("[data-link]").forEach((el) => {
        const url = links[el.dataset.link];
        if (url) {
            el.href = url;
        } else {
            // Sin URL configurada: el enlace no navega
            el.removeAttribute("target");
            el.addEventListener("click", (e) => {
                e.preventDefault();
                console.warn(`Falta configurar la URL de "${el.dataset.link}" en CONFIG (script.js).`);
            });
        }
    });

    const map = $("#map");
    if (map && CONFIG.mapsEmbedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = CONFIG.mapsEmbedUrl;
        iframe.title = "Ubicación del Centro Neurológico Virgen de Yauca en Google Maps";
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.allowFullscreen = true;
        map.innerHTML = "";
        map.appendChild(iframe);
    }

    $$(".photo-arch img").forEach((img) => {
        const markMissing = () => {
            const box = img.closest(".photo-arch");
            box.classList.add("is-missing");
            box.dataset.fallback = img.dataset.fallback || "Imagen pendiente";
        };
        if (img.complete && img.naturalWidth === 0) markMissing();
        img.addEventListener("error", markMissing);
    });

    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const menu = $("#menu");
    const openBtn = $("#menuOpen");
    const closeBtn = $("#menuClose");
    let lastFocus = null;

    const focusables = () =>
        $$("a[href], button:not([disabled])", menu).filter((el) => el.offsetParent !== null);

    function openMenu() {
        lastFocus = document.activeElement;
        menu.hidden = false;
        // Forzar reflow para que la transición se ejecute
        void menu.offsetWidth;
        menu.classList.add("is-open");
        document.body.classList.add("is-locked");
        openBtn.setAttribute("aria-expanded", "true");
        closeBtn.focus();
    }

    function closeMenu({ restoreFocus = true } = {}) {
        if (!menu.classList.contains("is-open")) return;
        menu.classList.remove("is-open");
        document.body.classList.remove("is-locked");
        openBtn.setAttribute("aria-expanded", "false");
        const finish = () => { menu.hidden = true; };
        if (reduceMotion) finish();
        else setTimeout(finish, 300);
        if (restoreFocus && lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", () => closeMenu());

    $$("[data-menu-link]", menu).forEach((link) => {
        link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    // El botón de WhatsApp dentro del menú también lo cierra
    $$("[data-link]", menu).forEach((link) => {
        link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    document.addEventListener("keydown", (e) => {
        if (!menu.classList.contains("is-open")) return;
        if (e.key === "Escape") {
            closeMenu();
            return;
        }
        if (e.key === "Tab") {

            const items = focusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
        if (e.matches) closeMenu({ restoreFocus: false });
    });

    const navLinks = $$("[data-nav]");
    const sectionIds = [...new Set(navLinks.map((a) => a.getAttribute("href").slice(1)))];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    function setActive(id) {
        navLinks.forEach((a) => {
            const active = a.getAttribute("href") === `#${id}`;
            a.classList.toggle("is-active", active);
            if (active) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
        });
    }

    function updateActive() {
        const line = header.offsetHeight + window.innerHeight * 0.25;
        let current = sections[0];
        for (const s of sections) {
            if (s.getBoundingClientRect().top <= line) current = s;
        }
        // Al llegar al final de la página, la última sección queda activa
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1];
        }
        if (current) setActive(current.id);
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateActive();
            ticking = false;
        });
    }, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();

    const sticky = $("#stickyCta");
    const heroCtas = $("#heroCtas");
    const footer = $(".footer");

    if (sticky && heroCtas && "IntersectionObserver" in window) {
        let heroVisible = true;
        let footerVisible = false;
        const refresh = () => sticky.classList.toggle("is-visible", !heroVisible && !footerVisible);

        new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
            refresh();
        }).observe(heroCtas);

        new IntersectionObserver(([entry]) => {
            footerVisible = entry.isIntersecting && entry.intersectionRatio > 0.6;
            refresh();
        }, { threshold: [0, 0.6, 1] }).observe(footer);
    } else if (sticky) {
        sticky.classList.add("is-visible");
    }

    const revealEls = $$("[data-reveal]");

    revealEls.forEach((el) => {
        const siblings = Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal"));
        const index = siblings.indexOf(el);
        const cols = window.innerWidth > 640 ? 3 : 1;
        el.style.setProperty("--reveal-delay", `${(index % cols) * 0.08}s`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("is-revealed", "is-done"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("is-revealed");
                el.addEventListener("transitionend", () => el.classList.add("is-done"), { once: true });
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach((el) => io.observe(el));
    }

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
})();