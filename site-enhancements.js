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
      eyebrow: "Gold Executive Membership Details",
      summary: "Gold Executive is the top supporter tier. It includes every Silver benefit, plus higher priority, extra vehicle access, faster admin support, testing access, and the expanded Gold wardrobe.",
      note: "Gold Executive includes all Silver Membership perks automatically. Standard in-game fees, taxes, and normal gameplay requirements still apply.",
      benefits: [
        {
          title: "VIP Priority (Level 2)",
          text: "Our highest tier of entry. Level 2 Priority places you at the very front of the connection line, bypassing both standard players and Level 1 Priority holders. Spend less time waiting and more time in the city."
        },
        {
          title: "Gold Executive Badge & Custom Identity",
          text: "Stand out with the exclusive Gold Crown icon next to your name. Gold also includes custom name colors in the TAB scoreboard and global chat, marking you as a top-tier supporter."
        },
        {
          title: "The Complete Add-On Car Collection",
          text: "Unlock full access to the complete fleet of custom-modeled, non-branded vehicles. This includes everything in the Silver collection, plus an additional set of high-performance luxury vehicles available only to Gold Executives. For the full list of membership cars, please use the link below.",
          linkLabel: "Click Here",
          href: "/help/memberships/gold/cars"
        },
        {
          title: "Priority Administrative Support",
          text: "Receive faster processing for property and city service requests. Gold members move to the front of the administrative ticket queue on Discord for property management and city service inquiries. All standard in-game fees and taxes still apply. This perk only provides faster processing times and does not bypass in-game financial requirements."
        },
        {
          title: "Early Access & Development Testing",
          text: "Be the first to see what is coming next. Gold members receive exclusive invites to the development server to test new maps, scripts, and features before public release. There may be bugs on the early access server, but your feedback helps us fix them before release."
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
      eyebrow: "Silver Membership Details",
      summary: "Silver gives you supporter vehicle access, Level 1 priority queue, visual rank flair, the Silver wardrobe, and access to the Silver Discord lounge.",
      note: "Membership perks are applied through the official support/store flow. Make sure your Discord account is linked to your Tebex profile for automatic role assignment.",
      benefits: [
        {
          title: "Exclusive Add-On Car Collection",
          text: "Access a curated selection of custom-modeled vehicles. These are unique, non-branded assets designed specifically for the server to keep the experience high quality and immersive. Access is granted through the in-game Car Dealerships locations. For the full list of membership cars, please use the link below.",
          linkLabel: "Click Here",
          href: "/help/memberships/silver/cars"
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
        },
        {
          title: "Free Vehicle List",
          text: "View the vehicles currently listed as Free access.",
          linkLabel: "View Free car list",
          href: "/help/memberships/free/cars"
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
    if (parts[0] === "help" && (parts[1] === "memberships" || parts[1] === "membership") && parts[2]) {
      return helpMembershipPages[parts[2]] ? parts[2] : null;
    }
    if (parts[0] !== "help" || !parts[1]) return null;
    return helpMembershipPages[parts[1]] ? parts[1] : null;
  }

  function getMembershipCarsIdFromPath() {
    const clean = getEnhancedRoutePath();
    const parts = clean.split("/").filter(Boolean);
    if (parts[0] !== "help" || (parts[1] !== "memberships" && parts[1] !== "membership") || parts[3] !== "cars") return null;
    return helpMembershipPages[parts[2]] ? parts[2] : null;
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

    const membershipCarsId = getMembershipCarsIdFromPath();
    if (membershipCarsId) {
      if (typeof clearServerStatusPageState === "function") clearServerStatusPageState();
      if (typeof destroyCustomMap === "function") destroyCustomMap();
      if (typeof updateDockActive === "function") updateDockActive("help");
      if (typeof setSearchVisible === "function") setSearchVisible(false);
      if (typeof clearTopMeta === "function") clearTopMeta();

      document.body.classList.remove("is-landing", "is-map", "is-wiki", "is-vehicles");
      document.body.classList.add("is-standard", "is-membership", "is-membership-cars");
      renderMembershipCarsPage(membershipCarsId);
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
    const vehicleCounts = typeof VEHICLE_SHOWCASE !== "undefined"
      ? ["free", "silver", "gold"].reduce((acc, tier) => {
          acc[tier] = VEHICLE_SHOWCASE.filter((vehicle) => vehicle.membership === tier).length;
          return acc;
        }, {})
      : { free: 0, silver: 0, gold: 0 };

    return `
      <div class="home-main">
        <section class="home-main__hero" aria-label="Welcome" data-reveal>
          <div class="home-main__copy">
            <h1>SGCNR</h1>
            <p>Join from FiveM, read the rules, check the live status, and use Discord for support.</p>
            <div class="home-main__actions">
              <a class="auth__btn auth__btn--primary" href="/rules">Rules</a>
              <a class="auth__btn" href="/live">Live</a>
              <a class="auth__btn" href="/help">Help</a>
              <a class="auth__btn" href="${escapeHtml(DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord</a>
            </div>
          </div>
          <div class="home-main__status" id="homefrontStatusGrid">
            ${renderHomefrontStatusCards(null)}
          </div>
        </section>

        <section class="home-main__routes" aria-label="Main links">
          <a class="home-main__route" href="/rules" data-reveal>
            <span>Rules</span>
            <strong>Discord and in-game rule sections.</strong>
          </a>
          <a class="home-main__route" href="/live" data-reveal>
            <span>Live</span>
            <strong>Server status, bot status, and staff list.</strong>
          </a>
          <a class="home-main__route" href="/help" data-reveal>
            <span>General Help</span>
            <strong>Memberships, events, jobs, and support links.</strong>
          </a>
        </section>

        <section class="home-main__split" aria-label="Useful links">
          <article class="home-main__panel home-main__panel--vehicles" data-reveal>
            <div>
              <span class="home-main__eyebrow">Vehicles</span>
              <h2>Cars by membership</h2>
            </div>
            <div class="home-main__tierList">
              <a href="/help/memberships/gold/cars"><span>Gold Vehicles</span><strong>${escapeHtml(String(vehicleCounts.gold || 0))}</strong></a>
              <a href="/help/memberships/silver/cars"><span>Silver Vehicles</span><strong>${escapeHtml(String(vehicleCounts.silver || 0))}</strong></a>
              <a href="/help/memberships/free/cars"><span>Free Vehicles</span><strong>${escapeHtml(String(vehicleCounts.free || 0))}</strong></a>
            </div>
          </article>

          <article class="home-main__panel" data-reveal>
            <div>
              <span class="home-main__eyebrow">General Help</span>
              <h2>Support and info</h2>
              <p>Use Help for memberships, server events, jobs, rules, and Discord support.</p>
            </div>
            <div class="home-main__actions home-main__actions--panel">
              <a class="auth__btn auth__btn--primary" href="/help">Open Help</a>
              <a class="auth__btn" href="${escapeHtml(DISCORD_TICKET_CHANNEL_URL || DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Discord tickets</a>
              <a class="auth__btn" href="/live#staff-list">Staff list</a>
            </div>
          </article>
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
    hydrateHomefrontStatus();
  };

  renderLandingHome = function renderLandingHomeFinalPass() {
    setView(renderLandingHubHomeMarkup());
    hydrateHomefrontStatus();
  };

  renderHelp = function renderHelpCleanSlate() {
    const topics = [
      {
        label: "Memberships",
        text: "Vehicle access lists for Free, Silver, and Gold.",
        memberships: [
          {
            name: "Gold",
            meta: "Highest supporter tier",
            detail: "Gold perks and vehicle list.",
            href: "/help/memberships/gold"
          },
          {
            name: "Silver",
            meta: "Standard supporter tier",
            detail: "Silver perks and vehicle list.",
            href: "/help/memberships/silver"
          },
          {
            name: "Free",
            meta: "Default player access",
            detail: "Free access and vehicle list.",
            href: "/help/memberships/free"
          }
        ]
      },
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
              ${topic.memberships ? `
                <article class="help-clean__item help-clean__item--membership">
                  <strong>${escapeHtml(topic.label)}</strong>
                  <span>${escapeHtml(topic.text)}</span>
                  <div class="help-clean__membershipList">
                    ${topic.memberships.map((item) => `
                      <a class="help-clean__membershipLink" href="${escapeHtml(item.href)}">
                        <span>
                          <strong>${escapeHtml(item.name)}</strong>
                          <em>${escapeHtml(item.meta)}</em>
                        </span>
                        <small>${escapeHtml(item.detail)}</small>
                      </a>
                    `).join("")}
                  </div>
                </article>
              ` : `
                <a class="help-clean__item" href="${escapeHtml(topic.href)}"${topic.external ? ' target="_blank" rel="noopener noreferrer" data-no-route="true"' : ""}>
                  <strong>${escapeHtml(topic.label)}</strong>
                  <span>${escapeHtml(topic.text)}</span>
                </a>
              `}
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

  function getMembershipVehicleGroups(packageId) {
    if (typeof VEHICLE_SHOWCASE === "undefined") return [];
    const labels = ["Civilian Vehicle", "Free Vehicle", "Police Vehicle", "EMS Vehicle", "Work Vehicle", "Fire Vehicle", "Armored Truck"];
    const vehicles = VEHICLE_SHOWCASE.filter((vehicle) => vehicle.membership === packageId);
    return labels
      .map((label) => ({
        label,
        vehicles: vehicles.filter((vehicle) => vehicle.type === label)
      }))
      .filter((group) => group.vehicles.length);
  }

  function getMembershipCarTitle(packageId) {
    if (packageId === "gold") return "Gold cars";
    if (packageId === "silver") return "Silver cars";
    return "Free cars";
  }

  function renderMembershipCarsPage(packageId) {
    const membership = helpMembershipPages[packageId];
    const groups = getMembershipVehicleGroups(packageId);
    const total = groups.reduce((sum, group) => sum + group.vehicles.length, 0);
    const title = getMembershipCarTitle(packageId);

    setView(`
      <div class="neo-help neo-membership membership-cars">
        ${renderHeader(title, [
          { label: "Help", href: "/help" },
          { label: membership?.title || title, href: `/help/memberships/${escapeHtml(packageId)}` },
          { label: "Cars" }
        ], { showBadge: false })}

        <section class="section neo-membership__hero membership-cars__hero" data-reveal>
          <div>
            <span class="neo-kicker">${escapeHtml(membership?.eyebrow || "Membership vehicles")}</span>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(total ? `${total} vehicles are listed for this membership tier.` : "No vehicles are listed for this membership tier right now.")}</p>
          </div>
          <a class="auth__btn auth__btn--primary" href="/vehicles">Open full vehicle list</a>
        </section>

        <section class="membership-cars__tabs" aria-label="Membership car links" data-reveal>
          <a class="${packageId === "free" ? "is-active" : ""}" href="/help/memberships/free/cars">Free</a>
          <a class="${packageId === "silver" ? "is-active" : ""}" href="/help/memberships/silver/cars">Silver</a>
          <a class="${packageId === "gold" ? "is-active" : ""}" href="/help/memberships/gold/cars">Gold</a>
        </section>

        <section class="membership-cars__groups" aria-label="${escapeHtml(title)} list">
          ${groups.map((group) => `
            <article class="membership-cars__group" data-reveal>
              <div class="membership-cars__groupHead">
                <h3>${escapeHtml(group.label.replace(" Vehicle", "").replace("Free", "Free cars"))}</h3>
                <span>${escapeHtml(String(group.vehicles.length))}</span>
              </div>
              <div class="membership-cars__grid">
                ${group.vehicles.map((vehicle) => `
                  <a class="membership-cars__card" href="/vehicles" data-vehicle-link="${escapeHtml(vehicle.id)}">
                    <span class="membership-cars__image">
                      <img src="${escapeHtml(getVehicleImageUrl(vehicle))}" alt="${escapeHtml(vehicle.name)}" loading="lazy" decoding="async" />
                    </span>
                    <strong>${escapeHtml(vehicle.name)}</strong>
                    <small>${escapeHtml(vehicle.type)}</small>
                  </a>
                `).join("")}
              </div>
            </article>
          `).join("") || `
            <article class="membership-cars__empty" data-reveal>
              <h3>No cars listed</h3>
              <p>This tier has no public vehicle entries on the website right now.</p>
            </article>
          `}
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
      "ingame-rules": "Use Discord for current in-game rule questions."
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
          ${body || `<div class="empty">No rule text is published for this item.</div>`}
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
