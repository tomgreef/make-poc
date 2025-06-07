import { S as x } from "./sign-Qc7VEKxk.mjs";
class b extends HTMLElement {
  constructor() {
    super(),
      (this._urlOrPrefix = ""),
      (this._jwt = ""),
      (this._secretKey = ""),
      (this._keyId = ""),
      (this._userId = ""),
      (this._integrations = []),
      (this._openIntegrationIndex = -1),
      (this._currentPage = 1),
      (this._itemsPerPage = 10),
      this.attachShadow({ mode: "open" }),
      (this._onOutsideClick = this._onOutsideClick.bind(this));
  }
  static get observedAttributes() {
    return ["urlorprefix", "jwt", "secretkey", "keyid", "userid"];
  }
  // Reflect attributes to internal fields
  attributeChangedCallback(e, t, i) {
    if (i !== null) {
      switch (e) {
        case "urlorprefix":
          this._urlOrPrefix = i;
          break;
        case "jwt":
          this._jwt = i;
          break;
        case "secretkey":
          this._secretKey = i;
          break;
        case "keyid":
          this._keyId = i;
          break;
        case "userid":
          this._userId = i;
          break;
      }
      this._render();
    }
  }
  connectedCallback() {
    document.addEventListener("click", this._onOutsideClick, !0),
      this.fetchIntegrations().then(() => {
        this._render();
      });
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onOutsideClick, !0);
  }
  // --- Public/Utility methods (mirroring original) ---
  async fetchIntegrations() {
    try {
      const t = await (
        await fetch(`${this._urlOrPrefix}/api/bridge/integrations`, {
          method: "GET",
          headers: {
            Authorization: await this.getAuthorizationHeader(),
            "Content-Type": "application/json",
          },
        })
      ).json();
      this._integrations = t.integrations;
    } catch (e) {
      console.error("Error fetching integrations:", e);
    }
  }
  async toggleIntegration(e) {
    try {
      const t = this._integrations[e];
      if (!t || !t.scenario.id) return;
      const i = t.scenario.isActive ? "deactivate" : "activate";
      await fetch(
        `${this._urlOrPrefix}/api/bridge/integrations/${t.scenario.id}/${i}`,
        {
          method: "POST",
          headers: {
            Authorization: await this.getAuthorizationHeader(),
          },
        }
      ),
        (t.scenario.isActive = !t.scenario.isActive),
        this._render();
    } catch (t) {
      console.error("Error toggling integration:", t);
    }
  }
  async removeIntegration(e) {
    try {
      const t = this._integrations[e];
      if (!t || !t.scenario.id) return;
      await fetch(
        `${this._urlOrPrefix}/api/bridge/integrations/${t.scenario.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: await this.getAuthorizationHeader(),
          },
        }
      ),
        await this.fetchIntegrations(),
        this._render();
    } catch (t) {
      console.error("Error removing integration:", t);
    }
  }
  async connectIntegration(e) {
    try {
      const t = this._integrations[e];
      if (!t) return;
      const i = t.template.publicVersionId;
      if (!i) {
        console.warn("No publicVersionId found for this integration.");
        return;
      }
      const a = (
          await (
            await fetch(
              `${this._urlOrPrefix}/api/bridge/integrations/init/${i}`,
              {
                method: "POST",
                headers: {
                  Authorization: await this.getAuthorizationHeader(),
                },
              }
            )
          ).json()
        ).publicUrl,
        c = window.open(a, "_blank"),
        g = setInterval(async () => {
          (!c || c.closed) &&
            (clearInterval(g), await this.fetchIntegrations(), this._render());
        }, 500);
    } catch (t) {
      console.error("Error connecting integration:", t);
    }
  }
  async getAuthorizationHeader() {
    if (this._secretKey && this._keyId && this._userId)
      return `Bearer ${await this.getJWT(
        this._secretKey,
        this._keyId,
        this._userId
      )}`;
    if (this._jwt) return `Bearer ${this._jwt}`;
  }
  async getJWT(e, t, i) {
    const s = new TextEncoder().encode(e),
      l = {
        sub: i,
        jti: crypto.randomUUID(),
      },
      a = { alg: "HS256", typ: "JWT", kid: t };
    return await new x(l)
      .setProtectedHeader(a)
      .setExpirationTime("2m")
      .setIssuedAt()
      .sign(s);
  }
  prevPage() {
    this._currentPage > 1 && (this._currentPage--, this._render());
  }
  nextPage() {
    const e = Math.ceil(this._integrations.length / this._itemsPerPage);
    this._currentPage < e && (this._currentPage++, this._render());
  }
  // --- Internal event handlers ---
  _onOutsideClick(e) {
    if (!e.composedPath().includes(this)) {
      (this._openIntegrationIndex = -1), this._render();
      return;
    }
    const t = e.composedPath();
    for (const i of t)
      if (
        (i instanceof Element && i.classList.contains("pill-button")) ||
        (i instanceof Element && i.classList.contains("context-menu-content"))
      )
        return;
    (this._openIntegrationIndex = -1), this._render();
  }
  _openContextMenu(e, t) {
    e.stopPropagation(),
      console.log(t),
      console.log(this._openIntegrationIndex),
      (this._openIntegrationIndex = this._openIntegrationIndex === t ? -1 : t),
      console.log(this._openIntegrationIndex),
      this._render();
  }
  // --- Rendering ---
  _render() {
    if (!this.shadowRoot) return;
    const e = (this._currentPage - 1) * this._itemsPerPage,
      t = e + this._itemsPerPage,
      i = this._integrations.slice(e, t),
      s = Math.ceil(this._integrations.length / this._itemsPerPage),
      l =
        i.length > 0
          ? i
              .map((n, r) => {
                const o = e + r,
                  d = !!n.scenario.id,
                  h = d
                    ? `<div 
                  class="toggle-button ${n.scenario.isActive ? "active" : ""}" 
                  data-toggle-index="${o}"
               ></div>`
                    : "",
                  u = d
                    ? `
            <div class="context-menu-wrapper">
              <button class="pill-button" data-context-menu-index="${o}">
                •••
              </button>
              ${
                this._openIntegrationIndex === o
                  ? `
                  <div class="context-menu-content">
                    <button class="delete-button" data-delete-index="${o}">Delete</button>
                  </div>
                `
                  : ""
              }
            </div>`
                    : "",
                  p = d
                    ? ""
                    : `
            <button class="connect-button" data-connect-index="${o}">
              Connect
            </button>
          `;
                return `
            <div class="integration-item" data-integration-index="${o}">
              <div class="integration-title">${n.scenario.name}</div>
              <div class="action-bar">
                ${h}
                ${u}
                ${p}
              </div>
            </div>
          `;
              })
              .join("")
          : `
        <div class="no-integrations">
          <div class="integration-icon">🚀</div>
          <h2>Automate your process now</h2>
          <p class="subheader">Explore available integrations and automate in a few steps</p>
        </div>
      `,
      a =
        this._integrations.length > this._itemsPerPage
          ? `
        <div class="pagination">
          <button data-prev-page ${
            this._currentPage === 1 ? "disabled" : ""
          }>Previous</button>
          <span>Page ${this._currentPage} of ${s}</span>
          <button data-next-page ${
            this._currentPage === s ? "disabled" : ""
          }>Next</button>
        </div>
      `
          : "";
    (this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Inter', Arial, sans-serif;
        }
        .integration-list {
          height: calc(100% - 40px);
          overflow-y: auto;
        }
        .integration-item {
          display: flex;
          align-items: center;
          padding: 12px 0px;
          transition: background-color 0.3s;
          border-bottom: 1px solid lightgrey;
        }
        .integration-item:last-child {
          border-bottom: none;
        }
        .integration-title {
          flex-grow: 1;
          font-weight: 500;
        }
        .action-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 100px;
        }
        .toggle-button {
          width: 40px;
          height: 20px;
          margin: 5px 0px;
          background-color: lightgrey;
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .toggle-button::after {
          content: '';
          width: 18px;
          height: 18px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
          transition: transform 0.2s;
        }
        .toggle-button.active {
          background-color: green;
        }
        .toggle-button.active::after {
          transform: translateX(20px);
        }
        .connect-button {
          background-color: #f3f5f6;
          color: black;
          border: lightgrey 1px solid;
          border-radius: 8px;
          padding: 7.5px 16px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }
        .pill-button {
          background-color: #f3f5f6;
          color: black;
          border: lightgrey 1px solid;
          border-radius: 16px;
          padding: 5px 12px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        .context-menu-wrapper {
          position: relative;
          display: inline-block;
        }
        .context-menu-content {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border: 1px solid lightgrey;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          z-index: 1;
          border-radius: 8px;
          min-width: 80px;
        }
        .delete-button {
          width: 100%;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 0;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
        }
        .pagination button {
          background-color: #f3f5f6;
          border: 1px solid lightgrey;
          border-radius: 4px;
          padding: 5px 10px;
          margin: 0 5px;
          cursor: pointer;
        }
        .pagination button[disabled] {
          cursor: not-allowed;
          opacity: 0.5;
        }
      </style>

      <div class="integration-list">
        ${l}
      </div>
      ${a}
    `),
      this.shadowRoot.querySelectorAll(".toggle-button").forEach((n) => {
        n.addEventListener("click", () => {
          const r = n.getAttribute("data-toggle-index");
          if (r !== null) {
            const o = parseInt(r, 10);
            this.toggleIntegration(o);
          }
        });
      }),
      this.shadowRoot
        .querySelectorAll("[data-context-menu-index]")
        .forEach((n) => {
          n.addEventListener("click", (r) => {
            const o = n.getAttribute("data-context-menu-index");
            if (o !== null) {
              const d = parseInt(o, 10);
              this._openContextMenu(r, d);
            }
          });
        }),
      this.shadowRoot.querySelectorAll("[data-delete-index]").forEach((n) => {
        n.addEventListener("click", () => {
          const r = n.getAttribute("data-delete-index");
          if (r !== null) {
            const o = parseInt(r, 10);
            this.removeIntegration(o);
          }
        });
      }),
      this.shadowRoot.querySelectorAll("[data-connect-index]").forEach((n) => {
        n.addEventListener("click", () => {
          const r = n.getAttribute("data-connect-index");
          if (r !== null) {
            const o = parseInt(r, 10);
            this.connectIntegration(o);
          }
        });
      });
    const c = this.shadowRoot.querySelector("[data-prev-page]");
    c && c.addEventListener("click", () => this.prevPage());
    const g = this.shadowRoot.querySelector("[data-next-page]");
    g && g.addEventListener("click", () => this.nextPage());
  }
}
customElements.define("portal-integrations", b);
export { b as PortalIntegrations };
