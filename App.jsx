import { useState, useEffect, useRef, useCallback } from "react";
import { loadData, saveData } from "./supabase.js";

/* ─── DEFAULT ITINERARY ─── */
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

/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function App() {
  const [tab, setTab] = useState("itinerary");
  const [itinerary, setItinerary] = useState(DEFAULT_ITINERARY);
  const [plans, setPlans] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      const savedIt = await loadData("thai-itinerary", DEFAULT_ITINERARY);
      const savedPl = await loadData("thai-plans", {});
      setItinerary(savedIt);
      setPlans(savedPl);
      setLoaded(true);
    })();
  }, []);

  // Save to Supabase on changes
  useEffect(() => { if (loaded) saveData("thai-itinerary", itinerary); }, [itinerary, loaded]);
  useEffect(() => { if (loaded) saveData("thai-plans", plans); }, [plans, loaded]);

  const tabs = [
    { key: "itinerary", icon: "📍", label: "Parcours" },
    { key: "planning", icon: "📋", label: "Planning" },
    { key: "currency", icon: "💱", label: "Devises" },
    { key: "chat", icon: "💬", label: "Chat" },
  ];

  return (
    <div style={S.shell}>
      <div style={{ height: "env(safe-area-inset-top, 10px)", background: "#0c1e2b" }} />
      <header style={S.header}>
        <span style={{ fontSize: 34 }}>🇹🇭</span>
        <div style={{ flex: 1 }}>
          <h1 style={S.headerTitle}>Thaïlande 2026</h1>
          <p style={S.headerSub}>12 – 25 Novembre</p>
        </div>
      </header>
      <main style={S.main}>
        {tab === "itinerary" && <Itinerary items={itinerary} setItems={setItinerary} />}
        {tab === "planning" && <Planning plans={plans} setPlans={setPlans} />}
        {tab === "currency" && <Currency />}
        {tab === "chat" && <Chat />}
      </main>
      <nav style={S.nav}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ ...S.navBtn, color: tab === t.key ? "#f0c24d" : "#7a9aad", background: tab === t.key ? "rgba(240,194,77,0.08)" : "transparent" }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.6 }}>{t.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ height: "env(safe-area-inset-bottom, 0px)", background: "#091720" }} />
    </div>
  );
}

