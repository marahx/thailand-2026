import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─── */
const DEFAULT_ITINERARY = [
  { id: 1, type: "stay", icon: "🏨", title: "Bangkok — Arrivée", subtitle: "PAAK Hotel Suvarnabhumi", dates: "12 – 13 Nov", nights: "1 nuit", details: "Repos après le vol. Profitez de l'hôtel près de l'aéroport.", color: "#E8A838", editable: true },
  { id: 2, type: "travel", icon: "🚌", title: "Bangkok → Koh Kood", subtitle: "Bus + Bateau via Trat", dates: "13 Nov", duration: "7h (06:00 → 13:00)", details: "Départ 06h00 de Bangkok en bus jusqu'à Trat, puis bateau pour Koh Kood. Arrivée 13h00.", color: "#3B8686", editable: true },
  { id: 3, type: "stay", icon: "🏝️", title: "Koh Kood", subtitle: "Koh Kood Resort", dates: "13 – 17 Nov", nights: "4 nuits", details: "Île paradisiaque, plages désertes, eaux cristallines. Snorkeling, kayak & détente.", color: "#0B7A75", editable: true },
  { id: 4, type: "travel", icon: "⛴️", title: "Koh Kood → Koh Chang", subtitle: "Bateau inter-îles", dates: "17 Nov", duration: "~2-3h", details: "Transfert en bateau de Koh Kood à Koh Chang.", color: "#3B8686", editable: true },
  { id: 5, type: "stay", icon: "🌴", title: "Koh Chang", subtitle: "AANA Resort & Villas", dates: "17 – 22 Nov", nights: "5 nuits", details: "Resort luxueux face à la mer. Jungle, cascades, marchés nocturnes.", color: "#2A6041", editable: true },
  { id: 6, type: "travel", icon: "🚌", title: "Koh Chang → Bangkok", subtitle: "Bateau + Bus retour", dates: "22 Nov", duration: "6h40 (13:50 → 20:30)", details: "Départ 13h50 de Koh Chang, bateau puis bus. Arrivée Bangkok 20h30.", color: "#3B8686", editable: true },
  { id: 7, type: "stay", icon: "🏙️", title: "Bangkok — Exploration", subtitle: "Hôtel à confirmer", dates: "22 – 25 Nov", nights: "3 nuits", details: "Temples, street food, marchés flottants, rooftop bars & shopping.", color: "#E8A838", editable: true },
];

const PLANNING_DAYS = [
  { key: "nov12", label: "12 Nov", loc: "Bangkok", icon: "🏨" },
  { key: "nov13", label: "13 Nov", loc: "Trajet → Koh Kood", icon: "🚌" },
  { key: "nov14", label: "14 Nov", loc: "Koh Kood", icon: "🏝️" },
  { key: "nov15", label: "15 Nov", loc: "Koh Kood", icon: "🏝️" },
  { key: "nov16", label: "16 Nov", loc: "Koh Kood", icon: "🏝️" },
  { key: "nov17", label: "17 Nov", loc: "→ Koh Chang", icon: "⛴️" },
  { key: "nov18", label: "18 Nov", loc: "Koh Chang", icon: "🌴" },
  { key: "nov19", label: "19 Nov", loc: "Koh Chang", icon: "🌴" },
  { key: "nov20", label: "20 Nov", loc: "Koh Chang", icon: "🌴" },
  { key: "nov21", label: "21 Nov", loc: "Koh Chang", icon: "🌴" },
  { key: "nov22", label: "22 Nov", loc: "→ Bangkok", icon: "🚌" },
  { key: "nov23", label: "23 Nov", loc: "Bangkok", icon: "🏙️" },
  { key: "nov24", label: "24 Nov", loc: "Bangkok", icon: "🏙️" },
];

const DEFAULT_RATES = { USD: 1.08, THB: 37.5 };
const fmt = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function loadStorage(key, fb) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fb; } catch { return fb; } }
async function saveStorage(key, v) { try { await window.storage.set(key, JSON.stringify(v)); } catch {} }

