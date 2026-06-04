(() => {
  const originalRoute = route;
  let revealObserver = null;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const contentEl = document.querySelector(".content");
      if (contentEl) contentEl.scrollTop = 0;
    });
  }, { once: true });

  function initEditorialMotion() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    }

    document.querySelectorAll("[data-reveal]").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 70}ms`);
      node.classList.remove("is-visible");
      revealObserver.observe(node);
    });
  }

  route = function enhancedRoute() {
    const output = originalRoute();
    window.requestAnimationFrame(initEditorialMotion);
    return output;
  };

  function renderLandingHubHomeMarkup() {
    return `
      <div class="landing-hub">
        <section class="section section--hero landing-hub__hero" aria-label="Welcome" data-reveal>
          <div class="landing-hub__eyebrow">SGCNR Player Hub</div>
          <h1 class="landing-hub__title">Server info, rules, and city tools.</h1>
          <p class="landing-hub__text">Use this page before you log in: Discord rules, in-game notes, the map, live status, and support links in one place.</p>
          <div class="landing-hub__actions">
            <a class="auth__btn auth__btn--primary" href="/start">Enter Start</a>
            <a class="auth__btn" href="${escapeHtml(DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Join Discord</a>
          </div>
        </section>

        <section class="landing-hub__grid" aria-label="Portal shortcuts">
          <a class="landing-hub__card" href="/rules" data-reveal>
            <span class="landing-hub__cardLabel">Rules</span>
            <strong class="landing-hub__cardTitle">Discord and in-game rules</strong>
            <span class="landing-hub__cardText">Check the community rules before you open tickets, join voice, or start playing.</span>
          </a>
          <a class="landing-hub__card" href="/map" data-reveal>
            <span class="landing-hub__cardLabel">Map</span>
            <strong class="landing-hub__cardTitle">Map and service points</strong>
            <span class="landing-hub__cardText">Keep the city map close for locations, routes, and useful server spots.</span>
          </a>
          <a class="landing-hub__card" href="/live" data-reveal>
            <span class="landing-hub__cardLabel">Live</span>
            <strong class="landing-hub__cardTitle">Server and Discord status</strong>
            <span class="landing-hub__cardText">Check what is online before you spend time trying to connect.</span>
          </a>
        </section>
      </div>
    `;
  }

  renderStart = function renderStartEnhanced() {
    const quickLinks = [
      { label: "Rules", detail: "Learn the basics before you join.", href: "/rules" },
      { label: "Map", detail: "Keep the city layout nearby.", href: "/map" },
      { label: "Live", detail: "Check the server and bot state fast.", href: "/live" }
    ];

    setView(`
      <div>
        ${renderHeader("Start Here", [{ label: "Start" }], { showBadge: false })}
        <section class="section section--hero start-clean" data-reveal>
          <div class="section__eyebrow">New player entry</div>
          <h2>Get into the city without missing the basics.</h2>
          <p class="doc-p">This page is your fast lane: find the server, lock in the rules, and keep the right links ready before you start moving.</p>
          <div class="start-clean__flow">
            <article class="start-clean__step" data-reveal>
              <span class="start-clean__stepIndex">01</span>
              <div class="start-clean__stepCopy">
                <strong>Find SGCNR in FiveM</strong>
                <span>Search for the server in FiveM and join from there.</span>
              </div>
            </article>
            <article class="start-clean__step" data-reveal>
              <span class="start-clean__stepIndex">02</span>
              <div class="start-clean__stepCopy">
                <strong>Read the rules first</strong>
                <span>Use the Rules page before you jump into active situations in the city.</span>
              </div>
            </article>
            <article class="start-clean__step" data-reveal>
              <span class="start-clean__stepIndex">03</span>
              <div class="start-clean__stepCopy">
                <strong>Use Discord for support</strong>
                <span>Tickets, ban history, and staff help stay in Discord so everything is tracked properly.</span>
              </div>
            </article>
          </div>
        </section>

        <section class="start-clean__links" aria-label="Start shortcuts">
          ${quickLinks.map((item) => `
            <a class="start-clean__linkCard" href="${escapeHtml(item.href)}" data-reveal>
              <span class="start-clean__linkLabel">${escapeHtml(item.label)}</span>
              <strong class="start-clean__linkTitle">${escapeHtml(item.detail)}</strong>
            </a>
          `).join("")}
        </section>
      </div>
    `);
  };

  function getWikiSectionAnchor(index) {
    return `wiki-reboot-section-${index + 1}`;
  }

  function renderWikiRebootLibrary(categories, pages, currentSlug, updatedAt) {
    const totalPages = Object.keys(pages).length;
    const groups = categories.map((category) => {
      const entries = (category.pages || []).map((slug, index) => {
        const page = pages[slug];
        if (!page) return "";
        const isActive = slug === currentSlug ? " is-active" : "";
        const label = page.navLabel || page.title;
        return `
          <a class="wiki-reboot__libraryItem${isActive}" href="#/wiki/${escapeHtml(slug)}">
            <span class="wiki-reboot__libraryIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
            <span class="wiki-reboot__libraryLabel">${escapeHtml(label)}</span>
          </a>
        `;
      }).join("");

      return `
        <section class="wiki-reboot__libraryGroup">
          <div class="wiki-reboot__libraryHead">
            <span>${escapeHtml(category.title)}</span>
            <span class="wiki-reboot__libraryCount">${escapeHtml(String((category.pages || []).length))}</span>
          </div>
          <div class="wiki-reboot__libraryList">${entries}</div>
        </section>
      `;
    }).join("");

    return `
      <aside class="section section--stack wiki-reboot__rail">
        <div class="wiki-reboot__railIntro">
          <div class="section__eyebrow">Guide library</div>
          <h2>Wiki index</h2>
          <p class="doc-p">Move through systems, roles, and procedures from one cleaner library view.</p>
        </div>
        <div class="wiki-reboot__railStats">
          <article class="wiki-reboot__railStat">
            <span>Pages</span>
            <strong>${escapeHtml(String(totalPages))}</strong>
          </article>
          <article class="wiki-reboot__railStat">
            <span>Groups</span>
            <strong>${escapeHtml(String(categories.length))}</strong>
          </article>
          <article class="wiki-reboot__railStat">
            <span>Updated</span>
            <strong>${escapeHtml(updatedAt || "2026-04-01")}</strong>
          </article>
        </div>
        <div class="wiki-reboot__library">
          ${groups}
        </div>
      </aside>
    `;
  }

  function renderWikiRebootHero(page, category, updatedAt, currentIndex, totalPages) {
    const overview = Array.isArray(page?.overviewCards) ? page.overviewCards.slice(0, 3) : [];
    const chips = [
      category?.title || "Wiki",
      `Page ${currentIndex + 1} of ${totalPages}`,
      `Updated ${updatedAt || "2026-04-01"}`
    ];

    return `
      <section class="section section--hero wiki-reboot__hero">
        <div class="wiki-reboot__heroBody">
          <div class="wiki-reboot__heroIntro">
            <div class="section__eyebrow">${escapeHtml(page.eyebrow || "Wiki entry")}</div>
            <h2>${escapeHtml(page.title)}</h2>
            <p class="doc-p">${escapeHtml(page.summary || "")}</p>
            <div class="wiki-reboot__heroTags">
              ${chips.map((chip) => `<span class="wiki-reboot__heroTag">${escapeHtml(chip)}</span>`).join("")}
            </div>
          </div>
          <div class="wiki-reboot__heroPanels">
            ${(overview.length ? overview : [
              { title: "Scope", text: "This guide is structured for fast reading and section-by-section jumping." },
              { title: "Use", text: "Keep this page open while you handle the matching in-game or staff task." },
              { title: "Flow", text: "Read the summary first, then jump directly into the section you need." }
            ]).map((card) => `
              <article class="wiki-reboot__heroCard">
                <div class="wiki-reboot__heroCardTitle">${escapeHtml(card.title || "Guide note")}</div>
                <div class="wiki-reboot__heroCardText">${escapeHtml(card.text || "")}</div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderWikiRebootFacts(page) {
    const facts = Array.isArray(page?.facts) ? page.facts : [];
    if (!facts.length) return "";

    return `
      <section class="wiki-reboot__factStrip">
        ${facts.map(([label, value]) => `
          <article class="wiki-reboot__factTile">
            <span class="wiki-reboot__factLabel">${escapeHtml(label)}</span>
            <strong class="wiki-reboot__factValue">${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderWikiRebootJumpList(sections) {
    const items = Array.isArray(sections) ? sections : [];
    if (!items.length) return "";

    return `
      <section class="section section--stack wiki-reboot__jumpCard">
        <div class="section__eyebrow">On this page</div>
        <h2>Section jump</h2>
        <div class="wiki-reboot__jumpList">
          ${items.map((section, index) => `
            <button class="wiki-reboot__jumpBtn" type="button" data-wiki-jump="${escapeHtml(getWikiSectionAnchor(index))}">
              <span class="wiki-reboot__jumpIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
              <span class="wiki-reboot__jumpLabel">${escapeHtml(section.title || `Section ${index + 1}`)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiRebootSections(sections) {
    const entries = Array.isArray(sections) ? sections : [];
    return entries.map((section, index) => {
      const paragraphs = (section.paragraphs || []).map((paragraph) => `<p class="doc-p">${escapeHtml(paragraph)}</p>`).join("");
      const bullets = Array.isArray(section.bullets) && section.bullets.length
        ? `
          <ul class="wiki-reboot__bulletList">
            ${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        `
        : "";

      return `
        <section class="wiki-reboot__sectionCard" id="${escapeHtml(getWikiSectionAnchor(index))}">
          <div class="wiki-reboot__sectionIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</div>
          <div class="wiki-reboot__sectionBody">
            <h3 class="wiki-reboot__sectionTitle">${escapeHtml(section.title)}</h3>
            ${paragraphs}
            ${bullets}
          </div>
        </section>
      `;
    }).join("");
  }

  function renderWikiRebootUpdates(items) {
    const entries = Array.isArray(items) ? items : [];
    if (!entries.length) return "";

    return `
      <section class="section section--stack wiki-reboot__updates">
        <div class="section__eyebrow">Current direction</div>
        <h2>Important notes</h2>
        <div class="wiki-reboot__updateList">
          ${entries.map((item, index) => `
            <article class="wiki-reboot__updateItem">
              <span class="wiki-reboot__updateIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
              <span>${escapeHtml(item)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiRebootPager(categories, pages, currentSlug) {
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = order.indexOf(currentSlug);
    if (currentIndex === -1) return "";

    const previousSlug = order[currentIndex - 1] || null;
    const nextSlug = order[currentIndex + 1] || null;

    const renderLink = (slug, label, direction) => {
      if (!slug || !pages[slug]) {
        return `<div class="wiki-reboot__pagerCard wiki-reboot__pagerCard--ghost"></div>`;
      }

      const page = pages[slug];
      return `
        <a class="wiki-reboot__pagerCard" href="#/wiki/${escapeHtml(slug)}">
          <div class="wiki-reboot__pagerEyebrow">${escapeHtml(label)}</div>
          <div class="wiki-reboot__pagerTitle">${escapeHtml(page.navLabel || page.title)}</div>
          <div class="wiki-reboot__pagerArrow">${direction === "prev" ? "Previous guide" : "Next guide"}</div>
        </a>
      `;
    };

    return `
      <section class="wiki-reboot__pager">
        ${renderLink(previousSlug, "Back", "prev")}
        ${renderLink(nextSlug, "Continue", "next")}
      </section>
    `;
  }

  function bindWikiRebootControls() {
    document.querySelectorAll("[data-wiki-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-wiki-jump");
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  renderWikiSidebar = function renderWikiSidebarEnhanced(categories, pages, currentSlug, updatedAt) {
    return renderWikiRebootLibrary(categories, pages, currentSlug, updatedAt);
  };

  renderWiki = function renderWikiEnhanced(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="wiki-reboot">
          ${renderHeader("Wiki", [{ label: "Wiki" }])}
          <section class="section">
            <div class="empty">Wiki data is missing right now.</div>
          </section>
        </div>
      `);
      return;
    }

    const category = findWikiCategoryForPage(categories, currentSlug);
    const heading = page.navLabel || page.title;
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = Math.max(0, order.indexOf(currentSlug));
    const facts = renderWikiRebootFacts(page);
    const sectionJump = renderWikiRebootJumpList(page.sections);
    const content = renderWikiRebootSections(page.sections);
    const updates = renderWikiRebootUpdates(page.updates);
    const pager = renderWikiRebootPager(categories, pages, currentSlug);

    setView(`
      <div class="wiki-reboot">
        ${renderHeader("Wiki", [{ label: "Wiki" }, { label: heading }])}
        <div class="wiki-reboot__layout">
          ${renderWikiRebootLibrary(categories, pages, currentSlug, wiki.updatedAt)}
          <div class="wiki-reboot__content">
            ${renderWikiRebootHero(page, category, wiki.updatedAt, currentIndex, order.length || 1)}
            ${facts}
            <div class="wiki-reboot__articleGrid">
              <div class="wiki-reboot__articleColumn">
                ${content}
                ${updates}
                ${pager}
              </div>
              <aside class="wiki-reboot__sideColumn">
                ${sectionJump}
              </aside>
            </div>
          </div>
        </div>
      </div>
    `);

    bindWikiRebootControls();
  };

  function getWikiAtlasAnchor(index) {
    return `wiki-atlas-chapter-${index + 1}`;
  }

  function renderWikiAtlasShelf(categories, pages, currentSlug) {
    return `
      <section class="wiki-atlas__shelf" aria-label="Wiki library">
        ${categories.map((category) => {
          const links = (category.pages || []).map((slug) => {
            const page = pages[slug];
            if (!page) return "";
            const active = slug === currentSlug ? " is-active" : "";
            return `
              <a class="wiki-atlas__link${active}" href="#/wiki/${escapeHtml(slug)}">
                <span class="wiki-atlas__linkLabel">${escapeHtml(page.navLabel || page.title)}</span>
              </a>
            `;
          }).join("");

          return `
            <article class="wiki-atlas__group">
              <div class="wiki-atlas__groupTop">
                <span class="wiki-atlas__groupTitle">${escapeHtml(category.title)}</span>
                <span class="wiki-atlas__groupCount">${escapeHtml(String((category.pages || []).length))}</span>
              </div>
              <div class="wiki-atlas__groupLinks">${links}</div>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderWikiAtlasMasthead(page, category, updatedAt, currentIndex, totalPages) {
    const notes = Array.isArray(page?.overviewCards) && page.overviewCards.length
      ? page.overviewCards.slice(0, 3)
      : [
          { title: "Read order", text: "Start with the summary, then move through each chapter in order." },
          { title: "Fast lookup", text: "Use the chapter strip below to jump straight into the exact section you need." },
          { title: "Current page", text: "This page stays focused on one subject instead of mixing multiple systems together." }
        ];

    return `
      <section class="wiki-atlas__masthead">
        <div class="wiki-atlas__edition">
          <div class="wiki-atlas__editionLabel">SGCNR knowledgebase</div>
          <div class="wiki-atlas__editionValue">${escapeHtml(category?.title || "Wiki")}</div>
          <div class="wiki-atlas__editionMeta">Page ${escapeHtml(String(currentIndex + 1))} / ${escapeHtml(String(totalPages))}</div>
          <div class="wiki-atlas__editionMeta">Updated ${escapeHtml(updatedAt || "2026-04-01")}</div>
        </div>
        <div class="wiki-atlas__headline">
          <div class="wiki-atlas__eyebrow">${escapeHtml(page.eyebrow || "Knowledgebase entry")}</div>
          <h2>${escapeHtml(page.title)}</h2>
          <p>${escapeHtml(page.summary || "")}</p>
        </div>
        <div class="wiki-atlas__briefing">
          ${notes.map((card, index) => `
            <article class="wiki-atlas__briefCard">
              <div class="wiki-atlas__briefIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</div>
              <div class="wiki-atlas__briefBody">
                <strong>${escapeHtml(card.title || "Guide note")}</strong>
                <span>${escapeHtml(card.text || "")}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiAtlasFactRow(page) {
    const facts = Array.isArray(page?.facts) ? page.facts : [];
    if (!facts.length) return "";

    return `
      <section class="wiki-atlas__factRow">
        ${facts.map(([label, value]) => `
          <article class="wiki-atlas__factPill">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderWikiAtlasChapters(sections) {
    const entries = Array.isArray(sections) ? sections : [];
    if (!entries.length) return "";

    return `
      <section class="wiki-atlas__chapterBar">
        ${entries.map((section, index) => `
          <button class="wiki-atlas__chapterBtn" type="button" data-wiki-atlas-jump="${escapeHtml(getWikiAtlasAnchor(index))}">
            <span class="wiki-atlas__chapterBtnIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
            <span class="wiki-atlas__chapterBtnLabel">${escapeHtml(section.title || `Section ${index + 1}`)}</span>
          </button>
        `).join("")}
      </section>
    `;
  }

  function renderWikiAtlasSheets(sections) {
    const entries = Array.isArray(sections) ? sections : [];
    return entries.map((section, index) => {
      const paragraphs = (section.paragraphs || []).map((paragraph) => `<p class="wiki-atlas__sheetText">${escapeHtml(paragraph)}</p>`).join("");
      const bullets = Array.isArray(section.bullets) && section.bullets.length
        ? `
          <ul class="wiki-atlas__sheetList">
            ${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        `
        : "";

      return `
        <article class="wiki-atlas__sheet" id="${escapeHtml(getWikiAtlasAnchor(index))}">
          <div class="wiki-atlas__sheetTop">
            <div class="wiki-atlas__sheetNumber">${escapeHtml(String(index + 1).padStart(2, "0"))}</div>
            <div class="wiki-atlas__sheetTitleWrap">
              <div class="wiki-atlas__sheetLabel">Chapter</div>
              <h3 class="wiki-atlas__sheetTitle">${escapeHtml(section.title || `Section ${index + 1}`)}</h3>
            </div>
          </div>
          <div class="wiki-atlas__sheetBody">
            ${paragraphs}
            ${bullets}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderWikiAtlasNotes(items) {
    const entries = Array.isArray(items) ? items : [];
    if (!entries.length) return "";

    return `
      <section class="wiki-atlas__notes">
        <div class="wiki-atlas__notesHead">
          <div class="wiki-atlas__eyebrow">Important notes</div>
          <h3>Current direction</h3>
        </div>
        <div class="wiki-atlas__notesList">
          ${entries.map((item, index) => `
            <article class="wiki-atlas__noteItem">
              <span class="wiki-atlas__noteIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
              <span>${escapeHtml(item)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiAtlasPager(categories, pages, currentSlug) {
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = order.indexOf(currentSlug);
    if (currentIndex === -1) return "";

    const previousSlug = order[currentIndex - 1] || null;
    const nextSlug = order[currentIndex + 1] || null;
    const renderLink = (slug, label) => {
      if (!slug || !pages[slug]) {
        return `<div class="wiki-atlas__pagerItem wiki-atlas__pagerItem--ghost"></div>`;
      }

      const page = pages[slug];
      return `
        <a class="wiki-atlas__pagerItem" href="#/wiki/${escapeHtml(slug)}">
          <span class="wiki-atlas__pagerLabel">${escapeHtml(label)}</span>
          <strong class="wiki-atlas__pagerTitle">${escapeHtml(page.navLabel || page.title)}</strong>
        </a>
      `;
    };

    return `
      <section class="wiki-atlas__pager">
        ${renderLink(previousSlug, "Previous")}
        ${renderLink(nextSlug, "Next")}
      </section>
    `;
  }

  function bindWikiAtlasControls() {
    document.querySelectorAll("[data-wiki-atlas-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-wiki-atlas-jump");
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  renderWiki = function renderWikiAtlas(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="wiki-atlas">
          ${renderHeader("Wiki", [{ label: "Wiki" }])}
          <div class="section">
            <div class="empty">Wiki data is missing right now.</div>
          </div>
        </div>
      `);
      return;
    }

    const category = findWikiCategoryForPage(categories, currentSlug);
    const heading = page.navLabel || page.title;
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = Math.max(0, order.indexOf(currentSlug));

    setView(`
      <div class="wiki-atlas">
        ${renderHeader("Wiki", [{ label: "Wiki" }, { label: heading }])}
        ${renderWikiAtlasMasthead(page, category, wiki.updatedAt, currentIndex, order.length || 1)}
        ${renderWikiAtlasShelf(categories, pages, currentSlug)}
        ${renderWikiAtlasFactRow(page)}
        ${renderWikiAtlasChapters(page.sections)}
        <section class="wiki-atlas__body">
          ${renderWikiAtlasSheets(page.sections)}
          ${renderWikiAtlasNotes(page.updates)}
          ${renderWikiAtlasPager(categories, pages, currentSlug)}
        </section>
      </div>
    `);

    bindWikiAtlasControls();
  };

  function getWikiDossierAnchor(index) {
    return `wiki-dossier-part-${index + 1}`;
  }

  function renderWikiDossierCatalog(categories, pages, currentSlug) {
    return `
      <section class="wiki-dossier__catalog" aria-label="Wiki catalog">
        ${categories.map((category) => {
          const items = (category.pages || []).map((slug) => {
            const page = pages[slug];
            if (!page) return "";
            const active = slug === currentSlug ? " is-active" : "";
            return `
              <a class="wiki-dossier__catalogLink${active}" href="#/wiki/${escapeHtml(slug)}">
                ${escapeHtml(page.navLabel || page.title)}
              </a>
            `;
          }).join("");

          return `
            <article class="wiki-dossier__catalogGroup">
              <div class="wiki-dossier__catalogTop">
                <span class="wiki-dossier__catalogTitle">${escapeHtml(category.title)}</span>
                <span class="wiki-dossier__catalogCount">${escapeHtml(String((category.pages || []).length))}</span>
              </div>
              <div class="wiki-dossier__catalogLinks">${items}</div>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderWikiDossierMasthead(page, category, updatedAt, currentIndex, totalPages) {
    const facts = Array.isArray(page?.facts) ? page.facts.slice(0, 3) : [];
    const summaryFacts = facts.length
      ? facts
      : [
          ["Category", category?.title || "Wiki"],
          ["Sections", String((page?.sections || []).length || 0)],
          ["Updated", updatedAt || "2026-04-01"]
        ];

    return `
      <section class="wiki-dossier__masthead">
        <div class="wiki-dossier__stamp">
          <span class="wiki-dossier__stampLabel">SGCNR dossier</span>
          <strong class="wiki-dossier__stampValue">${escapeHtml(category?.title || "Wiki")}</strong>
          <span class="wiki-dossier__stampMeta">File ${escapeHtml(String(currentIndex + 1).padStart(2, "0"))} / ${escapeHtml(String(totalPages))}</span>
        </div>
        <div class="wiki-dossier__headline">
          <div class="wiki-dossier__eyebrow">${escapeHtml(page.eyebrow || "Operational guide")}</div>
          <h2>${escapeHtml(page.title)}</h2>
          <p>${escapeHtml(page.summary || "")}</p>
        </div>
        <div class="wiki-dossier__summaryGrid">
          ${summaryFacts.map(([label, value]) => `
            <article class="wiki-dossier__summaryItem">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiDossierNavigator(sections) {
    const entries = Array.isArray(sections) ? sections : [];
    if (!entries.length) return "";

    return `
      <aside class="wiki-dossier__navigator">
        <div class="wiki-dossier__navigatorTop">
          <div class="wiki-dossier__eyebrow">Page structure</div>
          <h3>Jump to section</h3>
        </div>
        <div class="wiki-dossier__navigatorList">
          ${entries.map((section, index) => `
            <button class="wiki-dossier__navigatorBtn" type="button" data-wiki-dossier-jump="${escapeHtml(getWikiDossierAnchor(index))}">
              <span class="wiki-dossier__navigatorIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
              <span class="wiki-dossier__navigatorLabel">${escapeHtml(section.title || `Section ${index + 1}`)}</span>
            </button>
          `).join("")}
        </div>
      </aside>
    `;
  }

  function renderWikiDossierFolios(sections) {
    const entries = Array.isArray(sections) ? sections : [];
    return entries.map((section, index) => {
      const paragraphs = (section.paragraphs || []).map((paragraph) => `
        <p class="wiki-dossier__folioText">${escapeHtml(paragraph)}</p>
      `).join("");
      const bullets = Array.isArray(section.bullets) && section.bullets.length
        ? `
          <ul class="wiki-dossier__folioList">
            ${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        `
        : "";

      return `
        <article class="wiki-dossier__folio" id="${escapeHtml(getWikiDossierAnchor(index))}">
          <div class="wiki-dossier__folioTop">
            <span class="wiki-dossier__folioNumber">Part ${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
            <span class="wiki-dossier__folioRule" aria-hidden="true"></span>
          </div>
          <h3 class="wiki-dossier__folioTitle">${escapeHtml(section.title || `Section ${index + 1}`)}</h3>
          <div class="wiki-dossier__folioBody">
            ${paragraphs}
            ${bullets}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderWikiDossierNotes(items) {
    const entries = Array.isArray(items) ? items : [];
    if (!entries.length) return "";

    return `
      <section class="wiki-dossier__notes">
        <div class="wiki-dossier__notesTop">
          <div class="wiki-dossier__eyebrow">Revision notes</div>
          <h3>Keep in mind</h3>
        </div>
        <div class="wiki-dossier__notesList">
          ${entries.map((item, index) => `
            <article class="wiki-dossier__note">
              <span class="wiki-dossier__noteIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
              <span>${escapeHtml(item)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWikiDossierPager(categories, pages, currentSlug) {
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = order.indexOf(currentSlug);
    if (currentIndex === -1) return "";

    const renderLink = (slug, label) => {
      if (!slug || !pages[slug]) {
        return `<div class="wiki-dossier__pagerItem wiki-dossier__pagerItem--ghost"></div>`;
      }

      const page = pages[slug];
      return `
        <a class="wiki-dossier__pagerItem" href="#/wiki/${escapeHtml(slug)}">
          <span class="wiki-dossier__pagerLabel">${escapeHtml(label)}</span>
          <strong class="wiki-dossier__pagerTitle">${escapeHtml(page.navLabel || page.title)}</strong>
        </a>
      `;
    };

    return `
      <section class="wiki-dossier__pager">
        ${renderLink(order[currentIndex - 1] || null, "Previous file")}
        ${renderLink(order[currentIndex + 1] || null, "Next file")}
      </section>
    `;
  }

  function bindWikiDossierControls() {
    document.querySelectorAll("[data-wiki-dossier-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-wiki-dossier-jump");
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  renderWiki = function renderWikiDossier(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="wiki-dossier">
          ${renderHeader("Wiki", [{ label: "Wiki" }])}
          <section class="section">
            <div class="empty">Wiki data is missing right now.</div>
          </section>
        </div>
      `);
      return;
    }

    const category = findWikiCategoryForPage(categories, currentSlug);
    const heading = page.navLabel || page.title;
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = Math.max(0, order.indexOf(currentSlug));

    setView(`
      <div class="wiki-dossier">
        ${renderHeader("Wiki", [{ label: "Wiki" }, { label: heading }])}
        ${renderWikiDossierMasthead(page, category, wiki.updatedAt, currentIndex, order.length || 1)}
        ${renderWikiDossierCatalog(categories, pages, currentSlug)}
        <section class="wiki-dossier__workspace">
          <div class="wiki-dossier__main">
            ${renderWikiDossierFolios(page.sections)}
            ${renderWikiDossierNotes(page.updates)}
            ${renderWikiDossierPager(categories, pages, currentSlug)}
          </div>
          <div class="wiki-dossier__side">
            ${renderWikiDossierNavigator(page.sections)}
          </div>
        </section>
      </div>
    `);

    bindWikiDossierControls();
  };

  function renderWikiArchiveSidebar(categories, pages, currentSlug, updatedAt) {
    const groups = categories.map((category) => {
      const links = (category.pages || []).map((slug) => {
        const page = pages[slug];
        if (!page) return "";
        const isActive = slug === currentSlug ? " is-active" : "";
        const label = page.navLabel || page.title;
        return `<a class="wiki-nav__item${isActive}" href="#/wiki/${escapeHtml(slug)}">${escapeHtml(label)}</a>`;
      }).join("");

      return `
        <div class="wiki-nav__group">
          <div class="wiki-nav__title">
            <span>${escapeHtml(category.title)}</span>
            <span class="wiki-nav__count">${escapeHtml(String((category.pages || []).length))}</span>
          </div>
          <div class="wiki-nav__list">${links}</div>
        </div>
      `;
    }).join("");

    return `
      <aside class="section section--stack wiki-sidebar">
        <div class="wiki-sidebar__meta">
          <div class="section__eyebrow">SGCNR handbook</div>
          <h2>Wiki directory</h2>
          <p class="doc-p">Browse the original handbook pages by group. Updated ${escapeHtml(updatedAt || "recently")}.</p>
        </div>
        <div class="wiki-sidebar__navWrap">
          <div class="wiki-nav">${groups}</div>
        </div>
      </aside>
    `;
  }

  renderWikiSidebar = function renderWikiArchiveSidebarOverride(categories, pages, currentSlug, updatedAt) {
    return renderWikiArchiveSidebar(categories, pages, currentSlug, updatedAt);
  };

  renderWiki = function renderWikiArchive(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="wiki-shell wiki-archive">
          ${renderHeader("Wiki", [{ label: "Wiki" }])}
          <section class="section">
            <div class="empty">Wiki data is missing right now.</div>
          </section>
        </div>
      `);
      return;
    }

    const category = findWikiCategoryForPage(categories, currentSlug);
    const heading = page.navLabel || page.title;
    const sidebar = renderWikiArchiveSidebar(categories, pages, currentSlug, wiki.updatedAt);
    const facts = renderWikiFacts(page);
    const overview = renderWikiOverviewCards(page.overviewCards);
    const updates = renderWikiUpdates(page.updates);
    const content = renderWikiSections(page.sections);
    const pager = renderWikiPager(categories, pages, currentSlug);

    setView(`
      <div class="wiki-shell wiki-archive">
        ${renderHeader("Wiki", [{ label: "Wiki" }, { label: heading }])}
        <section class="section section--hero wiki-archive__hero">
          <div class="wiki-archive__heroBody">
            <div class="wiki-archive__heroCopy">
              <div class="section__eyebrow">${escapeHtml(page.eyebrow || "Wiki page")}</div>
              <h2>${escapeHtml(page.title)}</h2>
              <p class="doc-p">${escapeHtml(page.summary || "")}</p>
            </div>
            <div class="wiki-archive__heroMeta">
              <article class="wiki-archive__metaCard">
                <span>Category</span>
                <strong>${escapeHtml(category?.title || "Wiki")}</strong>
              </article>
              <article class="wiki-archive__metaCard">
                <span>Updated</span>
                <strong>${escapeHtml(wiki.updatedAt || "2026-04-01")}</strong>
              </article>
              <article class="wiki-archive__metaCard">
                <span>Sections</span>
                <strong>${escapeHtml(String((page.sections || []).length || 0))}</strong>
              </article>
            </div>
          </div>
        </section>
        <div class="wiki-layout wiki-archive__layout">
          ${sidebar}
          <section class="section wiki-article wiki-archive__article">
            <div class="wiki-archive__articleTop">
              <div class="section__eyebrow">Guide content</div>
              <p class="doc-p">Everything below stays in the original handbook order. Only the presentation has been cleaned up.</p>
            </div>
            ${facts}
            ${overview}
            ${content}
            ${updates}
            ${pager}
          </section>
        </div>
      </div>
    `);
  };

  renderStart = function renderStartEnhancedClean() {
    const quickLinks = [
      { label: "Rules", detail: "Learn the basics before you join.", href: "/rules" },
      { label: "Map", detail: "Keep the city layout nearby.", href: "/map" },
      { label: "Live", detail: "Check the server and bot state fast.", href: "/live" }
    ];

    setView(`
      <div>
        ${renderHeader("Start Here", [{ label: "Start" }], { showBadge: false })}
        <section class="section section--hero start-clean">
          <div class="section__eyebrow">New player entry</div>
          <h2>Get into the city without missing the basics.</h2>
          <p class="doc-p">This page is your fast lane: find the server, lock in the rules, and keep the right links ready before you start moving.</p>
          <div class="start-clean__flow">
            <article class="start-clean__step">
              <span class="start-clean__stepIndex">01</span>
              <div class="start-clean__stepCopy">
                <strong>Find SGCNR in FiveM</strong>
                <span>Search for the server in FiveM and join from there.</span>
              </div>
            </article>
            <article class="start-clean__step">
              <span class="start-clean__stepIndex">02</span>
              <div class="start-clean__stepCopy">
                <strong>Read the rules first</strong>
                <span>Use the Rules page before you jump into active situations in the city.</span>
              </div>
            </article>
            <article class="start-clean__step">
              <span class="start-clean__stepIndex">03</span>
              <div class="start-clean__stepCopy">
                <strong>Use Discord for support</strong>
                <span>Tickets, ban history, and staff help stay in Discord so everything is tracked properly.</span>
              </div>
            </article>
          </div>
        </section>

        <section class="start-clean__links" aria-label="Start shortcuts">
          ${quickLinks.map((item) => `
            <a class="start-clean__linkCard" href="${escapeHtml(item.href)}">
              <span class="start-clean__linkLabel">${escapeHtml(item.label)}</span>
              <strong class="start-clean__linkTitle">${escapeHtml(item.detail)}</strong>
            </a>
          `).join("")}
        </section>
      </div>
    `);
  };

  renderWikiSidebar = function renderWikiSidebarEnhancedClean(categories, pages, currentSlug, updatedAt) {
    const totalPages = Object.keys(pages).length;
    const groups = categories.map((category) => {
      const links = (category.pages || []).map((slug) => {
        const page = pages[slug];
        if (!page) return "";
        const isActive = slug === currentSlug ? " is-active" : "";
        const label = page.navLabel || page.title;
        return `<a class="wiki-nav__item${isActive}" href="#/wiki/${escapeHtml(slug)}">${escapeHtml(label)}</a>`;
      }).join("");

      return `
        <div class="wiki-nav__group">
          <div class="wiki-nav__title">
            <span>${escapeHtml(category.title)}</span>
            <span class="wiki-nav__count">${escapeHtml(String((category.pages || []).length))}</span>
          </div>
          <div class="wiki-nav__list">${links}</div>
        </div>
      `;
    }).join("");

    return `
      <aside class="section section--stack wiki-sidebar">
        <div class="wiki-sidebar__meta">
          <div class="section__eyebrow">Guide index</div>
          <h2>SGCNR Wiki</h2>
          <p class="doc-p">${escapeHtml(String(totalPages))} pages across ${escapeHtml(String(categories.length))} groups. Updated ${escapeHtml(updatedAt || "recently")}.</p>
        </div>
        <div class="wiki-sidebar__navWrap">
          <div class="wiki-nav">${groups}</div>
        </div>
      </aside>
    `;
  };

  function renderWikiJournalRail(categories, pages, currentSlug, updatedAt) {
    return `
      <aside class="section section--stack wiki-ledger__directory">
        <div class="wiki-ledger__directoryTop">
          <div class="section__eyebrow">Guide directory</div>
          <h2>Wiki pages</h2>
          <p class="doc-p">Move through systems, roles, and procedures from one cleaner library view.</p>
        </div>
        <div class="wiki-ledger__directoryGroups">
          ${categories.map((category) => {
            const links = (category.pages || []).map((slug) => {
              const page = pages[slug];
              if (!page) return "";
              const isActive = slug === currentSlug ? " is-active" : "";
              return `
                <a class="wiki-ledger__directoryLink${isActive}" href="/wiki/${escapeHtml(slug)}">
                  ${escapeHtml(page.navLabel || page.title)}
                </a>
              `;
            }).join("");

            return `
              <section class="wiki-ledger__directoryGroup">
                <div class="wiki-ledger__directoryGroupTop">
                  <span>${escapeHtml(category.title)}</span>
                  <span class="wiki-ledger__directoryCount">${escapeHtml(String((category.pages || []).length))}</span>
                </div>
                <div class="wiki-ledger__directoryList">${links}</div>
              </section>
            `;
          }).join("")}
        </div>
      </aside>
    `;
  }

  function renderWikiJournalHero(page, category, updatedAt, currentIndex, totalPages) {
    return `
      <section class="section section--hero wiki-ledger__masthead">
        <div class="wiki-ledger__mastheadGrid">
          <div class="wiki-ledger__mastheadCopy">
            <div class="section__eyebrow">${escapeHtml(page.eyebrow || "Wiki page")}</div>
            <h2>${escapeHtml(page.title)}</h2>
            <p class="doc-p">${escapeHtml(page.summary || "")}</p>
          </div>
          <div class="wiki-ledger__mastheadMeta">
            <article class="wiki-ledger__metaCard">
              <span>Category</span>
              <strong>${escapeHtml(category?.title || "Wiki")}</strong>
            </article>
            <article class="wiki-ledger__metaCard">
              <span>Page</span>
              <strong>${escapeHtml(String(currentIndex + 1))} / ${escapeHtml(String(totalPages))}</strong>
            </article>
            <article class="wiki-ledger__metaCard">
              <span>Updated</span>
              <strong>${escapeHtml(updatedAt || "2026-04-01")}</strong>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  renderWikiSidebar = function renderWikiSidebarJournal(categories, pages, currentSlug, updatedAt) {
    return renderWikiJournalRail(categories, pages, currentSlug, updatedAt);
  };

  renderWiki = function renderWikiJournal(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="wiki-ledger">
          ${renderHeader("Wiki", [{ label: "Wiki" }])}
          <section class="section">
            <div class="empty">Wiki data is missing right now.</div>
          </section>
        </div>
      `);
      return;
    }

    const category = findWikiCategoryForPage(categories, currentSlug);
    const heading = page.navLabel || page.title;
    const order = getWikiPageOrder(categories).filter((slug) => pages[slug]);
    const currentIndex = Math.max(0, order.indexOf(currentSlug));
    const sidebar = renderWikiJournalRail(categories, pages, currentSlug, wiki.updatedAt);
    const facts = renderWikiFacts(page);
    const overview = renderWikiOverviewCards(page.overviewCards);
    const updates = renderWikiUpdates(page.updates);
    const content = renderWikiSections(page.sections);
    const pager = renderWikiPager(categories, pages, currentSlug);

    setView(`
      <div class="wiki-ledger">
        ${renderHeader("Wiki", [{ label: "Wiki" }, { label: heading }])}
        ${renderWikiJournalHero(page, category, wiki.updatedAt, currentIndex, order.length || 1)}
        <div class="wiki-ledger__layout">
          ${sidebar}
          <div class="wiki-ledger__body">
            <section class="section wiki-ledger__summary">
              <div class="section__eyebrow">Overview</div>
              <h3>Quick reference</h3>
              ${facts}
              ${overview}
            </section>
            <section class="section wiki-ledger__document">
              <div class="section__eyebrow">Guide content</div>
              <h3>${escapeHtml(page.title)}</h3>
              ${content}
            </section>
            <section class="section wiki-ledger__updates">
              <div class="section__eyebrow">Recent notes</div>
              <h3>Updates</h3>
              ${updates || `<div class="empty">No update notes are listed for this page.</div>`}
            </section>
            <section class="section wiki-ledger__navigator">
              <div class="section__eyebrow">Continue</div>
              <h3>Next guide</h3>
              ${pager}
            </section>
          </div>
        </div>
      </div>
    `);
  };

  const originalUpdateAuthUi = updateAuthUi;
  updateAuthUi = function updateAuthUiFinal() {
    originalUpdateAuthUi();
    if (loginBtn) {
      loginBtn.textContent = "Login";
    }
  };

  renderRulesDisclaimer = function renderRulesDisclaimerFinal() {
    return "";
  };

  renderHeader = function renderHeaderFinal(title, breadcrumbItems, options = {}) {
    const bc = breadcrumbItems?.length ? buildBreadcrumb(breadcrumbItems) : "";
    const eyebrow = options.eyebrow || breadcrumbItems?.[0]?.label || "";
    const badge = options.showBadge && options.badgeLabel ? `<div class="neo-hero__badge">${escapeHtml(options.badgeLabel)}</div>` : "";
    return `
      <div class="neo-hero">
        ${bc}
        <div class="neo-hero__top">
          ${eyebrow ? `<span class="neo-hero__eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          ${badge}
        </div>
        <h1 class="neo-hero__title">${escapeHtml(title)}</h1>
      </div>
    `;
  };

  renderLandingHome = function renderLandingHomeFinal() {
    setView(renderLandingHubHomeMarkup());
  };

  renderStart = function renderStartFinal() {
    setView(`
      <div class="neo-start">
        ${renderHeader("Start Here", [{ label: "Start" }], { showBadge: false })}
        <section class="section neo-start__panel" data-reveal>
          <span class="neo-kicker">First steps</span>
          <h2>Get in, get set, and keep moving.</h2>
          <p class="doc-p">Use this page as the short setup path before you jump into the city.</p>
          <div class="neo-stepGrid">
            <article class="neo-step">
              <span class="neo-step__index">01</span>
              <div>
                <strong>Find SGCNR in FiveM</strong>
                <p>Search for the server in FiveM and join from there.</p>
              </div>
            </article>
            <article class="neo-step">
              <span class="neo-step__index">02</span>
              <div>
                <strong>Read the rules</strong>
                <p>Check the rules page before you enter active situations in the city.</p>
              </div>
            </article>
            <article class="neo-step">
              <span class="neo-step__index">03</span>
              <div>
                <strong>Use Discord for support</strong>
                <p>Support, ban history, and staff contact all stay tracked in Discord tickets.</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    `);
  };

  renderHelp = function renderHelpFinal() {
    const ticketLink = `<a class="info-link" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL)}" target="_blank" rel="noopener noreferrer">open the ticket channel</a>`;
    setView(`
      <div class="neo-help">
        ${renderHeader("Help", [{ label: "Help" }], { showBadge: false })}
        <div class="neo-help__grid">
          <section class="section neo-help__panel">
            <span class="neo-kicker">Quick answers</span>
            <h2>Use the fast route.</h2>
            <div class="info-faq">
              <div class="info-faq__item">
                <div class="info-faq__q">Need support or want to report a player?</div>
                <div class="info-faq__a">Join Discord and ${ticketLink} so staff can track the case properly.</div>
              </div>
              <div class="info-faq__item">
                <div class="info-faq__q">Need your ban history?</div>
                <div class="info-faq__a">Open a Discord ticket and choose <strong>Ban history</strong>.</div>
              </div>
              <div class="info-faq__item">
                <div class="info-faq__q">Appealing something?</div>
                <div class="info-faq__a">Use the ticket channel and include your ID, the context, and any evidence you have.</div>
              </div>
              <div class="info-faq__item">
                <div class="info-faq__q">Not sure about a rule?</div>
                <div class="info-faq__a">Ask staff before you act. It is better than fixing the damage later.</div>
              </div>
            </div>
          </section>

          <aside class="section neo-help__panel neo-help__panel--side">
            <span class="neo-kicker">Best practice</span>
            <h2>Before you send a ticket</h2>
            <div class="neo-stepStack">
              <div class="neo-step neo-step--compact"><span class="neo-step__index">01</span><div><strong>Be direct</strong><p>Write the issue clearly and keep it short.</p></div></div>
              <div class="neo-step neo-step--compact"><span class="neo-step__index">02</span><div><strong>Bring proof</strong><p>Add screenshots, IDs, clips, or anything else staff needs.</p></div></div>
              <div class="neo-step neo-step--compact"><span class="neo-step__index">03</span><div><strong>Stay in one thread</strong><p>Keep the whole case in the same Discord ticket.</p></div></div>
            </div>
          </aside>
        </div>
      </div>
    `);
  };

  renderServerStatusShell = function renderServerStatusShellFinal() {
    return `
      <div class="status-page status-page--minimal">
        ${renderHeader("Live", [{ label: "Live" }], { showBadge: false })}
        <section class="section section--hero live-minimal__hero" data-reveal>
          <span class="neo-kicker">Live checks</span>
          <h2>Server and Discord bot status.</h2>
          <p class="doc-p">Two checks, one page: the game server and the Discord bot bridge.</p>
          <div class="status-live__actions">
            <button class="auth__btn" id="statusRefreshBtn" type="button">Refresh</button>
          </div>
        </section>
        <div id="serverStatusMount">${renderServerStatusLoading()}</div>
      </div>
    `;
  };

  renderMapStageAside = function renderMapStageAsideFinal(location) {
    const legend = renderMapLegend();
    if (!location) {
      return `
        <div class="map-stage-card map-stage-card--focus">
          <div class="map-stage-card__eyebrow">Map focus</div>
          <div class="map-stage-card__title">Los Santos services</div>
          <div class="map-stage-card__body">Use the filters and location list to move through service points faster.</div>
        </div>
        <div class="map-stage-card">
          <div class="map-stage-card__eyebrow">Legend</div>
          <div class="map-stage-card__legend">${legend}</div>
        </div>
      `;
    }

    const meta = getMapTypeMeta(location.type);
    return `
      <div class="map-stage-card map-stage-card--focus">
        <div class="map-stage-card__eyebrow">${escapeHtml(meta.label)}</div>
        <div class="map-stage-card__title">${escapeHtml(location.name)}</div>
        <div class="map-stage-card__body">${escapeHtml(getMapLocationDescription(location))}</div>
      </div>
      <div class="map-stage-card">
        <div class="map-stage-card__eyebrow">Region</div>
        <div class="map-stage-card__title">${escapeHtml(location.region || "Los Santos")}</div>
        <div class="map-stage-card__body">${escapeHtml(getMapLocationMeta(location))}</div>
      </div>
    `;
  };

  if (MAP_TYPE_META?.police) MAP_TYPE_META.police = { ...MAP_TYPE_META.police, color: "#79ffb4", glow: "rgba(121, 255, 180, .24)" };
  if (MAP_TYPE_META?.hospital) MAP_TYPE_META.hospital = { ...MAP_TYPE_META.hospital, color: "#f1d3bd", glow: "rgba(241, 211, 189, .22)" };
  if (MAP_TYPE_META?.fire) MAP_TYPE_META.fire = { ...MAP_TYPE_META.fire, color: "#56d88a", glow: "rgba(86, 216, 138, .24)" };
  if (MAP_TYPE_META?.carwash) MAP_TYPE_META.carwash = { ...MAP_TYPE_META.carwash, color: "#9cf6c2", glow: "rgba(156, 246, 194, .22)" };
  if (MAP_TYPE_META?.underground) MAP_TYPE_META.underground = { ...MAP_TYPE_META.underground, color: "#48b76e", glow: "rgba(72, 183, 110, .24)" };

  const WIKI_FILTERS = [
    { id: "all", label: "All" },
    { id: "response", label: "Response" },
    { id: "jobs", label: "Jobs" },
    { id: "systems", label: "Systems" },
    { id: "illegal", label: "Illegal" },
    { id: "property", label: "Property" },
    { id: "support", label: "Support" }
  ];

  const wikiUiState = {
    filter: "all",
    query: ""
  };

  function getWikiPageEntries(categories, pages) {
    return categories.flatMap((category) =>
      (category.pages || []).map((slug) => {
        const page = pages[slug];
        if (!page) return null;
        let bucket = "systems";
        if (category.id === "basics") bucket = "all";
        if (category.id === "emergency") bucket = "response";
        if (category.id === "civilian") bucket = "jobs";
        if (category.id === "gameplay") bucket = "systems";
        if (category.id === "criminal") bucket = "illegal";
        if (category.id === "properties") bucket = "property";
        if (category.id === "misc") bucket = "support";

        return {
          slug,
          title: page.navLabel || page.title,
          summary: page.summary || "",
          bucket,
          categoryTitle: category.title,
          searchIndex: normalize(`${page.navLabel || page.title} ${page.summary || ""} ${category.title}`)
        };
      }).filter(Boolean)
    );
  }

  function wikiEntryMatches(entry) {
    const filterMatch = wikiUiState.filter === "all" || entry.bucket === wikiUiState.filter;
    const queryMatch = !wikiUiState.query || entry.searchIndex.includes(normalize(wikiUiState.query));
    return filterMatch && queryMatch;
  }

  function bindWikiShowcase() {
    const search = document.querySelector("[data-wiki-search]");
    const cards = Array.from(document.querySelectorAll("[data-wiki-card]"));
    const empty = document.querySelector("[data-wiki-empty]");

    const sync = () => {
      let visible = 0;
      cards.forEach((card) => {
        const matchesFilter = wikiUiState.filter === "all" || card.dataset.bucket === wikiUiState.filter;
        const matchesQuery = !wikiUiState.query || (card.dataset.search || "").includes(normalize(wikiUiState.query));
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) {
        empty.hidden = visible > 0;
      }
      document.querySelectorAll("[data-wiki-filter]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.wikiFilter === wikiUiState.filter);
      });
    };

    if (search) {
      search.value = wikiUiState.query;
      search.addEventListener("input", () => {
        wikiUiState.query = search.value || "";
        sync();
      });
    }

    document.querySelectorAll("[data-wiki-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        wikiUiState.filter = button.dataset.wikiFilter || "all";
        sync();
      });
    });

    sync();
  }

  renderWiki = function renderWikiShowcase(pageSlug) {
    const wiki = getWikiDataset();
    const categories = Array.isArray(wiki.categories) ? wiki.categories : [];
    const pages = wiki.pages && typeof wiki.pages === "object" ? wiki.pages : {};
    const entries = getWikiPageEntries(categories, pages);
    const requestedSlug = (pageSlug || "introduction").toString().toLowerCase();
    const currentSlug = pages[requestedSlug] ? requestedSlug : "introduction";
    const page = pages[currentSlug];

    if (!page) {
      setView(`
        <div class="neo-wiki">
          ${renderHeader("Wiki", [{ label: "Wiki" }], { showBadge: false })}
          <section class="section"><div class="empty">Wiki data is missing right now.</div></section>
        </div>
      `);
      return;
    }

    const pageFacts = Array.isArray(page.facts) ? page.facts : [];
    const pageSections = Array.isArray(page.sections) ? page.sections : [];
    const pageUpdates = Array.isArray(page.updates) ? page.updates : [];

    setView(`
      <div class="neo-wiki">
        ${renderHeader("Wiki", [{ label: "Wiki" }], { showBadge: false })}
        <section class="section section--hero neo-wiki__hero" data-reveal>
          <span class="neo-kicker">Knowledgebase</span>
          <h2>${escapeHtml(page.title)}</h2>
          <p class="doc-p">${escapeHtml(page.summary || "Browse jobs, systems, support pages, and city mechanics from one cleaner library.")}</p>
          <div class="neo-wiki__controls">
            <input class="neo-wiki__search" data-wiki-search type="search" placeholder="Filter wiki pages..." />
            <div class="neo-wiki__filters">
              ${WIKI_FILTERS.map((filter) => `<button class="neo-wiki__filter${filter.id === wikiUiState.filter ? " is-active" : ""}" type="button" data-wiki-filter="${escapeHtml(filter.id)}">${escapeHtml(filter.label)}</button>`).join("")}
            </div>
          </div>
        </section>

        <div class="neo-wiki__layout">
          <aside class="neo-wiki__rail section" data-reveal>
            <div class="neo-wiki__railTop">
              <span class="neo-kicker">Pages</span>
              <h3>Filtered library</h3>
            </div>
            <div class="neo-wiki__cards">
              ${entries.map((entry) => `
                <a class="neo-wiki__card${entry.slug === currentSlug ? " is-current" : ""}" href="/wiki/${escapeHtml(entry.slug)}" data-wiki-card data-bucket="${escapeHtml(entry.bucket)}" data-search="${escapeHtml(entry.searchIndex)}">
                  <span class="neo-wiki__cardMeta">${escapeHtml(entry.categoryTitle)}</span>
                  <strong class="neo-wiki__cardTitle">${escapeHtml(entry.title)}</strong>
                  <span class="neo-wiki__cardText">${escapeHtml(entry.summary)}</span>
                </a>
              `).join("")}
              <div class="empty" data-wiki-empty hidden>No wiki pages match this filter yet.</div>
            </div>
          </aside>

          <section class="neo-wiki__article section" data-reveal>
            <div class="neo-wiki__facts">
              ${pageFacts.map(([label, value]) => `
                <article class="neo-wiki__fact">
                  <span>${escapeHtml(label)}</span>
                  <strong>${escapeHtml(value)}</strong>
                </article>
              `).join("")}
            </div>

            <div class="neo-wiki__sections">
              ${pageSections.map((section, index) => `
                <article class="neo-wiki__section">
                  <div class="neo-wiki__sectionTop">
                    <span class="neo-wiki__sectionIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
                    <h3>${escapeHtml(section.title || `Section ${index + 1}`)}</h3>
                  </div>
                  ${(section.paragraphs || []).map((paragraph) => `<p class="doc-p">${escapeHtml(paragraph)}</p>`).join("")}
                  ${Array.isArray(section.bullets) && section.bullets.length ? `
                    <ul class="doc-list neo-wiki__list">
                      ${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
                    </ul>
                  ` : ""}
                </article>
              `).join("")}
            </div>

            ${pageUpdates.length ? `
              <section class="neo-wiki__updates">
                <span class="neo-kicker">Current notes</span>
                <div class="neo-wiki__updateList">
                  ${pageUpdates.map((note, index) => `
                    <div class="neo-wiki__update">
                      <span class="neo-wiki__updateIndex">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
                      <span>${escapeHtml(note)}</span>
                    </div>
                  `).join("")}
                </div>
              </section>
            ` : ""}
          </section>
        </div>
      </div>
    `);

    bindWikiShowcase();
  };

  function renderHomefrontStatusCards(snapshot = null) {
    const liveOps = snapshot?.liveOps || {};
    const discordOps = liveOps.discord || normaliseDiscordOpsPayload(null);
    const serverHealth = normaliseHealthPayload(
      liveOps.serverHealth || {
        status: snapshot
          ? (snapshot.online ? "online" : "offline")
          : "pending",
        message: snapshot?.apiError || "Checking the live server feed."
      },
      "Game Server"
    );
    const botHealth = {
      ...(discordOps?.botStatus || normaliseHealthPayload(null, "Discord Bot")),
      label: "Discord Bot"
    };
    const serverValue = serverHealth.status === "online"
      ? "All systems operational"
      : serverHealth.status === "offline"
        ? "Server feed offline"
        : "Checking live feed";
    const playersValue = snapshot
      ? `${snapshot.clients ?? 0}${snapshot.maxClients ? ` / ${snapshot.maxClients}` : ""}`
      : "Pending";
    const playersMeta = snapshot?.online
      ? `${snapshot.mapName || "Los Santos"} live`
      : "Waiting for server feed";
    const discordValue = botHealth.status === "online"
      ? "Connected"
      : botHealth.status === "offline"
        ? "Offline"
        : "Pending";
    const discordMeta = botHealth.latencyMs != null
      ? `${botHealth.latencyMs} ms latency`
      : "Support & updates";
    const refreshMeta = snapshot?.refreshedAt
      ? `Updated ${formatServerTimestamp(snapshot.refreshedAt)}`
      : "Refreshing live data";

    return `
      <article class="homefront__statusCard homefront__statusCard--${escapeHtml(serverHealth.status || "pending")}">
        <span class="homefront__statusLabel">Live status</span>
        <strong class="homefront__statusValue">${escapeHtml(serverValue)}</strong>
        <span class="homefront__statusMeta">${escapeHtml(refreshMeta)}</span>
      </article>
      <article class="homefront__statusCard">
        <span class="homefront__statusLabel">Players online</span>
        <strong class="homefront__statusValue">${escapeHtml(playersValue)}</strong>
        <span class="homefront__statusMeta">${escapeHtml(playersMeta)}</span>
      </article>
      <article class="homefront__statusCard homefront__statusCard--discord">
        <span class="homefront__statusLabel">Discord</span>
        <strong class="homefront__statusValue">${escapeHtml(discordValue)}</strong>
        <span class="homefront__statusMeta">${escapeHtml(discordMeta)}</span>
      </article>
    `;
  }

  async function hydrateHomefrontStatus() {
    const mount = document.getElementById("homefrontStatusGrid");
    if (!mount) return;

    try {
      const snapshot = await loadServerSnapshot();
      if (!document.getElementById("homefrontStatusGrid")) return;
      mount.innerHTML = renderHomefrontStatusCards(snapshot);
    } catch {
      if (!document.getElementById("homefrontStatusGrid")) return;
      mount.innerHTML = renderHomefrontStatusCards(null);
    }
  }

  renderLandingHome = function renderLandingHomeRebuilt() {
    setView(renderLandingHubHomeMarkup());
  };

  renderStart = function renderStartRebuilt() {
    setView(`
      <div class="startfront">
        <section class="startfront__hero" data-reveal>
          <div class="startfront__head">
            <span class="startfront__eyebrow">Start</span>
            <h2 class="startfront__title">Get into SGCNR the right way.</h2>
            <p class="startfront__text">This page is the clean setup lane: find the server, lock in the rules, and keep the right links nearby before you jump into the city.</p>
          </div>
          <div class="startfront__actions">
            <a class="auth__btn auth__btn--primary" href="/rules">Read rules</a>
            <a class="auth__btn" href="/map">Open map</a>
            <a class="auth__btn" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL)}" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>
          <div class="startfront__stepGrid">
            <article class="startfront__step">
              <span class="startfront__stepIndex">01</span>
              <div class="startfront__stepCopy">
                <strong>Find SGCNR in FiveM</strong>
                <span>Search for the server in FiveM and join from there.</span>
              </div>
            </article>
            <article class="startfront__step">
              <span class="startfront__stepIndex">02</span>
              <div class="startfront__stepCopy">
                <strong>Read the rules first</strong>
                <span>Check the rules before you enter active situations in the city.</span>
              </div>
            </article>
            <article class="startfront__step">
              <span class="startfront__stepIndex">03</span>
              <div class="startfront__stepCopy">
                <strong>Use Discord for support</strong>
                <span>Support, ban history, and staff contact all stay tracked in Discord tickets.</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    `);
  };

  renderLandingHome = function renderLandingHomeFinalPass() {
    setView(renderLandingHubHomeMarkup());
  };

  function renderRuleBodyDocument(body) {
    const formatInline = (value) => escapeHtml(value).replace(/__([^_]+)__/g, "<strong>$1</strong>");
    const blocks = String(body || "")
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);

    return blocks.map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length && lines.every((line) => line.startsWith("- "))) {
        return `<ul class="rules-document__list">${lines.map((line) => `<li>${formatInline(line.slice(2))}</li>`).join("")}</ul>`;
      }
      return `<p class="rules-document__paragraph">${formatInline(block).replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }

  renderSection = function renderSectionDocument(sectionId) {
    const section = findSectionById(sectionId);
    if (!section) {
      setView(`<div>${renderHeader("Not found", [{ label: "Home", href: "#/" }, { label: "Not found" }])}</div>`);
      return;
    }

    const title = renderHeader(section.title, [
      { label: "Rules", href: "#/rules" },
      { label: section.title }
    ]);
    const rules = Array.isArray(section.rules) ? section.rules : [];
    const body = rules.map((rule) => `
      <article class="rules-document__article" id="rule-${escapeHtml(rule.id)}">
        <div class="rules-document__head">
          <span class="rule__id">${escapeHtml(rule.id)}</span>
          <h2>${escapeHtml(rule.title)}</h2>
        </div>
        <div class="rule__body rules-document__body">${renderRuleBodyDocument(rule.body)}</div>
      </article>
    `).join("");

    setView(`
      <div class="rules-document">
        ${title}
        <section class="section rules-document__section">
          ${body || `<div class="empty">Comming soon</div>`}
        </section>
        ${renderRulesDisclaimer()}
      </div>
    `);
  };

  renderRule = function renderRuleDocument(sectionId, ruleId) {
    const { section, rule } = findRule(sectionId, ruleId);
    if (!section || !rule) {
      setView(`<div>${renderHeader("Not found", [{ label: "Home", href: "#/" }, { label: "Not found" }])}</div>`);
      return;
    }

    const title = renderHeader(rule.title, [
      { label: "Rules", href: "#/rules" },
      { label: section.title, href: `#/section/${escapeHtml(section.id)}` },
      { label: `${rule.id}` }
    ]);

    setView(`
      <div class="rules-document">
        ${title}
        <section class="section rules-document__section">
          <article class="rules-document__article">
            <div class="rules-document__head">
              <span class="rule__id">${escapeHtml(rule.id)}</span>
              <h2>${escapeHtml(rule.title)}</h2>
            </div>
            <div class="rule__body rules-document__body">${renderRuleBodyDocument(rule.body)}</div>
          </article>
        </section>
        ${renderRulesDisclaimer()}
      </div>
    `);
  };

  route();
})();