/* ═══════════════════ ITINERARY ═══════════════════ */
function Itinerary({ items, setItems }) {
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editFields, setEditFields] = useState({});

  const startEdit = (e, item) => {
    e.stopPropagation();
    setEditing(item.id);
    setEditFields({ subtitle: item.subtitle, dates: item.dates });
  };

  const saveEdit = (id) => {
    setItems((prev) => prev.map((it) =>
      it.id === id ? { ...it, subtitle: editFields.subtitle, dates: editFields.dates } : it
    ));
    setEditing(null);
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={S.summaryBar}>
        <Pill icon="🌙" value="13 nuits" />
        <Pill icon="🏝️" value="2 îles" />
        <Pill icon="🚌" value="~14h trajet" />
      </div>
      <div style={{ position: "relative", marginTop: 8 }}>
        <div style={S.timelineLine} />
        {items.map((item) => (
          <div key={item.id}
            onClick={() => { if (editing !== item.id) setExpanded(expanded === item.id ? null : item.id); }}
            style={{ ...S.card, borderLeft: `3px solid ${item.color}` }}>
            <div style={{ ...S.dot, background: item.color, boxShadow: `0 0 0 4px ${item.color}33` }} />

            {editing === item.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                <label style={S.editLabel}>{item.type === "stay" ? "Hébergement" : "Transport"}</label>
                <input value={editFields.subtitle} onChange={(e) => setEditFields((f) => ({ ...f, subtitle: e.target.value }))} style={S.editInput} />
                <label style={S.editLabel}>Dates</label>
                <input value={editFields.dates} onChange={(e) => setEditFields((f) => ({ ...f, dates: e.target.value }))} style={S.editInput} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => saveEdit(item.id)} style={S.editSave}>Enregistrer</button>
                  <button onClick={() => setEditing(null)} style={S.editCancel}>Annuler</button>
                </div>
              </div>
            ) : (
              <>
                <div style={S.cardHeader}>
                  <span style={{ fontSize: 26 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.cardTitle}>{item.title}</p>
                    <p style={S.cardSub}>{item.subtitle}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={S.cardDates}>{item.dates}</p>
                    <p style={S.badge(item.type)}>{item.type === "stay" ? item.nights : item.duration}</p>
                  </div>
                </div>
                {expanded === item.id && (
                  <div style={S.cardDetails}>
                    <p style={{ margin: 0, lineHeight: 1.55 }}>{item.details}</p>
                    {item.type === "travel" && <div style={S.travelTag}>⏱️ Durée : {item.duration}</div>}
                    {item.editable && (
                      <button onClick={(e) => startEdit(e, item)} style={S.editBtn}>
                        ✏️ Modifier {item.type === "stay" ? "hôtel" : "transport"} / dates
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ icon, value }) {
  return <div style={S.pill}><span>{icon}</span><span style={{ fontWeight: 700, fontSize: 13 }}>{value}</span></div>;
}

/* ═══════════════════ PLANNING ═══════════════════ */
function Planning({ plans, setPlans }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [newActivity, setNewActivity] = useState("");
  const [newTime, setNewTime] = useState("");

  const addActivity = (dayKey) => {
    if (!newActivity.trim()) return;
    const act = { id: Date.now(), time: newTime || null, text: newActivity.trim(), done: false };
    setPlans((prev) => ({ ...prev, [dayKey]: [...(prev[dayKey] || []), act] }));
    setNewActivity("");
    setNewTime("");
  };

  const removeActivity = (dayKey, actId) => {
    setPlans((prev) => ({ ...prev, [dayKey]: (prev[dayKey] || []).filter((a) => a.id !== actId) }));
  };

  const toggleDone = (dayKey, actId) => {
    setPlans((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).map((a) => a.id === actId ? { ...a, done: !a.done } : a),
    }));
  };

  const dayActivities = selectedDay ? (plans[selectedDay] || []) : [];

  return (
    <div style={{ padding: "0 14px 24px" }}>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7a9aad", textAlign: "center", fontWeight: 500 }}>
        Planifiez vos journées avec vos amis !
      </p>

      {!selectedDay ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PLANNING_DAYS.map((d) => {
            const count = (plans[d.key] || []).length;
            return (
              <button key={d.key} onClick={() => setSelectedDay(d.key)} style={S.dayRow}>
                <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e8eef3" }}>{d.label}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#7a9aad" }}>{d.loc}</p>
                </div>
                {count > 0
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "#4ade8018", padding: "3px 9px", borderRadius: 8 }}>{count} activité{count > 1 ? "s" : ""}</span>
                  : <span style={{ fontSize: 11, color: "#5a7e93" }}>À planifier</span>}
                <span style={{ color: "#3b5e73", fontSize: 18 }}>›</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedDay(null)} style={S.backBtn}>‹ Retour</button>
          {(() => {
            const d = PLANNING_DAYS.find((x) => x.key === selectedDay);
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 14px", background: "#0f2a3a", borderRadius: 14, border: "1px solid #1a3548" }}>
                <span style={{ fontSize: 30 }}>{d?.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#e8eef3" }}>{d?.label} 2026</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#7a9aad" }}>{d?.loc}</p>
                </div>
              </div>
            );
          })()}

          {dayActivities.length === 0 && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <span style={{ fontSize: 32 }}>📝</span>
              <p style={{ margin: "8px 0 0", color: "#5a7e93", fontSize: 13 }}>Aucune activité.<br />Ajoutez votre premier programme !</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {dayActivities.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map((act) => (
              <div key={act.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#0f2a3a", borderRadius: 12, border: "1px solid #1a3548", opacity: act.done ? 0.5 : 1 }}>
                <button onClick={() => toggleDone(selectedDay, act.id)}
                  style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${act.done ? "#4ade80" : "#3b5e73"}`, background: act.done ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  {act.done && <span style={{ fontSize: 11, color: "#0c1e2b" }}>✓</span>}
                </button>
                <div style={{ flex: 1 }}>
                  {act.time && <span style={{ fontSize: 11, fontWeight: 700, color: "#f0c24d", background: "#f0c24d18", padding: "1px 7px", borderRadius: 6, marginRight: 6 }}>{act.time}</span>}
                  <p style={{ margin: 0, fontSize: 13.5, color: "#d4e4ed", textDecoration: act.done ? "line-through" : "none" }}>{act.text}</p>
                </div>
                <button onClick={() => removeActivity(selectedDay, act.id)} style={{ border: "none", background: "none", color: "#f8717188", fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: "14px", background: "#091720", borderRadius: 14, border: "1px dashed #1e3a50" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#7a9aad", textTransform: "uppercase", letterSpacing: 1 }}>Ajouter une activité</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Heure" style={{ ...S.editInput, width: 90, flex: "none", fontSize: 13 }} />
              <input value={newActivity} onChange={(e) => setNewActivity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addActivity(selectedDay)} placeholder="Activité…" style={{ ...S.editInput, fontSize: 13 }} />
            </div>
            <button onClick={() => addActivity(selectedDay)} disabled={!newActivity.trim()}
              style={{ width: "100%", padding: "10px", border: "none", borderRadius: 10, background: "linear-gradient(135deg, #f0c24d, #e8a838)", color: "#0c1e2b", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: newActivity.trim() ? 1 : 0.4 }}>
              + Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ CURRENCY ═══════════════════ */
function Currency() {
  const [amount, setAmount] = useState("");
  const [target, setTarget] = useState("THB");
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [online, setOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      const data = await res.json();
      if (data?.rates) {
        setRates({ USD: data.rates.USD ?? DEFAULT_RATES.USD, THB: data.rates.THB ?? DEFAULT_RATES.THB });
        setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates();
    const goOn = () => { setOnline(true); fetchRates(); };
    const goOff = () => setOnline(false);
    window.addEventListener("online", goOn);
    window.addEventListener("offline", goOff);
    return () => { window.removeEventListener("online", goOn); window.removeEventListener("offline", goOff); };
  }, [fetchRates]);

  const numVal = parseFloat(amount) || 0;
  const converted = numVal * (rates[target] || 0);
  const press = (v) => {
    if (v === "C") return setAmount("");
    if (v === "⌫") return setAmount((a) => a.slice(0, -1));
    if (v === "." && amount.includes(".")) return;
    setAmount((a) => a + v);
  };
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

  return (
    <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11, fontWeight: 600, color: online ? "#4ade80" : "#f87171", textTransform: "uppercase", letterSpacing: 1 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: online ? "#4ade80" : "#f87171" }} />
        <span>{online ? "En ligne" : "Hors ligne"}</span>
        {loading && <span style={{ marginLeft: 6 }}>⟳</span>}
      </div>
      <div style={{ background: "#0f2a3a", borderRadius: 20, padding: "18px 16px", border: "1px solid #1a3548" }}>
        <div style={S.currRow}><div style={S.currLabel}><span style={{ fontSize: 22 }}>🇪🇺</span><span style={{ fontWeight: 800 }}>EUR</span></div><p style={S.currValue}>{amount || "0"}</p></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0", color: "#3B6E8A" }}><div style={{ flex: 1, height: 1, background: "#1e3a50" }} /><span style={{ fontSize: 18 }}>⇅</span><div style={{ flex: 1, height: 1, background: "#1e3a50" }} /></div>
        <div style={S.currRow}>
          <div style={S.currLabel}>
            <span style={{ fontSize: 22 }}>{target === "THB" ? "🇹🇭" : "🇺🇸"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["THB","USD"].map((c) => <button key={c} onClick={() => setTarget(c)} style={{ border: "1px solid #1e3a50", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: target === c ? "#f0c24d" : "#132d3f", color: target === c ? "#0c1e2b" : "#7a9aad" }}>{c}</button>)}
            </div>
          </div>
          <p style={S.currValue}>{fmt(converted)}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
        {keys.map((k) => <button key={k} onClick={() => press(k)} style={S.numKey}>{k}</button>)}
      </div>
      <button onClick={() => press("C")} style={S.clearBtn}>Effacer</button>
      <div style={{ textAlign: "center" }}>
        <p style={S.rateText}>1 EUR = {fmt(rates.THB)} THB</p>
        <p style={S.rateText}>1 EUR = {fmt(rates.USD)} USD</p>
        {lastUpdate && <p style={{ ...S.rateText, opacity: 0.5, marginTop: 2 }}>Mis à jour : {lastUpdate}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════ CHAT ═══════════════════ */
function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Sawadee khrap! 🙏 Je suis ton assistant pour la Thaïlande 2026. Pose-moi toutes tes questions !" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const endRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    if (!online) {
      setMessages((m) => [...m, { role: "assistant", content: "📡 Hors ligne. Reconnecte-toi pour le chat !" }]);
      setLoading(false);
      return;
    }

    try {
      // Appel via la Netlify Function (clé API sécurisée côté serveur)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.content?.map((b) => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || "Désolé, je n'ai pas pu répondre.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Erreur de connexion." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 12px" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12, paddingTop: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            maxWidth: "82%", padding: "10px 14px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "linear-gradient(135deg, #f0c24d, #e8a838)" : "#132d3f",
            color: m.role === "user" ? "#0c1e2b" : "#d4e4ed",
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ maxWidth: "82%", padding: "10px 14px", alignSelf: "flex-start", background: "#132d3f", color: "#7a9aad", borderRadius: "18px 18px 18px 4px" }}>●●●</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 0 4px", borderTop: "1px solid #1e3a50" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={online ? "Pose ta question…" : "Hors ligne…"} disabled={!online}
          style={{ flex: 1, padding: "11px 16px", border: "1px solid #1a3548", borderRadius: 24, background: "#0f2a3a", color: "#d4e4ed", fontSize: 14, outline: "none" }} />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ width: 42, height: 42, border: "none", borderRadius: "50%", background: "linear-gradient(135deg, #f0c24d, #e8a838)", color: "#0c1e2b", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, opacity: loading || !input.trim() ? 0.4 : 1 }}>➤</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ STYLES ═══════════════════════ */
const S = {
  shell: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #0c1e2b 0%, #0f2536 50%, #0c1e2b 100%)", fontFamily: "'Segoe UI','SF Pro Display',system-ui,sans-serif", color: "#d4e4ed" },
  header: { display: "flex", alignItems: "center", gap: 14, padding: "16px 20px 12px", background: "linear-gradient(135deg, #0c1e2b, #132d3f)", borderBottom: "1px solid #1e3a50" },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #f0c24d, #e8a838)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  headerSub: { margin: 0, fontSize: 12, color: "#7a9aad", fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase" },
  main: { flex: 1, overflowY: "auto", paddingTop: 14, paddingBottom: 6 },
  nav: { display: "flex", justifyContent: "space-around", padding: "5px 4px 12px", background: "#091720", borderTop: "1px solid #1e3a50" },
  navBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", cursor: "pointer", padding: "7px 12px", borderRadius: 12 },
  summaryBar: { display: "flex", gap: 8, marginBottom: 14, justifyContent: "center" },
  pill: { display: "flex", alignItems: "center", gap: 6, background: "#132d3f", padding: "7px 13px", borderRadius: 20, fontSize: 12, color: "#d4e4ed", border: "1px solid #1e3a50" },
  timelineLine: { position: "absolute", left: 17, top: 10, bottom: 10, width: 2, background: "linear-gradient(180deg, #1e3a50, #0c1e2b)" },
  card: { position: "relative", marginLeft: 34, marginBottom: 10, padding: "13px 15px", background: "#0f2a3a", borderRadius: "0 14px 14px 0", cursor: "pointer", border: "1px solid #1a3548", borderLeftWidth: 3 },
  dot: { position: "absolute", left: -42, top: 20, width: 12, height: 12, borderRadius: "50%" },
  cardHeader: { display: "flex", alignItems: "center", gap: 10 },
  cardTitle: { margin: 0, fontSize: 14.5, fontWeight: 700, color: "#e8eef3" },
  cardSub: { margin: "2px 0 0", fontSize: 11, color: "#7a9aad" },
  cardDates: { margin: 0, fontSize: 11, color: "#7a9aad", fontWeight: 600 },
  badge: (type) => ({ margin: "4px 0 0", fontSize: 10, fontWeight: 700, color: type === "stay" ? "#f0c24d" : "#4ade80", background: type === "stay" ? "#f0c24d18" : "#4ade8018", padding: "2px 8px", borderRadius: 8, display: "inline-block" }),
  cardDetails: { marginTop: 10, padding: "10px 0 0", borderTop: "1px solid #1e3a50", fontSize: 13, color: "#9ab5c5" },
  travelTag: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "5px 12px", background: "#1a3548", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#4ade80" },
  editBtn: { marginTop: 10, padding: "8px 14px", border: "1px solid #f0c24d44", borderRadius: 10, background: "#f0c24d12", color: "#f0c24d", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" },
  editLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: "#7a9aad", textTransform: "uppercase", letterSpacing: 0.8 },
  editInput: { flex: 1, padding: "10px 14px", border: "1px solid #1e3a50", borderRadius: 10, background: "#091720", color: "#d4e4ed", fontSize: 14, outline: "none" },
  editSave: { flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "linear-gradient(135deg, #f0c24d, #e8a838)", color: "#0c1e2b", fontSize: 13, fontWeight: 800, cursor: "pointer" },
  editCancel: { flex: 1, padding: "10px", border: "1px solid #1e3a50", borderRadius: 10, background: "transparent", color: "#7a9aad", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  dayRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid #1a3548", borderRadius: 14, background: "#0f2a3a", cursor: "pointer", textAlign: "left", width: "100%" },
  backBtn: { border: "none", background: "none", color: "#f0c24d", fontSize: 15, fontWeight: 700, cursor: "pointer", padding: "4px 0 12px" },
  currRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  currLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: "#d4e4ed" },
  currValue: { margin: 0, fontSize: 26, fontWeight: 800, color: "#f0c24d", fontVariantNumeric: "tabular-nums" },
  numKey: { padding: "14px 0", border: "1px solid #1a3548", borderRadius: 14, background: "#0f2a3a", color: "#d4e4ed", fontSize: 20, fontWeight: 700, cursor: "pointer" },
  clearBtn: { padding: "10px", border: "1px solid #f8717133", borderRadius: 14, background: "#f8717115", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" },
  rateText: { margin: "1px 0", fontSize: 11, color: "#5a8199", fontWeight: 500, fontVariantNumeric: "tabular-nums" },
};
