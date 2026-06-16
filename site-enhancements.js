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

  const helpMembershipPages = {
    gold: {
      title: "Gold Executive Membership",
      eyebrow: "Most prestigious tier",
      summary: "Elevate your experience with the most prestigious SGCNR supporter tier. Gold Executive includes every Silver benefit plus exclusive priority, identity, support, testing, vehicle, and wardrobe perks.",
      note: "Gold Executive includes all Silver Membership perks automatically. Standard in-game fees, taxes, and normal gameplay requirements still apply where relevant.",
      benefits: [
        {
          title: "VIP Priority (Level 2)",
          text: "Our highest tier of entry. Level 2 Priority places you at the very front of the connection line, bypassing both standard players and Level 1 Priority holders. Spend less time waiting and more time in the city."
        },
        {
          title: "Gold Executive Badge & Custom Identity",
          text: "Command respect with the exclusive Gold Crown icon displayed next to your name. Additionally, stand out with custom name colors in the TAB scoreboard and global chat, marking you as a top-tier supporter."
        },
        {
          title: "The Complete Add-On Car Collection",
          text: "Unlock full access to the entire fleet of custom-modeled, non-branded vehicles. This includes everything in the Silver collection plus an additional set of high-performance luxury vehicles available only to Gold Executives.",
          linkLabel: "View Gold car list",
          href: "/help/memberships/gold/cars"
        },
        {
          title: "Priority Administrative Support",
          text: "Receive faster processing for property and city service requests. Gold members move to the front of the administrative ticket queue on Discord for property management and city service inquiries. This perk provides faster processing times only and does not bypass in-game financial requirements."
        },
        {
          title: "Early Access & Development Testing",
          text: "Be the first to see the future of the city. Gold members receive exclusive invites to the development server to test-drive new maps, scripts, and features before release. Your feedback helps shape the server, and early testing may include bugs before public release."
        },
        {
          title: "Expanded Gold Wardrobe",
          text: "Unlock the full range of custom-modeled clothing. This expanded collection features unique, non-branded textures and original designs exclusive to the Gold Executive tier."
        },
        {
          title: "Inherited Perks (Silver Included)",
          text: "As a Gold Executive, you automatically receive all benefits included in the Silver Membership, including the Silver Wardrobe, Silver Lounge access, and basic supporter perks."
        }
      ]
    },
    silver: {
      title: "Silver Membership",
      eyebrow: "Standard supporter tier",
      summary: "Silver is the standard supporter package with in-game visual recognition, priority access, selected custom content, and Discord lounge access.",
      note: "Membership perks are applied through the official support/store flow. Make sure the Discord account used for supporter access is linked correctly.",
      benefits: [
        {
          title: "Exclusive Add-On Car Collection",
          text: "Access a curated selection of custom-modeled vehicles. These are unique, non-branded assets designed specifically for our server to ensure a high-quality, immersive experience. Access is granted via the in-game Car Dealerships places.",
          linkLabel: "Request the current car list",
          href: DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL
        },
        {
          title: "Priority Queue (Level 1)",
          text: "Skip the standard wait and get into the action faster. Level 1 Priority places you in the first tier of the connection queue during peak times, significantly reducing your wait time. This is applied automatically to your account upon joining."
        },
        {
          title: "Silver Nameplate & Visual Flair",
          text: "Stand out in the community with a unique Silver icon and nameplate. This visual rank is visible to all players on the TAB scoreboard, overhead in-game, and in the global chat."
        },
        {
          title: "The Silver Wardrobe",
          text: "Access a collection of custom-modeled, non-branded clothing. This collection includes exclusive vests, hats, and jackets designed original to our server. These items can be found in any clothing store under the Silver Collection category."
        },
        {
          title: "Silver Lounge Access (Discord)",
          text: "Gain exclusive access to the private Silver Supporter lounge in our official Discord. Enjoy high-level chat, early sneak peeks at upcoming updates, and community perks. Please ensure your Discord account is linked to your Tebex profile for automatic role assignment."
        }
      ]
    },
    free: {
      title: "Free Access",
      eyebrow: "Default player access",
      summary: "Free access is the normal SGCNR player baseline. No paid membership is required to join, play, use Discord support, and take part in the city.",
      note: "Free access does not include paid supporter perks, priority queue, supporter vehicles, supporter wardrobe items, or private supporter Discord lounges.",
      benefits: [
        {
          title: "Normal Server Access",
          text: "Join the server, follow the rules, and play normally without needing any paid membership."
        },
        {
          title: "Discord Support",
          text: "Use the official Discord ticket flow for support, ban history requests, reports, and staff questions."
        },
        {
          title: "Public Website Access",
          text: "Use the public website for rules, map information, live status, and Help pages."
        }
      ]
    }
  };

  function getEnhancedRoutePath() {
    if (typeof getCurrentRoutePath === "function") {
      return getCurrentRoutePath();
    }

    const hash = window.location.hash || "";
    if (hash.startsWith("#/")) return hash.slice(1);
    return window.location.pathname || "/";
  }

  function getHelpMembershipIdFromPath() {
    const clean = getEnhancedRoutePath();
    const parts = clean.split("/").filter(Boolean);
    if (parts[0] === "help" && parts[1] === "memberships" && parts[2]) {
      return helpMembershipPages[parts[2]] ? parts[2] : null;
    }
    if (parts[0] !== "help" || !parts[1]) return null;
    return helpMembershipPages[parts[1]] ? parts[1] : null;
  }

  function isGoldMembershipCarsPath() {
    const clean = getEnhancedRoutePath();
    const parts = clean.split("/").filter(Boolean);
    return parts[0] === "help" && parts[1] === "memberships" && parts[2] === "gold" && parts[3] === "cars";
  }

  function getHelpRuleSectionIdFromPath() {
    const clean = getEnhancedRoutePath();
    const parts = clean.split("/").filter(Boolean);
    if (parts[0] !== "help" || parts[1] !== "rules" || !parts[2]) return null;
    return parts[2];
  }

  function initEditorialMotion() {
    document.querySelectorAll("[data-reveal]").forEach((node) => {
      node.style.removeProperty("--reveal-delay");
      node.classList.add("is-visible");
    });
  }

  route = function enhancedRoute() {
    document.body.classList.remove("is-help-rules", "is-membership");

    if (isGoldMembershipCarsPath()) {
      if (typeof clearServerStatusPageState === "function") clearServerStatusPageState();
      if (typeof destroyCustomMap === "function") destroyCustomMap();
      if (typeof updateDockActive === "function") updateDockActive("help");
      if (typeof setSearchVisible === "function") setSearchVisible(false);
      if (typeof clearTopMeta === "function") clearTopMeta();

      document.body.classList.remove("is-landing", "is-map", "is-wiki");
      document.body.classList.add("is-standard", "is-membership");
      renderGoldMembershipCarsPage();
      window.requestAnimationFrame(initEditorialMotion);
      return;
    }

    const helpRuleSectionId = getHelpRuleSectionIdFromPath();
    if (helpRuleSectionId) {
      if (typeof clearServerStatusPageState === "function") clearServerStatusPageState();
      if (typeof destroyCustomMap === "function") destroyCustomMap();
      if (typeof updateDockActive === "function") updateDockActive("help");
      if (typeof setSearchVisible === "function") setSearchVisible(false);
      if (typeof clearTopMeta === "function") clearTopMeta();

      document.body.classList.remove("is-landing", "is-map", "is-wiki");
      document.body.classList.add("is-standard", "is-help-rules");
      renderHelpRuleSection(helpRuleSectionId);
      window.requestAnimationFrame(initEditorialMotion);
      return;
    }

    const membershipId = getHelpMembershipIdFromPath();
    if (membershipId) {
      if (typeof clearServerStatusPageState === "function") clearServerStatusPageState();
      if (typeof destroyCustomMap === "function") destroyCustomMap();
      if (typeof updateDockActive === "function") updateDockActive("help");
      if (typeof setSearchVisible === "function") setSearchVisible(false);
      if (typeof clearTopMeta === "function") clearTopMeta();

      document.body.classList.remove("is-landing", "is-map", "is-wiki");
      document.body.classList.add("is-standard", "is-membership");
      renderHelpMembershipPage(membershipId);
      window.requestAnimationFrame(initEditorialMotion);
      return;
    }

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
            <a class="auth__btn auth__btn--primary" href="/rules">Start</a>
            <a class="auth__btn" href="${escapeHtml(DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>
          <p class="landing-hub__support">Help can be found in the <a href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord</a>.</p>
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

  renderLandingHome = function renderLandingHomeFinalPass() {
    setView(renderLandingHubHomeMarkup());
  };

  renderHelp = function renderHelpCleanSlate() {
    const topics = [
      { label: "Memberships", text: "Perks, payments, and account questions.", href: DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL, external: true },
      { label: "Server Events", text: "Event info, timing, and questions.", href: DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL, external: true },
      { label: "Rules", text: "Discord rules and ingame rules.", href: "/rules" },
      { label: "Jobs", text: "Job info and requests.", href: DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL, external: true }
    ];

    setView(`
      <div class="help-clean">
        <header class="help-clean__head" aria-label="Help">
          <div>
            <div class="help-clean__eyebrow">Help</div>
            <h1>Support</h1>
          </div>
          <a class="auth__btn auth__btn--primary" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord tickets</a>
        </header>
        <section class="section help-clean__section" aria-label="Help categories">
          <div class="help-clean__grid">
            ${topics.map((topic) => `
              <a class="help-clean__item" href="${escapeHtml(topic.href)}"${topic.external ? ' target="_blank" rel="noopener noreferrer" data-no-route="true"' : ""}>
                <strong>${escapeHtml(topic.label)}</strong>
                <span>${escapeHtml(topic.text)}</span>
              </a>
            `).join("")}
          </div>
        </section>
      </div>
    `);
  };

  function renderHelpMembershipPage(packageId) {
    const membership = helpMembershipPages[packageId];
    if (!membership) {
      renderHelp();
      return;
    }

    const benefitCards = membership.benefits.map((benefit, index) => `
      <article class="neo-membership__benefit" data-reveal>
        <span class="neo-membership__benefitNumber">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
        <div>
          <h3>${escapeHtml(benefit.title)}</h3>
          <p>${escapeHtml(benefit.text)}</p>
          ${benefit.href ? `<a class="neo-membership__inlineLink" href="${escapeHtml(benefit.href)}" ${/^https?:\/\//.test(benefit.href) ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(benefit.linkLabel || "Open link")}</a>` : ""}
        </div>
      </article>
    `).join("");

    setView(`
      <div class="neo-help neo-membership">
        ${renderHeader(membership.title, [
          { label: "Help", href: "/help" },
          { label: membership.title }
        ], { showBadge: false })}

        <section class="section neo-membership__hero" data-reveal>
          <div>
            <span class="neo-kicker">${escapeHtml(membership.eyebrow)}</span>
            <h2>${escapeHtml(membership.title)}</h2>
            <p>${escapeHtml(membership.summary)}</p>
          </div>
          <a class="auth__btn auth__btn--primary" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Open Discord tickets</a>
        </section>

        <section class="neo-membership__layout" aria-label="${escapeHtml(membership.title)} details">
          <div class="neo-membership__benefits">
            ${benefitCards}
          </div>
          <aside class="neo-membership__aside" data-reveal>
            <span class="neo-kicker">Important</span>
            <p>${escapeHtml(membership.note)}</p>
            <a class="neo-help__link" href="/help">Back to Help</a>
          </aside>
        </section>
      </div>
    `);
  }

  function renderGoldMembershipCarsPage() {
    setView(`
      <div class="neo-help neo-membership">
        ${renderHeader("Gold Membership Cars", [
          { label: "Help", href: "/help" },
          { label: "Gold Executive", href: "/help/memberships/gold" },
          { label: "Cars" }
        ], { showBadge: false })}

        <section class="section neo-membership__hero" data-reveal>
          <div>
            <span class="neo-kicker">Gold Executive collection</span>
            <h2>Gold car list</h2>
            <p>The Gold Executive membership car catalogue is prepared here. Add the finalized vehicle list when staff confirms the public names and availability.</p>
          </div>
          <a class="auth__btn auth__btn--primary" href="/help/memberships/gold">Back to Gold</a>
        </section>

        <section class="neo-membership__layout" aria-label="Gold membership car list">
          <div class="neo-membership__benefits">
            <article class="neo-membership__benefit" data-reveal>
              <span class="neo-membership__benefitNumber">01</span>
              <div>
                <h3>Vehicle list coming soon</h3>
                <p>This page is ready for the complete Gold Executive add-on car collection. Once the final list is approved, each vehicle can be added here as a clean catalogue.</p>
              </div>
            </article>
          </div>
          <aside class="neo-membership__aside" data-reveal>
            <span class="neo-kicker">Current route</span>
            <p>Public URL: sgcnr.net/help/memberships/gold/cars</p>
            <a class="neo-help__link" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Ask in Discord</a>
          </aside>
        </section>
      </div>
    `);
  }

  renderRulesHub = function renderRulesHubClean(sections) {
    const title = renderHeader("Rules", [{ label: "Rules" }]);
    if (!sections.length) {
      setView(`
        <div class="rules-clean">
          ${title}
          <section class="section">
            <div class="empty">The rules are currently being rewritten.</div>
          </section>
          ${renderRulesDisclaimer()}
        </div>
      `);
      return;
    }

    const descriptions = {
      "discord-rules": "Community conduct, Discord channels, tickets, appeals, and punishments.",
      "ingame-rules": "Server rules will be published here when they are ready."
    };

    const cards = sections.map((section, index) => `
      <a class="rules-picker__item" href="/section/${escapeHtml(section.id)}" data-reveal>
        <span class="rules-picker__index">${escapeHtml(String(index + 1).padStart(2, "0"))}</span>
        <span class="rules-picker__copy">
          <strong>${escapeHtml(section.title)}</strong>
          <span>${escapeHtml(descriptions[section.id] || "Read this category before joining.")}</span>
        </span>
      </a>
    `).join("");

    setView(`
      <div class="rules-clean">
        ${title}
        <section class="rules-picker" aria-label="Rule categories">
          ${cards}
        </section>
        ${renderRulesDisclaimer()}
      </div>
    `);
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

  function renderHelpRuleSection(sectionId) {
    const section = findSectionById(sectionId);
    if (!section) {
      setView(`<div>${renderHeader("Not found", [{ label: "Help", href: "/help" }, { label: "Not found" }], { showBadge: false })}</div>`);
      return;
    }

    const title = renderHeader(section.title, [
      { label: "Help", href: "/help" },
      { label: "Rules", href: "/help" },
      { label: section.title }
    ], { showBadge: false });
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
      <div class="rules-document rules-document--help">
        ${title}
        <section class="section rules-document__section">
          ${body || `<div class="empty">Coming soon</div>`}
        </section>
        ${renderRulesDisclaimer()}
      </div>
    `);
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
