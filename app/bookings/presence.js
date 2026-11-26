import { supabase } from "../lib/supabase";

// Who is online right now, using Supabase Realtime presence (nothing is stored in the database).
// One shared channel per browser tab: every bookings page announces its user, the Dashboard listens.
let channel = null;
let last = [];
const listeners = new Set();

export function startPresence(profile) {
  if (channel || !profile || !supabase) return;
  channel = supabase.channel("abs-online", { config: { presence: { key: profile.id } } });
  channel.on("presence", { event: "sync" }, () => {
    last = Object.values(channel.presenceState()).map((metas) => metas[metas.length - 1]);
    listeners.forEach((f) => f(last));
  });
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({ id: profile.id, name: profile.name, role: profile.role, page: window.location.pathname, at: Date.now() });
    }
  });
  window.addEventListener("pagehide", () => { channel?.untrack(); });
}

export function watchPresence(cb) {
  listeners.add(cb);
  cb(last);
  return () => listeners.delete(cb);
}
