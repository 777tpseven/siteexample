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
    document.querySelectorAll("[data-reveal]").forEach((node) => {
      node.style.removeProperty("--reveal-delay");
      node.classList.add("is-visible");
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
          <h1 class="landing-hub__title">SGCNR</h1>
          <p class="landing-hub__text">FiveM server links, rules, map, live status, and Discord.</p>
          <div class="landing-hub__actions">
            <a class="auth__btn auth__btn--primary" href="/start">Start</a>
            <a class="auth__btn" href="${escapeHtml(DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>
        </section>

        <section class="landing-hub__grid" aria-label="Portal shortcuts">
          <a class="landing-hub__card" href="/rules" data-reveal>
            <strong class="landing-hub__cardTitle">Read before joining</strong>
            <span class="landing-hub__cardText">Discord rules are posted. Ingame rules will be added when ready.</span>
          </a>
          <a class="landing-hub__card" href="/map" data-reveal>
            <strong class="landing-hub__cardTitle">City services</strong>
            <span class="landing-hub__cardText">Police, hospital, fire, car wash, and other map spots.</span>
          </a>
          <a class="landing-hub__card" href="/live" data-reveal>
            <strong class="landing-hub__cardTitle">Server status</strong>
            <span class="landing-hub__cardText">Game server and Discord bot checks live here.</span>
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
            <h2 class="startfront__title">Start</h2>
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
                <strong>Find SGCNR</strong>
              </div>
            </article>
            <article class="startfront__step">
              <span class="startfront__stepIndex">02</span>
              <div class="startfront__stepCopy">
                <strong>Read rules</strong>
              </div>
            </article>
            <article class="startfront__step">
              <span class="startfront__stepIndex">03</span>
              <div class="startfront__stepCopy">
                <strong>Use Discord</strong>
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
