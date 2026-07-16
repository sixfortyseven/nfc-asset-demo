(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function statusPill(status) {
    const s = String(status || "").toLowerCase();
    let cls = "muted";
    if (s.includes("service") || s === "matched") cls = "ok";
    else if (s.includes("variance") || s.includes("checkout") || s.includes("checked"))
      cls = "warn";
    else if (s.includes("calibrat")) cls = "warn";
    return `<span class="pill ${cls}">${status}</span>`;
  }

  function countPill(status) {
    const s = String(status || "").toLowerCase();
    const cls = s === "matched" ? "ok" : s === "variance" ? "bad" : "muted";
    return `<span class="pill ${cls}">${status}</span>`;
  }

  function assetHref(id) {
    return `asset.html?id=${encodeURIComponent(id)}`;
  }

  function renderHome() {
    const grid = qs("#asset-grid");
    if (!grid || !window.ASSET_DATA) return;

    grid.innerHTML = window.ASSET_DATA.assets
      .map(
        (a) => `
      <a class="asset-card" href="${assetHref(a.id)}">
        <p class="asset-id">${a.id}</p>
        <h3>${a.name}</h3>
        <p class="meta">${a.location}<br>${a.department}</p>
        <p style="margin:0.75rem 0 0">${statusPill(a.status)}</p>
      </a>`
      )
      .join("");

    const sample = qs("#sample-nfc-url");
    if (sample) {
      const first = window.ASSET_DATA.assets[0];
      sample.textContent = new URL(assetHref(first.id), window.location.href).href;
    }
  }

  function renderAssetPage() {
    const root = qs("#asset-root");
    if (!root || !window.getAssetById) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "";
    const asset = window.getAssetById(id);

    if (!asset) {
      root.innerHTML = `
        <div class="panel missing">
          <h1>Asset not found</h1>
          <p class="lede" style="margin:0.75rem auto 1.25rem">No record for <code>${id || "(missing id)"}</code>.</p>
          <a class="btn btn-primary" href="index.html">Back to assets</a>
        </div>`;
      return;
    }

    document.title = `${asset.id} · ${asset.name}`;

    const formUrl = window.ASSET_DATA.requestFormUrl;
    const cc = asset.cycleCount;
    const deepLink = new URL(assetHref(asset.id), window.location.href).href;

    root.innerHTML = `
      <section class="detail-hero">
        <p class="eyebrow">NFC asset record</p>
        <div class="row">
          <span class="asset-id" style="margin:0">${asset.id}</span>
          ${statusPill(asset.status)}
          ${countPill(cc.countStatus)}
        </div>
        <h1>${asset.name}</h1>
        <p class="lede">${asset.description}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${formUrl}" target="_blank" rel="noopener noreferrer">Open request form</a>
          <a class="btn btn-secondary" href="cycle-count.html">Cycle count overview</a>
        </div>
      </section>

      <section class="panel section" aria-labelledby="basic-info-heading">
        <div class="section-head">
          <div>
            <h2 id="basic-info-heading">Basic information</h2>
            <p>Identity, custody, and placement for this tagged asset.</p>
          </div>
        </div>
        <dl class="kv-grid">
          <div class="kv"><dt>Category</dt><dd>${asset.category}</dd></div>
          <div class="kv"><dt>Department</dt><dd>${asset.department}</dd></div>
          <div class="kv"><dt>Location</dt><dd>${asset.location}</dd></div>
          <div class="kv"><dt>Custodian</dt><dd>${asset.custodian}</dd></div>
          <div class="kv"><dt>Manufacturer</dt><dd>${asset.manufacturer}</dd></div>
          <div class="kv"><dt>Model</dt><dd>${asset.model}</dd></div>
          <div class="kv"><dt>Serial number</dt><dd>${asset.serialNumber}</dd></div>
          <div class="kv"><dt>Purchase date</dt><dd>${asset.purchaseDate}</dd></div>
          <div class="kv"><dt>NFC UID</dt><dd>${asset.nfcUid}</dd></div>
          <div class="kv"><dt>Status</dt><dd>${asset.status}</dd></div>
        </dl>
      </section>

      <section class="panel section nfc-hint" aria-labelledby="request-heading">
        <div class="section-head">
          <div>
            <h2 id="request-heading">Request form</h2>
            <p>Submit service, move, or support requests for this asset.</p>
          </div>
          <a class="btn btn-primary" href="${formUrl}" target="_blank" rel="noopener noreferrer">Open form</a>
        </div>
        <p class="meta">Form link: <a href="${formUrl}" target="_blank" rel="noopener noreferrer">${formUrl}</a></p>
        <p class="meta" style="margin-top:0.75rem">Encode this URL on the NFC tag so a scan opens this page:</p>
        <div class="nfc-url">${deepLink}</div>
      </section>

      <section class="panel section" aria-labelledby="cycle-heading">
        <div class="section-head">
          <div>
            <h2 id="cycle-heading">Cycle count inventory</h2>
            <p>Latest physical count against the expected record.</p>
          </div>
          <a class="btn btn-secondary" href="cycle-count.html">View all counts</a>
        </div>
        <div class="stats">
          <div class="stat"><span class="meta">Expected qty</span><strong>${cc.expectedQty}</strong></div>
          <div class="stat"><span class="meta">Counted qty</span><strong>${cc.countedQty}</strong></div>
          <div class="stat"><span class="meta">Variance</span><strong>${cc.variance}</strong></div>
          <div class="stat"><span class="meta">Status</span><strong style="font-size:1.1rem;margin-top:0.55rem">${cc.countStatus}</strong></div>
        </div>
        <dl class="kv-grid">
          <div class="kv"><dt>Last counted</dt><dd>${cc.lastCounted}</dd></div>
          <div class="kv"><dt>Next due</dt><dd>${cc.nextDue}</dd></div>
          <div class="kv"><dt>Counted by</dt><dd>${cc.countedBy}</dd></div>
          <div class="kv"><dt>Bin location</dt><dd>${cc.binLocation}</dd></div>
        </dl>
        <p class="meta" style="margin-top:1rem"><strong>Notes:</strong> ${cc.notes}</p>
      </section>`;
  }

  function renderCycleCount() {
    const body = qs("#cycle-table-body");
    const stats = qs("#cycle-stats");
    if (!body || !window.ASSET_DATA) return;

    const assets = window.ASSET_DATA.assets;
    const matched = assets.filter((a) => a.cycleCount.countStatus === "Matched").length;
    const variance = assets.filter((a) => a.cycleCount.countStatus === "Variance").length;
    const dueSoon = assets.filter((a) => {
      const due = new Date(a.cycleCount.nextDue);
      const today = new Date("2026-07-16");
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      return diff <= 14;
    }).length;

    if (stats) {
      stats.innerHTML = `
        <div class="stat"><span class="meta">Assets</span><strong>${assets.length}</strong></div>
        <div class="stat"><span class="meta">Matched</span><strong>${matched}</strong></div>
        <div class="stat"><span class="meta">Variance</span><strong>${variance}</strong></div>
        <div class="stat"><span class="meta">Due ≤ 14 days</span><strong>${dueSoon}</strong></div>`;
    }

    body.innerHTML = assets
      .map((a) => {
        const cc = a.cycleCount;
        return `<tr>
          <td><a href="${assetHref(a.id)}"><strong>${a.id}</strong></a><div class="meta">${a.name}</div></td>
          <td>${cc.binLocation}<div class="meta">${a.location}</div></td>
          <td>${cc.expectedQty}</td>
          <td>${cc.countedQty}</td>
          <td>${cc.variance}</td>
          <td>${countPill(cc.countStatus)}</td>
          <td>${cc.lastCounted}<div class="meta">Next ${cc.nextDue}</div></td>
          <td>${cc.countedBy}</td>
        </tr>`;
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "home") renderHome();
    if (page === "asset") renderAssetPage();
    if (page === "cycle") renderCycleCount();
  });
})();
