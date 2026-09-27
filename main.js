(() => {
  const field = document.getElementById("orbit-field");
  const spot = document.getElementById("spot");
  const arc = document.getElementById("arc");
  const rail = document.getElementById("rail");
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("menu");
  const porthole = document.getElementById("porthole");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (field && !reduce) {
    const ctx = field.getContext("2d");
    const stars = [];
    const orbs = [];
    let w = 0;
    let h = 0;
    let mx = 0.5;
    let my = 0.35;

    const resize = () => {
      w = field.width = window.innerWidth * devicePixelRatio;
      h = field.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const seed = () => {
      stars.length = 0;
      orbs.length = 0;
      const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.3 + 0.2,
          a: Math.random() * 0.55 + 0.15,
          s: Math.random() * 0.08 + 0.02
        });
      }
      for (let i = 0; i < 18; i += 1) {
        orbs.push({
          a: Math.random() * Math.PI * 2,
          r: 70 + Math.random() * 180,
          tilt: 0.35 + Math.random() * 0.45,
          spin: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          size: Math.random() * 2.2 + 0.8
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach((star) => {
        star.y -= star.s / 1000;
        if (star.y < 0) star.y = 1;
        ctx.fillStyle = `rgba(158,196,255,${star.a})`;
        ctx.beginPath();
        ctx.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const cx = window.innerWidth * (0.68 + (mx - 0.5) * 0.06);
      const cy = window.innerHeight * (0.42 + (my - 0.5) * 0.05);
      orbs.forEach((orb) => {
        orb.a += orb.spin;
        const x = cx + Math.cos(orb.a) * orb.r;
        const y = cy + Math.sin(orb.a) * orb.r * orb.tilt;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, orb.size * 6);
        glow.addColorStop(0, "rgba(155,108,255,0.55)");
        glow.addColorStop(1, "rgba(77,141,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, orb.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c5d8ff";
        ctx.beginPath();
        ctx.arc(x, y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();
    window.addEventListener("resize", () => {
      resize();
      seed();
    });
    window.addEventListener("pointermove", (event) => {
      mx = event.clientX / window.innerWidth;
      my = event.clientY / window.innerHeight;
      if (spot) {
        spot.style.setProperty("--sx", `${event.clientX}px`);
        spot.style.setProperty("--sy", `${event.clientY}px`);
      }
      if (porthole) {
        const rect = porthole.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        porthole.style.transform = `rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 8).toFixed(2)}deg)`;
      }
    });
  }

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (arc) arc.style.setProperty("--p", `${p}%`);
    if (rail) rail.classList.toggle("is-set", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        burger.classList.remove("is-open");
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".rise").forEach((node) => io.observe(node));

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const temp = document.createElement("textarea");
        temp.value = value;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      const prior = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("is-ok");
      window.setTimeout(() => {
        btn.textContent = prior;
        btn.classList.remove("is-ok");
      }, 1400);
    });
  });

  const stories = document.querySelectorAll(".story-card");
  if (stories.length && "HTMLDialogElement" in window) {
    const lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt="" /><p></p>';
    document.body.appendChild(lightbox);
    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector("p");

    stories.forEach((story) => {
      story.tabIndex = 0;
      story.setAttribute("role", "button");
      story.setAttribute("aria-label", `Open ${story.querySelector("figcaption span")?.firstChild?.textContent || "story"}`);
      const openStory = () => {
        const image = story.querySelector("img");
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = story.querySelector("figcaption span")?.firstChild?.textContent || image.alt;
        lightbox.showModal();
      };
      story.addEventListener("click", openStory);
      story.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openStory();
        }
      });
    });

    lightbox.querySelector("button").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