/* ─── BACK BUTTON ─── */
function Back({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, border: "1px solid #f0c24d44",
      background: "#f0c24d15", color: "#f0c24d", fontSize: 14, fontWeight: 700,
      cursor: "pointer", padding: "10px 18px", borderRadius: 12, margin: "0 16px 14px",
      WebkitTapHighlightColor: "transparent",
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>‹</span> {label}
    </button>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function App() {
  const [tab, setTab] = useState("itinerary");
  const [itinerary, setItinerary] = useState(DEFAULT_ITINERARY);
  const [plans, setPlans] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { (async () => {
    setItinerary(await loadStorage("thai-itinerary", DEFAULT_ITINERARY));
    setPlans(await loadStorage("thai-plans", {}));
    setLoaded(true);
  })(); }, []);

  useEffect(() => { if (loaded) saveStorage("thai-itinerary", itinerary); }, [itinerary, loaded]);
  useEffect(() => { if (loaded) saveStorage("thai-plans", plans); }, [plans, loaded]);

  const tabs = [
    { key: "itinerary", icon: "📍", label: "Parcours" },
    { key: "planning", icon: "📋", label: "Planning" },
    { key: "currency", icon: "💱", label: "Devises" },
    { key: "chat", icon: "💬", label: "Chat" },
  ];

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column",
      background: "#0c1e2b", fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
      color: "#d4e4ed", overflow: "hidden", position: "relative",
    }}>
      {/* iOS status bar space */}
      <div style={{ minHeight: "env(safe-area-inset-top, 10px)", background: "#0a1820", flexShrink: 0 }} />

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
        background: "#0a1820", borderBottom: "1px solid #1a3048", flexShrink: 0,
      }}>
        <span style={{ fontSize: 30 }}>🇹🇭</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f0c24d" }}>Thaïlande 2026</h1>
          <p style={{ margin: 0, fontSize: 11, color: "#5e879e", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>12 – 25 Novembre</p>
        </div>
      </header>

      {/* Content — scrollable */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingTop: 12 }}>
        {tab === "itinerary" && <Itinerary items={itinerary} setItems={setItinerary} />}
        {tab === "planning" && <Planning plans={plans} setPlans={setPlans} />}
        {tab === "currency" && <Currency />}
        {tab === "chat" && <Chat />}
      </main>

      {/* Bottom Nav — safe area integrated */}
      <nav style={{
        display: "flex", justifyContent: "space-around",
        padding: "8px 6px calc(4px + env(safe-area-inset-bottom, 6px))",
        background: "#070f16", borderTop: "1px solid #1a3048", flexShrink: 0,
      }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            border: "none", cursor: "pointer", padding: "6px 16px", borderRadius: 10,
            background: tab === t.key ? "#f0c24d18" : "transparent",
            color: tab === t.key ? "#f0c24d" : "#4a6d82",
            WebkitTapHighlightColor: "transparent",
          }}>
            <span style={{ fontSize: 21 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════ ITINERARY ═══════════════════ */
function Itinerary({ items, setItems }) {
  const [view, setView] = useState("list");
  const [selId, setSelId] = useState(null);
  const [editF, setEditF] = useState({});
  const sel = items.find((i) => i.id === selId);

  if (view === "list") return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Pill icon="🌙" value="13 nuits" /><Pill icon="🏝️" value="2 îles" /><Pill icon="🚌" value="~14h trajet" />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 17, top: 10, bottom: 10, width: 2, background: "#152a3a", borderRadius: 1 }} />
        {items.map((item) => (
          <div key={item.id} onClick={() => { setSelId(item.id); setView("detail"); }}
            style={{
              position: "relative", marginLeft: 36, marginBottom: 10, padding: "14px 14px",
              background: "#0e2535", borderRadius: "0 14px 14px 0", cursor: "pointer",
              border: "1px solid #162d40", borderLeft: `3px solid ${item.color}`,
              WebkitTapHighlightColor: "transparent",
            }}>
            <div style={{ position: "absolute", left: -44, top: 19, width: 12, height: 12, borderRadius: "50%", background: item.color, boxShadow: `0 0 0 4px ${item.color}33` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#e0ebf2" }}>{item.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5e879e" }}>{item.subtitle}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#5e879e", fontWeight: 600 }}>{item.dates}</p>
                <span style={{
                  display: "inline-block", marginTop: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
                  color: item.type === "stay" ? "#f0c24d" : "#4ade80",
                  background: item.type === "stay" ? "#f0c24d15" : "#4ade8015",
                }}>{item.type === "stay" ? item.nights : item.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === "detail" && sel) return (
    <div style={{ paddingBottom: 24 }}>
      <Back onClick={() => { setView("list"); setSelId(null); }} label="Parcours" />
      <div style={{ margin: "0 16px", padding: "20px 18px", background: "#0e2535", borderRadius: 18, border: `1px solid ${sel.color}55` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 34 }}>{sel.icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#e0ebf2" }}>{sel.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#5e879e" }}>{sel.subtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <InfoBox label="DATES" value={sel.dates} color="#f0c24d" />
          <InfoBox label={sel.type === "stay" ? "SÉJOUR" : "DURÉE"} value={sel.type === "stay" ? sel.nights : sel.duration} color="#4ade80" />
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#8aa8bb", lineHeight: 1.6 }}>{sel.details}</p>
        {sel.editable && (
          <button onClick={() => { setEditF({ subtitle: sel.subtitle, dates: sel.dates }); setView("edit"); }}
            style={{
              width: "100%", padding: "12px", border: "1px solid #f0c24d44", borderRadius: 12,
              background: "#f0c24d12", color: "#f0c24d", fontSize: 13, fontWeight: 700, cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}>
            ✏️ Modifier {sel.type === "stay" ? "hôtel" : "transport"} / dates
          </button>
        )}
      </div>
    </div>
  );

  if (view === "edit" && sel) return (
    <div style={{ paddingBottom: 24 }}>
      <Back onClick={() => setView("detail")} label="Retour" />
      <div style={{ margin: "0 16px", padding: "20px 18px", background: "#0e2535", borderRadius: 18, border: "1px solid #162d40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 28 }}>{sel.icon}</span>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#e0ebf2" }}>{sel.title}</p>
        </div>
        <label style={S.label}>{sel.type === "stay" ? "Hébergement" : "Transport"}</label>
        <input value={editF.subtitle} onChange={(e) => setEditF((f) => ({ ...f, subtitle: e.target.value }))} style={{ ...S.input, marginBottom: 14 }} />
        <label style={S.label}>Dates</label>
        <input value={editF.dates} onChange={(e) => setEditF((f) => ({ ...f, dates: e.target.value }))} style={{ ...S.input, marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => {
            setItems((p) => p.map((i) => i.id === selId ? { ...i, subtitle: editF.subtitle, dates: editF.dates } : i));
            setView("detail");
          }} style={S.btnGold}>Enregistrer</button>
          <button onClick={() => setView("detail")} style={S.btnGhost}>Annuler</button>
        </div>
      </div>
    </div>
  );
  return null;
}

function Pill({ icon, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0e2535", padding: "7px 13px", borderRadius: 20, fontSize: 12, color: "#d4e4ed", border: "1px solid #162d40" }}>
      <span>{icon}</span><span style={{ fontWeight: 700, fontSize: 12 }}>{value}</span>
    </div>
  );
}

function InfoBox({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: "10px", background: "#091720", borderRadius: 12, textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 10, color: "#5e879e", fontWeight: 700, letterSpacing: 0.5 }}>{label}</p>
      <p style={{ margin: "5px 0 0", fontSize: 15, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

/* ═══════════════════ PLANNING ═══════════════════ */
function Planning({ plans, setPlans }) {
  const [selDay, setSelDay] = useState(null);
  const [newAct, setNewAct] = useState("");
  const [newTime, setNewTime] = useState("");

  const add = (dk) => {
    if (!newAct.trim()) return;
    setPlans((p) => ({ ...p, [dk]: [...(p[dk] || []), { id: Date.now(), time: newTime || null, text: newAct.trim(), done: false }] }));
    setNewAct(""); setNewTime("");
  };
  const remove = (dk, id) => setPlans((p) => ({ ...p, [dk]: (p[dk] || []).filter((a) => a.id !== id) }));
  const toggle = (dk, id) => setPlans((p) => ({ ...p, [dk]: (p[dk] || []).map((a) => a.id === id ? { ...a, done: !a.done } : a) }));

  if (!selDay) return (
    <div style={{ padding: "0 16px 24px" }}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: "#5e879e", textAlign: "center" }}>Planifiez vos journées entre amis</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {PLANNING_DAYS.map((d) => {
          const c = (plans[d.key] || []).length;
          return (
            <button key={d.key} onClick={() => setSelDay(d.key)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
              border: "1px solid #162d40", borderRadius: 14, background: "#0e2535",
              cursor: "pointer", textAlign: "left", width: "100%",
              WebkitTapHighlightColor: "transparent",
            }}>
              <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e0ebf2" }}>{d.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5e879e" }}>{d.loc}</p>
              </div>
              {c > 0
                ? <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "#4ade8015", padding: "3px 10px", borderRadius: 8 }}>{c} activité{c > 1 ? "s" : ""}</span>
                : <span style={{ fontSize: 11, color: "#3d6177" }}>À planifier</span>}
              <span style={{ color: "#2d4f65", fontSize: 20 }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const d = PLANNING_DAYS.find((x) => x.key === selDay);
  const acts = (plans[selDay] || []).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  return (
    <div style={{ paddingBottom: 24 }}>
      <Back onClick={() => setSelDay(null)} label="Toutes les journées" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "12px 16px", background: "#0e2535", borderRadius: 14, border: "1px solid #162d40" }}>
          <span style={{ fontSize: 28 }}>{d?.icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#e0ebf2" }}>{d?.label} 2026</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#5e879e" }}>{d?.loc}</p>
          </div>
        </div>

        {acts.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <span style={{ fontSize: 30 }}>📝</span>
            <p style={{ margin: "8px 0 0", color: "#3d6177", fontSize: 13 }}>Aucune activité.<br />Ajoutez votre programme !</p>
          </div>
        )}

        {acts.map((act) => (
          <div key={act.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", marginBottom: 6,
            background: "#0e2535", borderRadius: 12, border: "1px solid #162d40", opacity: act.done ? 0.45 : 1,
          }}>
            <button onClick={() => toggle(selDay, act.id)} style={{
              width: 26, height: 26, borderRadius: 8, border: `2px solid ${act.done ? "#4ade80" : "#2d4f65"}`,
              background: act.done ? "#4ade80" : "transparent", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>{act.done && <span style={{ fontSize: 12, color: "#0c1e2b", fontWeight: 800 }}>✓</span>}</button>
            <div style={{ flex: 1 }}>
              {act.time && <span style={{ fontSize: 11, fontWeight: 700, color: "#f0c24d", background: "#f0c24d15", padding: "2px 8px", borderRadius: 6, marginRight: 6 }}>{act.time}</span>}
              <p style={{ margin: 0, fontSize: 14, color: "#d4e4ed", textDecoration: act.done ? "line-through" : "none" }}>{act.text}</p>
            </div>
            <button onClick={() => remove(selDay, act.id)} style={{ border: "none", background: "none", color: "#f87171", fontSize: 16, cursor: "pointer", padding: "6px" }}>✕</button>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: "16px", background: "#091720", borderRadius: 14, border: "1px dashed #1a3048" }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#5e879e", textTransform: "uppercase", letterSpacing: 1 }}>Nouvelle activité</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Heure" style={{ ...S.input, width: 80, flex: "none", fontSize: 13, padding: "10px 10px" }} />
            <input value={newAct} onChange={(e) => setNewAct(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add(selDay)} placeholder="Ex: Snorkeling, temple…" style={{ ...S.input, fontSize: 13, padding: "10px 12px" }} />
          </div>
          <button onClick={() => add(selDay)} disabled={!newAct.trim()}
            style={{ ...S.btnGold, opacity: newAct.trim() ? 1 : 0.35 }}>+ Ajouter</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ CURRENCY ═══════════════════ */
function Currency() {
  const [amt, setAmt] = useState("");
  const [tgt, setTgt] = useState("THB");
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [lastUp, setLastUp] = useState(null);

  const fetchR = useCallback(async () => {
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/EUR");
      const d = await r.json();
      if (d?.rates) { setRates({ USD: d.rates.USD || DEFAULT_RATES.USD, THB: d.rates.THB || DEFAULT_RATES.THB }); setLastUp(new Date().toLocaleTimeString("fr-FR")); }
    } catch {}
  }, []);

  useEffect(() => {
    fetchR();
    const on = () => { setOnline(true); fetchR(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [fetchR]);

  const val = parseFloat(amt) || 0;
  const conv = val * (rates[tgt] || 0);
  const press = (v) => {
    if (v === "⌫") return setAmt((a) => a.slice(0, -1));
    if (v === "." && amt.includes(".")) return;
    setAmt((a) => a + v);
  };

  return (
    <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: online ? "#4ade80" : "#f87171" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: online ? "#4ade80" : "#f87171", textTransform: "uppercase", letterSpacing: 1 }}>{online ? "En ligne" : "Hors ligne"}</span>
      </div>
      <div style={{ background: "#0e2535", borderRadius: 18, padding: "18px 16px", border: "1px solid #162d40" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>🇪🇺</span><span style={{ fontWeight: 800, fontSize: 16, color: "#d4e4ed" }}>EUR</span></div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f0c24d", fontVariantNumeric: "tabular-nums" }}>{amt || "0"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0", color: "#2d4f65" }}>
          <div style={{ flex: 1, height: 1, background: "#1a3048" }} /><span style={{ fontSize: 16 }}>⇅</span><div style={{ flex: 1, height: 1, background: "#1a3048" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{tgt === "THB" ? "🇹🇭" : "🇺🇸"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["THB", "USD"].map((c) => (
                <button key={c} onClick={() => setTgt(c)} style={{
                  border: "1px solid #1a3048", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", background: tgt === c ? "#f0c24d" : "#091720", color: tgt === c ? "#0c1e2b" : "#5e879e",
                  WebkitTapHighlightColor: "transparent",
                }}>{c}</button>
              ))}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f0c24d", fontVariantNumeric: "tabular-nums" }}>{fmt(conv)}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => (
          <button key={k} onClick={() => press(k)} style={{
            padding: "16px 0", border: "1px solid #162d40", borderRadius: 14,
            background: "#0e2535", color: k === "⌫" ? "#f87171" : "#d4e4ed",
            fontSize: 20, fontWeight: 700, cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}>{k}</button>
        ))}
      </div>
      <button onClick={() => setAmt("")} style={{
        padding: "12px", border: "1px solid #f8717133", borderRadius: 14, background: "#f8717110",
        color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
      }}>Effacer</button>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "1px 0", fontSize: 11, color: "#3d6177" }}>1 EUR = {fmt(rates.THB)} THB</p>
        <p style={{ margin: "1px 0", fontSize: 11, color: "#3d6177" }}>1 EUR = {fmt(rates.USD)} USD</p>
        {lastUp && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#2d4f65" }}>Mis à jour : {lastUp}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════ CHAT ═══════════════════ */
function Chat() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Sawadee khrap! 🙏 Pose-moi tes questions sur le voyage !" }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const endRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!inp.trim() || busy) return;
    const newMsgs = [...msgs, { role: "user", content: inp.trim() }];
    setMsgs(newMsgs); setInp(""); setBusy(true);

    if (!online) { setMsgs((m) => [...m, { role: "assistant", content: "📡 Hors ligne !" }]); setBusy(false); return; }

    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const d = await r.json();
      const reply = d.content?.map((b) => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || "Désolé, erreur.";
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch { setMsgs((m) => [...m, { role: "assistant", content: "⚠️ Erreur de connexion." }]); }
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 14px" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            maxWidth: "80%", padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "linear-gradient(135deg, #f0c24d, #e0a830)" : "#0e2535",
            color: m.role === "user" ? "#0c1e2b" : "#d4e4ed",
            borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          }}>{m.content}</div>
        ))}
        {busy && <div style={{ padding: "10px 14px", alignSelf: "flex-start", background: "#0e2535", color: "#5e879e", borderRadius: "16px 16px 16px 4px" }}>●●●</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 0 6px", borderTop: "1px solid #1a3048" }}>
        <input value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={online ? "Pose ta question…" : "Hors ligne"} disabled={!online}
          style={{ flex: 1, padding: "12px 16px", border: "1px solid #162d40", borderRadius: 24, background: "#0e2535", color: "#d4e4ed", fontSize: 14, outline: "none" }} />
        <button onClick={send} disabled={busy || !inp.trim()} style={{
          width: 44, height: 44, border: "none", borderRadius: "50%",
          background: "linear-gradient(135deg, #f0c24d, #e0a830)", color: "#0c1e2b",
          fontSize: 18, fontWeight: 800, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          opacity: busy || !inp.trim() ? 0.35 : 1,
          WebkitTapHighlightColor: "transparent",
        }}>➤</button>
      </div>
    </div>
  );
}

/* ═══════ SHARED STYLES ═══════ */
const S = {
  label: { display: "block", margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#5e879e", textTransform: "uppercase", letterSpacing: 0.8 },
  input: { display: "block", width: "100%", padding: "12px 14px", border: "1px solid #1a3048", borderRadius: 12, background: "#091720", color: "#d4e4ed", fontSize: 14, outline: "none", WebkitAppearance: "none" },
  btnGold: { width: "100%", flex: 1, padding: "12px", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #f0c24d, #e0a830)", color: "#0c1e2b", fontSize: 14, fontWeight: 800, cursor: "pointer", WebkitTapHighlightColor: "transparent" },
  btnGhost: { flex: 1, padding: "12px", border: "1px solid #1a3048", borderRadius: 12, background: "transparent", color: "#5e879e", fontSize: 14, fontWeight: 600, cursor: "pointer", WebkitTapHighlightColor: "transparent" },
};
