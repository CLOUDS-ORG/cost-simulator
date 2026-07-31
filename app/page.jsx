"use client"
import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  ChevronDown,
  Search,
  X,
  Trash2,
  Waves,
  Users,
  Pencil,
  Sparkles,
  Calendar,
  Copy,
  Check,
  List,
  FolderPlus,
  Layers,
  LayoutDashboard,
  Calculator,
  Database,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  FileSpreadsheet,
  CalendarDays,
  Save,
  LogOut,
  ShieldAlert,
  User,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Key,
  Lock,
  Settings2,
  Bot,
  FileText,
  Clock,
  MessageSquare,
  Send,
  RefreshCw,
  SlidersHorizontal,
  Tag,
  Folder,
  Eye,
} from "lucide-react";

const COLORS = {
  deep: "#0A3532",
  ocean: "#0E4A47",
  oceanLight: "#155B57",
  sand: "#F4EEDD",
  sandDeep: "#E9DFC4",
  coral: "#E0713F",
  coralSoft: "#F1A17E",
  ink: "#132422",
  muted: "#6E8681",
  profit: "#3E8E6E",
  line: "#D8CFB4",
  confirmedBg: "#E3F2FD",
  confirmedText: "#1565C0",
  successBg: "#E8F5E9",
  successText: "#2E7D32",
};

const DEFAULT_CATALOG = [
  {
    id: "dive",
    title: "Snorkeling & Diving",
    items: [
      ["Wonderland 4 Place", 900000],
      ["Elite 4 Place", 900000],
      ["Ocean 4 Place", 1200000],
      ["Gili Snorkeling", 1500000],
      ["Wonderland 3 Place", 800000],
      ["Elite 3 Place", 850000],
      ["Ocean 3 Place", 900000],
      ["Wonderland 2 Place", 750000],
      ["Elite 2 Place", 800000],
      ["Ocean 2 Place", 850000],
      ["Sharing Snorkeling", 150000],
      ["No Snorkeling", 0],
      ["Manta Point", 2500000],
      ["Manta Point Sharing", 300000],
      ["Maruti 4 Place", 1200000],
      ["Maruti 3 Place Sharing", 100000],
      ["Turtle Conservation", 100000],
      ["2 Dives Certified", 1500000],
      ["3 Dives Certified", 2000000],
      ["4 Dives (1 Day)", 2500000],
      ["6 Dives (2 Days)", 3800000],
      ["12 Dives (4 Days)", 7200000],
      ["Scuba Refresher", 200000],
      ["Try Scuba 2 Dive", 1700000],
      ["Try Scuba 3 Dives", 2200000],
      ["Pool Session", 500000],
    ],
  },
  {
    id: "resto",
    title: "Resto / Meals",
    items: [
      ["Arjuna Lunch 100", 100000],
      ["D'MM Lunch 50", 50000],
      ["Arjuna Lunch 75", 75000],
      ["Funtasea 50", 50000],
      ["Maruti Lunch 100", 100000],
      ["Maruti Lunch 75", 75000],
      ["Maruti Lunch Buffet", 150000],
      ["TA Resto 50", 50000],
      ["TA Resto Buffet", 100000],
      ["Guide Lunch", 50000],
      ["The Aura Resto 50", 50000],
      ["The Aura Resto 100", 100000],
      ["Angle Bilabong 125", 125000],
      ["Dhaba 50", 50000],
      ["Dhaba 75", 75000],
      ["Dhaba 100", 100000],
      ["Dhaba 120", 120000],
      ["Sorent 50", 50000],
      ["Sorent 100", 100000],
      ["Khamara 150", 150000],
      ["Amok 125", 125000],
      ["Amok 150", 150000],
      ["Amerta 300", 300000],
      ["Dinner 150", 150000],
      ["Dinner 250", 250000],
      ["Lunch 200", 200000],
      ["No Lunch", 0],
    ],
  },
  {
    id: "inclusion",
    title: "Inclusions & Extras",
    items: [
      ["Snack Box + Mineral", 10000],
      ["Retribution", 25000],
      ["Diamond & Atuh", 60000],
      ["Three House", 30000],
      ["Paluang Cliff", 35000],
      ["Kelapa Glass", 10000],
      ["Kelapa Whole", 20000],
      ["Welcome Drink Arjuna 5", 5000],
      ["Welcome Drink Arjuna 10", 10000],
      ["Welcome Drink Maruti", 20000],
      ["Guide Fee", 50000],
      ["Guide Gili Fee", 500000],
      ["Beer", 50000],
      ["Pontoon", 50000],
      ["Push Bike", 50000],
      ["Sunset Drink Gili", 50000],
    ],
  },
  {
    id: "hotel",
    title: "Accommodation & Hotels",
    items: [
      ["Accommodation Semabu", 1800000],
      ["Accommodation AWK", 1500000],
      ["Accommodation MAUA", 2900000],
      ["Accommodation Gili", 700000],
    ],
  },
  {
    id: "car",
    title: "Car Transport Vendor",
    items: [
      ["West", 450000],
      ["East", 450000],
      ["Combination", 550000],
      ["Extra Car 500", 500000],
      ["Extra Car 350", 350000],
      ["Extra Car 250", 250000],
      ["Extra Car 150", 150000],
      ["Extra Car 50", 50000],
      ["Luggage Car", 200000],
      ["No Car", 0],
    ],
  },
  {
    id: "transport",
    title: "Transport Bali (Drop-off)",
    items: [
      ["Kuta", 300000],
      ["Seminyak", 300000],
      ["Denpasar", 300000],
      ["Nusa Dua", 350000],
      ["Jimbaran", 350000],
      ["Uluwatu", 400000],
      ["Ubud", 400000],
      ["Canggu", 400000],
      ["No Car", 0],
    ],
  },
  {
    id: "boat",
    title: "Fast Boat Vendor",
    items: [
      ["Maruti Return", 250000],
      ["Maruti One Way", 110000],
      ["Rayfish Return", 200000],
      ["Rayfish One Way", 120000],
      ["Einstein Return", 300000],
      ["Einstein One Way", 150000],
      ["Axestone Return", 200000],
      ["Axestone One Way", 100000],
      ["Eka Jaya Gili", 500000],
      ["Sanjaya Return", 180000],
      ["Sanjaya One Way", 75000],
      ["Arjuna Return", 150000],
      ["Arjuna One Way", 75000],
      ["Gangga Return", 200000],
      ["Glory Return", 200000],
      ["Boat Guide Ticket", 100000],
    ],
  },
  {
    id: "lembongan",
    title: "Lembongan Packages",
    items: [
      ["Package A – Snorkeling & Lembongan Tour", 550000],
      ["Package B – Sea Adventure", 600000],
      ["Package C – Explore Marine Life", 750000],
      ["Package D – Diving Experience", 750000],
      ["Snorkeling Safari Private", 700000],
      ["Snorkeling Safari Sharing", 650000],
      ["Land Tour", 550000],
    ],
  },
].map((cat) => ({
  ...cat,
  items: cat.items.map(([name, price], i) => ({
    id: `${cat.id}-${i}`,
    name,
    price,
    mode: undefined,
    capacity: undefined,
    threshold: undefined,
    surcharge: undefined,
  })),
}));

const DEFAULT_PRESETS = [
  {
    id: "west",
    label: "West Package",
    picks: [
      ["car", "West"],
      ["boat", "Maruti Return"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Retribution"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
  {
    id: "east",
    label: "East Package",
    picks: [
      ["car", "East"],
      ["boat", "Maruti Return"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Diamond & Atuh"],
      ["inclusion", "Retribution"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
  {
    id: "combi",
    label: "Combination Package",
    picks: [
      ["car", "Combination"],
      ["boat", "Maruti Return"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Retribution"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
  {
    id: "snorkel",
    label: "Snorkeling Only",
    picks: [
      ["boat", "Maruti Return"],
      ["dive", "Sharing Snorkeling"],
      ["resto", "Arjuna Lunch 75"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
];

const DEFAULT_USERS = [
  {
    id: "god-root",
    username: "god",
    password: "123",
    email: "god@tourhq.com",
    name: "Master God Admin",
    role: "GOD",
    status: "Approved",
    minMargin: 0,
    canSeeVendorCosts: true,
    canEditCatalog: true,
    canOverrideCosts: true,
    canEditPresets: true,
    canSeeAllDashboardQuotes: true,
    canAccessDashboard: true,
    createdAt: "2026-01-01",
  },
  {
    id: "admin-1",
    username: "admin",
    password: "123",
    email: "admin@tourhq.com",
    name: "Senior Tour Manager",
    role: "Admin Manager",
    status: "Approved",
    minMargin: 10,
    canSeeVendorCosts: true,
    canEditCatalog: true,
    canOverrideCosts: true,
    canEditPresets: true,
    canSeeAllDashboardQuotes: true,
    canAccessDashboard: true,
    createdAt: "2026-02-15",
  },
  {
    id: "staff-1",
    username: "agent1",
    password: "123",
    email: "agent1@tourhq.com",
    name: "Wayman Reservations",
    role: "Staff Agent",
    status: "Approved",
    minMargin: 20,
    canSeeVendorCosts: true,
    canEditCatalog: false,
    canOverrideCosts: false,
    canEditPresets: false,
    canSeeAllDashboardQuotes: false,
    canAccessDashboard: true,
    createdAt: "2026-03-10",
  },
  {
    id: "sales-1",
    username: "freelance1",
    password: "123",
    email: "freelance@tourhq.com",
    name: "Alex Freelance Partner",
    role: "Freelance Sales",
    status: "Approved",
    minMargin: 25,
    canSeeVendorCosts: false,
    canEditCatalog: false,
    canOverrideCosts: false,
    canEditPresets: false,
    canSeeAllDashboardQuotes: false,
    canAccessDashboard: true,
    createdAt: "2026-04-01",
  },
];

const idr = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

function getAutoRuleForItem(catId, itemName = "", item = null) {
  if (item && item.mode) {
    return {
      mode: item.mode,
      capacity: item.capacity ?? 4,
      threshold: item.threshold ?? 2,
      surcharge: item.surcharge ?? 50000,
    };
  }
  const lower = itemName.toLowerCase();
  // FIXED: Guide fees & staff boat tickets default to flat quantity so they don't scale automatically with guest count
  if (lower.includes("guide")) {
    return { mode: "flat", capacity: 1, threshold: 0, surcharge: 0 };
  }
  if (catId === "boat" || catId === "resto" || catId === "inclusion") {
    return { mode: "pax", capacity: 1, threshold: 0, surcharge: 0 };
  }
  if (catId === "hotel") {
    return { mode: "unit", capacity: 2, threshold: 0, surcharge: 0 };
  }
  if (catId === "car") {
    return { mode: "unit", capacity: 4, threshold: 0, surcharge: 0 };
  }
  if (catId === "dive") {
    if (lower.includes("sharing") || lower.includes("certified") || lower.includes("dive")) {
      return { mode: "pax", capacity: 1, threshold: 0, surcharge: 0 };
    }
    return { mode: "unit", capacity: 4, threshold: 0, surcharge: 0 };
  }
  return { mode: "flat", capacity: 4, threshold: 2, surcharge: 50000 };
}

function computeItemCost(item, cfg, totalPax, weightedPax) {
  if (cfg.override !== "" && cfg.override != null && !isNaN(parseFloat(cfg.override))) {
    return parseFloat(cfg.override);
  }
  const effectiveMode = item.mode || cfg.mode || "pax";
  const effectiveCapacity = item.capacity ?? cfg.capacity ?? 4;
  const effectiveThreshold = item.threshold ?? cfg.threshold ?? 2;
  const effectiveSurcharge = item.surcharge ?? cfg.surcharge ?? 50000;

  if (effectiveMode === "flat") return (cfg.qty || 0) * item.price;
  if (effectiveMode === "pax") return weightedPax * item.price;
  if (effectiveMode === "unit") return Math.ceil(totalPax / Math.max(1, effectiveCapacity)) * item.price;
  if (effectiveMode === "tier") {
    return item.price + Math.max(0, totalPax - effectiveThreshold) * effectiveSurcharge;
  }
  return 0;
}

function isSelected(cfg) {
  if (cfg.mode === "flat") return (cfg.qty || 0) > 0;
  return !!cfg.included;
}

function ruleCaption(item, cfg, totalPax) {
  const effectiveMode = item.mode || cfg.mode || "pax";
  const effectiveCapacity = item.capacity ?? cfg.capacity ?? 4;
  const effectiveThreshold = item.threshold ?? cfg.threshold ?? 2;
  const effectiveSurcharge = item.surcharge ?? cfg.surcharge ?? 50000;

  if (effectiveMode === "pax") return `${idr(item.price)} / pax`;
  if (effectiveMode === "unit") {
    const units = Math.ceil(totalPax / Math.max(1, effectiveCapacity));
    return `${idr(item.price)} / unit · ${effectiveCapacity} pax / unit · ${units} unit${units > 1 ? "s" : ""}`;
  }
  if (effectiveMode === "tier") {
    const extra = Math.max(0, totalPax - effectiveThreshold);
    return `${idr(item.price)} base (${effectiveThreshold} pax max) + ${extra} × ${idr(effectiveSurcharge)}`;
  }
  return idr(item.price);
}

export default function App() {
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem("system_users_v6");
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("active_user_session_v6");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [impersonatedUserId, setImpersonatedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState("simulator");

  const effectiveUser = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.role === "GOD" && impersonatedUserId) {
      const found = usersList.find((u) => u.id === impersonatedUserId);
      if (found) return found;
    }
    return currentUser;
  }, [currentUser, impersonatedUserId, usersList]);

  const isRealGodUser = currentUser?.role === "GOD";
  const isGodUser = effectiveUser?.role === "GOD";
  const isFreelanceSales = effectiveUser?.role === "Freelance Sales" || effectiveUser?.role === "Partner Agency / B2B Reseller";
  const userMinMargin = effectiveUser?.minMargin ?? 0;

  const canSeeCosts = isGodUser || (effectiveUser?.canSeeVendorCosts !== false && !isFreelanceSales);
  const canEditCat = isGodUser || (!isFreelanceSales && !!effectiveUser?.canEditCatalog);
  const canSeeAllQuotes = isGodUser || (!isFreelanceSales && !!effectiveUser?.canSeeAllDashboardQuotes);
  const canAccessDashboard = isGodUser || effectiveUser?.canAccessDashboard !== false;

  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    godMasterKey: "",
  });
  const [authNotice, setAuthNotice] = useState({ type: "", text: "" });

  const [newUserForm, setNewUserForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "Staff Agent",
    minMargin: 20,
    canSeeVendorCosts: true,
    canEditCatalog: false,
    canOverrideCosts: false,
    canEditPresets: false,
    canSeeAllDashboardQuotes: false,
    canAccessDashboard: true,
  });
  const [userNotice, setUserNotice] = useState({ type: "", text: "" });

  const [editingUser, setEditingUser] = useState(null);

  const [catalog, setCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_catalog_v6");
      return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
    } catch (e) {
      return DEFAULT_CATALOG;
    }
  });

  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_presets_v6");
      return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
    } catch (e) {
      return DEFAULT_PRESETS;
    }
  });

  const [savedHistory, setSavedHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_quote_history_v6");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [editingCatalogItem, setEditingCatalogItem] = useState(null);
  const [newItemForms, setNewItemForms] = useState({});
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("system_users_v6", JSON.stringify(usersList));
    } catch (e) {
      console.error(e);
    }
  }, [usersList]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("active_user_session_v6", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("active_user_session_v6");
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_catalog_v6", JSON.stringify(catalog));
    } catch (e) {
      console.error(e);
    }
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_presets_v6", JSON.stringify(presets));
    } catch (e) {
      console.error(e);
    }
  }, [presets]);

  useEffect(() => {
    try {
      localStorage.setItem("saved_quote_history_v6", JSON.stringify(savedHistory));
    } catch (e) {
      console.error(e);
    }
  }, [savedHistory]);

  const createDefaultQuoteSession = (titleOverride = null) => {
    const userMinMargin = currentUser?.minMargin ?? 25;
    const generatedId = `QUOTE-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    return {
      id: generatedId,
      title: titleOverride || generatedId,
      status: "Draft",
      pic: currentUser?.name || "",
      agent: currentUser?.role || "Staff Agent",
      savedBy: currentUser?.username || "system",
      activityDate: new Date().toISOString().split("T")[0],
      confirmedAt: null,
      adults: 2,
      kids: 0,
      kidsRate: 65,
      margin: Math.max(25, userMinMargin),
      days: [
        {
          id: `day-${Date.now()}-1`,
          title: "Day 1",
          presetName: "",
          itemConfig: {},
          custom: [],
        },
      ],
      activeDayIndex: 0,
      aiItinerary: "",
      aiPitch: "",
      customQuoteText: undefined,
    };
  };

  const [quotes, setQuotes] = useState([createDefaultQuoteSession()]);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const [open, setOpen] = useState({ dive: true, car: true });
  const [query, setQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [searchQuoteId, setSearchQuoteId] = useState("");
  const [loadNotice, setLoadNotice] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const [aiTab, setAiTab] = useState("quote");
  const [aiLoading, setAiLoading] = useState(false);
  const [promptSettings, setPromptSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("master_ai_prompt_settings_v6");
      return saved
        ? JSON.parse(saved)
        : {
            tone: "Warm & High-Converting Travel Advisor",
            language: "English",
            customInstructions: "Highlight photo spots at Kelingking Beach, treehouse photo queues, and mention private air-conditioned car details.",
            systemPromptTemplate: "Act as an elite tour operations manager for Nusa Penida & Bali tours. Craft clear, persuasive, high-converting proposals with precise timing schedules.",
          };
    } catch (e) {
      return {
        tone: "Warm & High-Converting Travel Advisor",
        language: "English",
        customInstructions: "Highlight photo spots at Kelingking Beach, treehouse photo queues, and mention private air-conditioned car details.",
        systemPromptTemplate: "Act as an elite tour operations manager for Nusa Penida & Bali tours. Craft clear, persuasive, high-converting proposals with precise timing schedules.",
      };
    }
  });
  const [showPromptCustomizer, setShowPromptCustomizer] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("master_ai_prompt_settings_v6", JSON.stringify(promptSettings));
    } catch (e) {
      console.error(e);
    }
  }, [promptSettings]);

  const currentQuote = quotes[activeQuoteIndex] || quotes[0];

  const updateCurrentQuote = (patch) => {
    setQuotes((prev) =>
      prev.map((q, i) => (i === activeQuoteIndex ? { ...q, ...patch } : q))
    );
  };

  const adults = currentQuote?.adults || 2;
  const setAdults = (val) =>
    updateCurrentQuote({
      adults: typeof val === "function" ? val(currentQuote.adults) : val,
    });

  const kids = currentQuote?.kids || 0;
  const setKids = (val) =>
    updateCurrentQuote({
      kids: typeof val === "function" ? val(currentQuote.kids) : val,
    });

  const kidsRate = currentQuote?.kidsRate || 65;
  const setKidsRate = (val) => updateCurrentQuote({ kidsRate: val });

  const margin = currentQuote?.margin || 25;
  const setMargin = (val) => {
    const requested = typeof val === "function" ? val(currentQuote.margin) : val;
    const finalMargin = isGodUser ? requested : Math.max(requested, userMinMargin);
    updateCurrentQuote({ margin: finalMargin });
  };

  const days = currentQuote?.days || [];
  const setDays = (val) =>
    updateCurrentQuote({
      days: typeof val === "function" ? val(currentQuote.days) : val,
    });

  const activeDayIndex = currentQuote?.activeDayIndex || 0;
  const setActiveDayIndex = (idx) => updateCurrentQuote({ activeDayIndex: idx });

  const activeDay = days[activeDayIndex] || days[0];

  const totalPax = adults + kids;
  const weightedPax = adults + kids * (kidsRate / 100);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthNotice({ type: "", text: "" });

    if (authForm.godMasterKey.trim() === "GOD2026") {
      const godUser = {
        id: "god-master",
        username: authForm.username || "god",
        password: "123",
        name: "Master God Admin",
        role: "GOD",
        status: "Approved",
        email: "god@tourhq.com",
        minMargin: 0,
        canSeeVendorCosts: true,
        canEditCatalog: true,
        canOverrideCosts: true,
        canEditPresets: true,
        canSeeAllDashboardQuotes: true,
        canAccessDashboard: true,
      };
      setCurrentUser(godUser);
      setAuthNotice({ type: "success", text: "Welcome Master GOD! Unrestricted permissions granted." });
      setCurrentPage("simulator");
      return;
    }

    const found = usersList.find(
      (u) =>
        u.username.toLowerCase() === authForm.username.trim().toLowerCase() ||
        u.email.toLowerCase() === authForm.username.trim().toLowerCase()
    );

    if (!found) {
      setAuthNotice({ type: "error", text: "Account not found. Contact GOD/Admin to set up your account." });
      return;
    }

    if (found.password && found.password !== authForm.password) {
      setAuthNotice({ type: "error", text: "Invalid password. Contact GOD Admin to reset your password." });
      return;
    }

    if (found.status === "Blocked") {
      setAuthNotice({
        type: "error",
        text: "Your account has been suspended by GOD Admin.",
      });
      return;
    }

    setCurrentUser(found);
    setAuthNotice({ type: "success", text: `Logged in as ${found.name} (${found.role})` });
    setCurrentPage("simulator");
  };

  const handleGodCreateUser = (e) => {
    e.preventDefault();
    setUserNotice({ type: "", text: "" });

    if (!newUserForm.username.trim() || !newUserForm.name.trim() || !newUserForm.password.trim()) {
      setUserNotice({ type: "error", text: "Please enter Full Name, Username, and Password." });
      return;
    }

    const existing = usersList.find(
      (u) =>
        u.username.toLowerCase() === newUserForm.username.trim().toLowerCase() ||
        (newUserForm.email && u.email.toLowerCase() === newUserForm.email.trim().toLowerCase())
    );

    if (existing) {
      setUserNotice({ type: "error", text: "Username or Email already exists in the system." });
      return;
    }

    const isFreelance = newUserForm.role === "Freelance Sales" || newUserForm.role === "Partner Agency / B2B Reseller";

    const createdUser = {
      id: `user-${Date.now()}`,
      username: newUserForm.username.trim(),
      password: newUserForm.password.trim(),
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim() || `${newUserForm.username.trim()}@tourhq.com`,
      role: newUserForm.role,
      status: "Approved",
      minMargin: Number(newUserForm.minMargin) || 0,
      canSeeVendorCosts: isFreelance ? false : newUserForm.canSeeVendorCosts,
      canEditCatalog: isFreelance ? false : newUserForm.canEditCatalog,
      canOverrideCosts: isFreelance ? false : newUserForm.canOverrideCosts,
      canEditPresets: isFreelance ? false : newUserForm.canEditPresets,
      canSeeAllDashboardQuotes: isFreelance ? false : newUserForm.canSeeAllDashboardQuotes,
      canAccessDashboard: newUserForm.canAccessDashboard !== false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsersList((prev) => [...prev, createdUser]);
    setUserNotice({ type: "success", text: `Account for "${createdUser.name}" created with role (${createdUser.role})!` });
    setNewUserForm({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "Staff Agent",
      minMargin: 20,
      canSeeVendorCosts: true,
      canEditCatalog: false,
      canOverrideCosts: false,
      canEditPresets: false,
      canSeeAllDashboardQuotes: false,
      canAccessDashboard: true,
    });
  };

  const saveUpdatedUserPermissions = () => {
    if (!editingUser) return;
    setUsersList((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    if (currentUser?.id === editingUser.id) {
      setCurrentUser(editingUser);
    }
    setEditingUser(null);
  };

  const deleteUserAccount = (userId) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthNotice({ type: "", text: "" });
  };

  const handleSaveCatalogItem = (e) => {
    e.preventDefault();
    if (!editingCatalogItem) return;

    setCatalog((prev) =>
      prev.map((cat) => {
        if (cat.id !== editingCatalogItem.catId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== editingCatalogItem.id) return item;
            return {
              ...item,
              name: editingCatalogItem.name.trim(),
              price: Number(editingCatalogItem.price) || 0,
              mode: editingCatalogItem.mode,
              capacity: Number(editingCatalogItem.capacity) || 4,
              threshold: Number(editingCatalogItem.threshold) || 2,
              surcharge: Number(editingCatalogItem.surcharge) || 50000,
            };
          }),
        };
      })
    );
    setEditingCatalogItem(null);
  };

  const handleDeleteCatalogItem = (catId, itemId) => {
    setCatalog((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  const handleAddCatalogItem = (catId) => {
    const formData = newItemForms[catId];
    if (!formData || !formData.name.trim()) return;

    const priceNum = Number(formData.price) || 0;
    const newItem = {
      id: `${catId}-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      price: priceNum,
      mode: "pax",
      capacity: 4,
      threshold: 2,
      surcharge: 50000,
    };

    setCatalog((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      })
    );

    setNewItemForms((prev) => ({
      ...prev,
      [catId]: { name: "", price: "" },
    }));
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCatObj = {
      id: `cat-${Date.now()}`,
      title: newCatName.trim(),
      items: [],
    };

    setCatalog((prev) => [...prev, newCatObj]);
    setNewCatName("");
  };

  const handleDeleteCategory = (catId) => {
    setCatalog((prev) => prev.filter((cat) => cat.id !== catId));
  };

  const handleResetCatalogToDefault = () => {
    setCatalog(DEFAULT_CATALOG);
  };

  const addNewQuote = () => {
    const newQ = createDefaultQuoteSession();
    setQuotes((prev) => [...prev, newQ]);
    setActiveQuoteIndex(quotes.length);
  };

  const duplicateCurrentQuote = () => {
    const duplicated = JSON.parse(JSON.stringify(currentQuote));
    const newId = `QUOTE-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    duplicated.id = newId;
    duplicated.title = `${newId} (Copy)`;
    setQuotes((prev) => [...prev, duplicated]);
    setActiveQuoteIndex(quotes.length);
  };

  const loadQuoteById = (targetId) => {
    if (!targetId || !targetId.trim()) return;
    const cleanId = targetId.trim().toLowerCase();
    
    // Search saved history by ID
    const found = savedHistory.find(
      (q) => q.id && q.id.toLowerCase().includes(cleanId)
    );

    if (!found) {
      setLoadNotice({ type: "error", text: `No saved quote found matching ID "${targetId.trim()}".` });
      setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
      return;
    }

    // Permission check for restricted sales roles
    if (!canSeeAllQuotes && found.savedBy !== currentUser?.username && found.pic !== currentUser?.name) {
      setLoadNotice({ type: "error", text: "Permission denied: You do not have access to this quote." });
      setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
      return;
    }

    // Check if already open in workspace tabs
    const existingIndex = quotes.findIndex((q) => q.id === found.id);
    if (existingIndex >= 0) {
      setActiveQuoteIndex(existingIndex);
      setLoadNotice({ type: "success", text: `Switched to workspace tab for Quote ID: ${found.id}` });
    } else {
      setQuotes((prev) => [...prev, found]);
      setActiveQuoteIndex(quotes.length);
      setLoadNotice({ type: "success", text: `Loaded Quote ID: ${found.id} into workspace!` });
    }

    setSearchQuoteId("");
    setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
  };

  const removeQuoteSession = (index, e) => {
    if (e) e.stopPropagation();
    if (quotes.length <= 1) return;
    setQuotes((prev) => prev.filter((_, i) => i !== index));
    setActiveQuoteIndex((prev) => Math.max(0, prev - 1));
  };

  const defaultConfigFor = (catId, itemName = "") => {
    const item = catalog.flatMap((c) => c.items).find((i) => i.name === itemName);
    const auto = getAutoRuleForItem(catId, itemName, item);
    const effectiveMode = item?.mode || auto.mode;
    return {
      included: false,
      mode: effectiveMode,
      qty: 0,
      capacity: item?.capacity ?? auto.capacity,
      threshold: item?.threshold ?? auto.threshold,
      surcharge: item?.surcharge ?? auto.surcharge,
      override: "",
    };
  };

  const getConfig = (id, catId, itemName = "") =>
    activeDay?.itemConfig?.[id] || defaultConfigFor(catId, itemName);

  const updateActiveDayConfig = (id, catId, itemName, patch) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== activeDayIndex) return d;
        const currentCfg = d.itemConfig[id] || defaultConfigFor(catId, itemName);
        return {
          ...d,
          itemConfig: { ...d.itemConfig, [id]: { ...currentCfg, ...patch } },
        };
      })
    );
  };

  const setItemQty = (id, catId, itemName, val) => {
    const v = Math.max(0, val);
    updateActiveDayConfig(id, catId, itemName, { mode: "flat", qty: v });
  };

  const toggleInclude = (id, catId, itemName, cfg) => {
    updateActiveDayConfig(id, catId, itemName, {
      included: !cfg.included,
      override: "",
    });
  };

  const buildPresetConfig = (picks) => {
    const nextConfig = {};
    picks.forEach(([catId, name]) => {
      const catObj = catalog.find((c) => c.id === catId);
      const item = catObj?.items.find((i) => i.name === name);
      if (!item) return;
      const auto = getAutoRuleForItem(catId, item.name, item);
      nextConfig[item.id] = {
        included: true,
        mode: auto.mode,
        qty: auto.mode === "flat" ? 1 : 0,
        capacity: auto.capacity,
        threshold: auto.threshold,
        surcharge: auto.surcharge,
        override: "",
      };
    });
    return nextConfig;
  };

  const applyPresetToDay = (dayIdx, preset) => {
    const nextConfig = buildPresetConfig(preset.picks);
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, presetName: preset.label, itemConfig: nextConfig }
          : d
      )
    );
  };

  const addNewDay = () => {
    const nextIndex = days.length + 1;
    const newDayObj = {
      id: `day-${Date.now()}`,
      title: `Day ${nextIndex}`,
      presetName: "",
      itemConfig: {},
      custom: [],
    };
    setDays((prev) => [...prev, newDayObj]);
    setActiveDayIndex(days.length);
  };

  const removeDay = (index, e) => {
    if (e) e.stopPropagation();
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== index));
    setActiveDayIndex((prev) => Math.max(0, prev - 1));
  };

  const removeItemFromDay = (dayIdx, itemObj) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          ...d,
          itemConfig: {
            ...d.itemConfig,
            [itemObj.item.id]: {
              ...(d.itemConfig[itemObj.item.id] || {}),
              included: false,
              qty: 0,
              override: "",
            },
          },
        };
      })
    );
  };

  const resetAll = () => {
    updateCurrentQuote({
      days: [
        {
          id: `day-${Date.now()}`,
          title: "Day 1",
          presetName: "",
          itemConfig: {},
          custom: [],
        },
      ],
      activeDayIndex: 0,
      margin: Math.max(25, userMinMargin),
      adults: 2,
      kids: 0,
      kidsRate: 65,
      aiItinerary: "",
      aiPitch: "",
      customQuoteText: undefined,
    });
    setQuery("");
  };

  const totals = useMemo(() => {
    let grandCost = 0;
    let totalLineCount = 0;
    const dayBreakdowns = days.map((day) => {
      let dayCost = 0;
      const selectedItems = [];

      catalog.forEach((cat) => {
        cat.items.forEach((item) => {
          const cfg =
            day.itemConfig?.[item.id] || defaultConfigFor(cat.id, item.name);
          if (isSelected(cfg)) {
            const cost = computeItemCost(item, cfg, totalPax, weightedPax);
            dayCost += cost;
            totalLineCount++;
            selectedItems.push({
              item,
              cat,
              cfg,
              cost,
              caption: ruleCaption(item, cfg, totalPax),
            });
          }
        });
      });

      grandCost += dayCost;
      return { day, dayCost, selectedItems };
    });

    const grandProfit = grandCost * (margin / 100);
    const grandPrice = grandCost + grandProfit;

    const adultPricePax = weightedPax > 0 ? grandPrice / weightedPax : 0;
    const childPricePax = adultPricePax * (kidsRate / 100);

    return {
      cost: grandCost,
      profit: grandProfit,
      price: grandPrice,
      adultPricePax,
      childPricePax,
      lineCount: totalLineCount,
      dayBreakdowns,
    };
  }, [days, margin, totalPax, weightedPax, kidsRate, catalog]);

  const filteredCatalog = useMemo(() => {
    if (!query.trim()) return catalog;
    const q = query.toLowerCase();
    return catalog
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, catalog]);

  const formattedQuotationText = useMemo(() => {
    let summary = `📍 *TOUR QUOTATION - ${currentQuote.title.toUpperCase()} (${days.length} Day${days.length > 1 ? "s" : ""})*\n`;
    if (currentQuote.id) summary += `🆔 Quote ID: ${currentQuote.id}\n`;
    if (currentQuote.pic) summary += `👤 PIC: ${currentQuote.pic}\n`;
    if (currentQuote.agent) summary += `🏢 Agent: ${currentQuote.agent}\n`;
    summary += `🗓 Tour Date: ${currentQuote.activityDate || "TBA"}\n`;
    summary += `👥 Pax Count: ${adults} Adult(s)${kids > 0 ? `, ${kids} Child(ren) (${kidsRate}%)` : ""}\n`;
    summary += `-----------------------------------\n`;

    totals.dayBreakdowns.forEach(({ day, selectedItems }) => {
      summary += `\n🗓 *${day.title}*\n`;
      if (selectedItems.length === 0) {
        summary += ` • No items selected\n`;
      } else {
        selectedItems.forEach(({ item, caption }) => {
          if (canSeeCosts) {
            summary += ` • ${item.name} (${caption})\n`;
          } else {
            summary += ` • ${item.name}\n`;
          }
        });
      }
    });

    summary += `\n-----------------------------------\n`;
    summary += `🏷 *Total Sell Price: ${idr(totals.price)}*\n`;
    summary += `👤 Adult Price / pax: ${idr(totals.adultPricePax)}\n`;
    if (kids > 0) {
      summary += `👶 Child Price / pax (${kidsRate}%): ${idr(totals.childPricePax)}\n`;
    }
    summary += `\nThank you for choosing our tour services! ✨`;
    return summary;
  }, [days, adults, kids, kidsRate, totals, currentQuote, canSeeCosts]);

  const displayQuotationText =
    currentQuote.customQuoteText !== undefined
      ? currentQuote.customQuoteText
      : formattedQuotationText;

  const copyTextToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const saveQuoteToDatabase = (statusToSave = "Draft") => {
    const record = {
      ...currentQuote,
      status: statusToSave,
      savedBy: currentUser?.username || "agent",
      calculatedCost: totals.cost,
      calculatedProfit: totals.profit,
      calculatedPrice: totals.price,
      savedAt: new Date().toISOString(),
      confirmedAt: statusToSave === "Confirmed" ? new Date().toISOString() : currentQuote.confirmedAt,
    };

    updateCurrentQuote({ status: statusToSave, confirmedAt: record.confirmedAt });

    setSavedHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === record.id);
      if (existingIdx >= 0) {
        const nextArr = [...prev];
        nextArr[existingIdx] = record;
        return nextArr;
      }
      return [record, ...prev];
    });

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateQuoteStatusInDashboard = (quoteId, newStatus) => {
    setSavedHistory((prev) =>
      prev.map((item) => {
        if (item.id === quoteId) {
          return {
            ...item,
            status: newStatus,
            confirmedAt: newStatus === "Confirmed" ? new Date().toISOString() : item.confirmedAt,
          };
        }
        return item;
      })
    );
    if (currentQuote.id === quoteId) {
      updateCurrentQuote({
        status: newStatus,
        confirmedAt: newStatus === "Confirmed" ? new Date().toISOString() : currentQuote.confirmedAt,
      });
    }
  };

  const filteredHistory = useMemo(() => {
    if (canSeeAllQuotes) return savedHistory;
    return savedHistory.filter(
      (item) => item.savedBy === currentUser?.username || item.pic === currentUser?.name
    );
  }, [savedHistory, canSeeAllQuotes, currentUser]);

  const dashboardStats = useMemo(() => {
    const confirmed = filteredHistory.filter((item) => item.status === "Confirmed");
    const totalRev = confirmed.reduce((sum, item) => sum + (item.calculatedPrice || 0), 0);
    const totalProfit = confirmed.reduce((sum, item) => sum + (item.calculatedProfit || 0), 0);
    const totalSaved = filteredHistory.length;
    const totalConfirmed = confirmed.length;
    const conversionRate = totalSaved > 0 ? Math.round((totalConfirmed / totalSaved) * 100) : 0;

    return { totalRev, totalProfit, totalSaved, totalConfirmed, conversionRate };
  }, [filteredHistory]);

  const searchedCatalog = useMemo(() => {
    if (!catalogQuery.trim()) return catalog;
    const q = catalogQuery.toLowerCase();
    return catalog
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0 || cat.title.toLowerCase().includes(q));
  }, [catalogQuery, catalog]);

  const generateGeminiContent = async () => {
    setAiLoading(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const systemPrompt = `${promptSettings.systemPromptTemplate || "Act as an elite tour operations manager for Nusa Penida & Bali tours."} Persona/Tone: ${promptSettings.tone}. Output Language: ${promptSettings.language}. Special Instructions: ${promptSettings.customInstructions}`;

      const userQuery = `Generate a minute-by-minute time schedule itinerary and a persuasive sales message for quote "${currentQuote.title}" (${days.length} Days, ${adults} Adults, ${kids} Kids).
Total Sell Price: ${idr(totals.price)} (Adult: ${idr(totals.adultPricePax)}/pax).
Items breakdown per day:
${totals.dayBreakdowns.map((b) => `${b.day.title}: ${b.selectedItems.map((i) => `${i.item.name} (${i.caption})`).join(", ")}`).join("\n")}

Respond with TWO parts separated by the tag "PITCH_SEPARATOR":
1. First part: Hour-by-hour detailed tour itinerary schedule with travel tips.
2. Second part: High-converting WhatsApp sales message.`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        if (text.includes("PITCH_SEPARATOR")) {
          const [itin, pitch] = text.split("PITCH_SEPARATOR");
          updateCurrentQuote({ aiItinerary: itin.trim(), aiPitch: pitch.trim() });
        } else {
          updateCurrentQuote({ aiItinerary: text.trim() });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const stepBtn = (bg, color) => ({
    width: 26,
    height: 26,
    borderRadius: 8,
    border: "none",
    background: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });

  if (!currentUser) {
    return (
      <div
        style={{
          background: COLORS.deep,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          padding: 16,
        }}
      >
        <div
          style={{
            background: COLORS.sand,
            borderRadius: 20,
            width: "100%",
            maxWidth: 420,
            padding: 24,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-flex", padding: 12, borderRadius: 16, background: COLORS.ocean, marginBottom: 10 }}>
              <Waves size={32} color={COLORS.coral} />
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.ink }}>
              Tour HQ Portal
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.muted }}>
              Sign in with your assigned team account
            </p>
          </div>

          {authNotice.text && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: authNotice.type === "error" ? "#FFEBEE" : "#E8F5E9",
                color: authNotice.type === "error" ? "#C62828" : "#2E7D32",
                border: `1px solid ${authNotice.type === "error" ? "#EF9A9A" : "#A5D6A7"}`,
              }}
            >
              {authNotice.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{authNotice.text}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                Username or Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. god, admin, agent1, or freelance1"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                Assigned Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ borderTop: `1px dashed ${COLORS.line}`, paddingTop: 10, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: COLORS.coral, marginBottom: 4 }}>
                <Key size={13} /> GOD Master Bypass Passkey
              </label>
              <input
                type="password"
                placeholder="Enter GOD Bypass Key (e.g. GOD2026)"
                value={authForm.godMasterKey}
                onChange={(e) => setAuthForm({ ...authForm, godMasterKey: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.coralSoft}`,
                  fontSize: 12,
                  boxSizing: "border-box",
                  background: "#FFF8F5",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 8,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: COLORS.ocean,
                color: COLORS.sand,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Sign In to Headquarters
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.deep,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 16px 120px" }}>
        
        {/* Top Header & Account Status Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Waves size={26} color={COLORS.coral} strokeWidth={2.5} />
            <div>
              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: COLORS.sand,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Tour Costing & Booking HQ
              </h1>
              <p style={{ color: COLORS.muted, fontSize: 12, margin: "2px 0 0" }}>
                Multi-Quote Workspaces, Saved Bookings & Governance
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* GOD Account POV Mode Switcher Bar */}
            {isRealGodUser && (
              <div
                style={{
                  background: impersonatedUserId ? COLORS.coral : COLORS.oceanLight,
                  padding: "5px 10px",
                  borderRadius: 10,
                  color: COLORS.sand,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${impersonatedUserId ? COLORS.sand : COLORS.coralSoft}`,
                }}
              >
                <Eye size={14} color={COLORS.sand} />
                <span style={{ fontWeight: 700 }}>POV:</span>
                <select
                  value={impersonatedUserId || ""}
                  onChange={(e) => setImpersonatedUserId(e.target.value || null)}
                  style={{
                    padding: "3px 6px",
                    borderRadius: 6,
                    border: "none",
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: COLORS.sand,
                    color: COLORS.ink,
                    cursor: "pointer",
                  }}
                >
                  <option value="">⚡ Master GOD (Full Access)</option>
                  {usersList
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        👁️ {u.name} ({u.role})
                      </option>
                    ))}
                </select>

                {impersonatedUserId && (
                  <button
                    onClick={() => {
                      const found = usersList.find((u) => u.id === impersonatedUserId);
                      if (found) setEditingUser(found);
                    }}
                    style={{
                      background: COLORS.sand,
                      color: COLORS.ink,
                      border: "none",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Pencil size={11} color={COLORS.coral} /> Modify {effectiveUser?.name}'s Rules
                  </button>
                )}
              </div>
            )}

            <div style={{ background: COLORS.oceanLight, padding: "6px 12px", borderRadius: 10, color: COLORS.sand, fontSize: 12 }}>
              <span style={{ color: COLORS.muted }}>Viewing as: </span>
              <strong>{effectiveUser.name}</strong> ({effectiveUser.role})
              {isFreelanceSales && <span style={{ marginLeft: 6, color: COLORS.coralSoft, fontSize: 11 }}>(Customer Simulator)</span>}
              {!canSeeCosts && !isFreelanceSales && <span style={{ marginLeft: 6, color: COLORS.coralSoft, fontSize: 11 }}>(Costs Hidden)</span>}
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: COLORS.coral,
                color: COLORS.sand,
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div style={{ display: "flex", gap: 6, background: COLORS.oceanLight, padding: 6, borderRadius: 14, marginBottom: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setCurrentPage("simulator")}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: currentPage === "simulator" ? COLORS.sand : "transparent",
              color: currentPage === "simulator" ? COLORS.ink : COLORS.sand,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Calculator size={16} color={currentPage === "simulator" ? COLORS.coral : COLORS.sand} />
            {!canSeeCosts ? "Simulator For Customer" : "Simulator"}
          </button>

          {canAccessDashboard && (
            <button
              onClick={() => setCurrentPage("dashboard")}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: currentPage === "dashboard" ? COLORS.sand : "transparent",
                color: currentPage === "dashboard" ? COLORS.ink : COLORS.sand,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <LayoutDashboard size={16} color={currentPage === "dashboard" ? COLORS.coral : COLORS.sand} />
              Dashboard ({filteredHistory.length})
            </button>
          )}

          {canEditCat && !isFreelanceSales && (
            <button
              onClick={() => setCurrentPage("catalog")}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: currentPage === "catalog" ? COLORS.sand : "transparent",
                color: currentPage === "catalog" ? COLORS.ink : COLORS.sand,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Database size={16} color={currentPage === "catalog" ? COLORS.coral : COLORS.sand} />
              Vendor Catalog Manager
            </button>
          )}

          {isGodUser && (
            <button
              onClick={() => setCurrentPage("users")}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: currentPage === "users" ? COLORS.coral : "transparent",
                color: COLORS.sand,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ShieldAlert size={16} color={COLORS.sand} />
              God Governance ({usersList.length})
            </button>
          )}
        </div>

        {}
        {currentPage === "simulator" && (
          <div>
            {/* Workspace Bar */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 16, padding: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.sand, fontWeight: 700, fontSize: 13.5 }}>
                  <Layers size={16} color={COLORS.coralSoft} />
                  Quote Workspaces ({quotes.length} Active)
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {canAccessDashboard && (
                    <button
                      onClick={() => saveQuoteToDatabase(currentQuote.status)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: COLORS.profit,
                        color: "#FFF",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Save size={13} /> {copied ? "Saved!" : "Save Quote"}
                    </button>
                  )}
                  <button
                    onClick={duplicateCurrentQuote}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.sandDeep,
                      color: COLORS.ink,
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                  <button
                    onClick={addNewQuote}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.sand,
                      color: COLORS.ink,
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <FolderPlus size={13} /> + New
                  </button>
                </div>
              </div>

              {/* Workspace Tabs */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
                {quotes.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuoteIndex(idx)}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: activeQuoteIndex === idx ? COLORS.coral : COLORS.ocean,
                      color: activeQuoteIndex === idx ? COLORS.sand : COLORS.muted,
                      fontWeight: 600,
                      fontSize: 13,
                      border: `1px solid ${activeQuoteIndex === idx ? COLORS.coral : COLORS.oceanLight}`,
                    }}
                  >
                    <span>{q.title}</span>
                    {quotes.length > 1 && (
                      <X
                        size={13}
                        onClick={(e) => removeQuoteSession(idx, e)}
                        style={{ opacity: 0.7, cursor: "pointer" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Workspace Meta Inputs */}
              <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.ocean}`, paddingTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Pencil size={13} color={COLORS.coralSoft} />
                  <input
                    type="text"
                    value={currentQuote.title || ""}
                    onChange={(e) => updateCurrentQuote({ title: e.target.value })}
                    placeholder="Quote Title (e.g. Nusa Penida Day Trip)"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12.5,
                      background: COLORS.sand,
                      color: COLORS.ink,
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div style={{ flex: "1 1 120px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.sand, fontWeight: 600 }}>PIC:</span>
                  <input
                    type="text"
                    value={currentQuote.pic || ""}
                    onChange={(e) => updateCurrentQuote({ pic: e.target.value })}
                    placeholder="Client Name"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      background: COLORS.sand,
                      color: COLORS.ink,
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div style={{ flex: "1 1 120px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.sand, fontWeight: 600 }}>Agent:</span>
                  <input
                    type="text"
                    value={currentQuote.agent || ""}
                    onChange={(e) => updateCurrentQuote({ agent: e.target.value })}
                    placeholder="Agent Name"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      background: COLORS.sand,
                      color: COLORS.ink,
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CalendarDays size={14} color={COLORS.sand} />
                  <input
                    type="date"
                    value={currentQuote.activityDate || ""}
                    onChange={(e) => updateCurrentQuote({ activityDate: e.target.value })}
                    style={{
                      padding: "5px 8px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      background: COLORS.sand,
                      color: COLORS.ink,
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              {/* Quote Load by ID Dropdown Bar */}
              <div style={{ marginTop: 10, borderTop: `1px dashed ${COLORS.ocean}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Folder size={14} color={COLORS.coralSoft} />
                <span style={{ fontSize: 12, color: COLORS.sand, fontWeight: 600 }}>Load Saved Quote:</span>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      loadQuoteById(e.target.value);
                    }
                  }}
                  style={{
                    flex: "1 1 240px",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.line}`,
                    fontSize: 12,
                    background: "#FFF",
                    color: COLORS.ink,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Select Saved Quote to Load ({filteredHistory.length} Available) --</option>
                  {filteredHistory.map((hq) => (
                    <option key={hq.id} value={hq.id}>
                      [{hq.id}] {hq.title} {hq.pic ? `· PIC: ${hq.pic}` : ""} ({hq.activityDate || "TBA"}) - {hq.status || "Draft"}
                    </option>
                  ))}
                </select>
                {currentQuote?.id && (
                  <span style={{ fontSize: 11, color: COLORS.sand, background: COLORS.ocean, padding: "3px 8px", borderRadius: 6, fontWeight: 600, fontFamily: "monospace" }}>
                    Active ID: {currentQuote.id}
                  </span>
                )}
              </div>

              {loadNotice.text && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: loadNotice.type === "error" ? "#FFEBEE" : "#E8F5E9",
                    color: loadNotice.type === "error" ? "#C62828" : "#2E7D32",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {loadNotice.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{loadNotice.text}</span>
                </div>
              )}
            </div>

            {/* Days Cart */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 16, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.sand, fontWeight: 600, fontSize: 13 }}>
                  <Calendar size={15} color={COLORS.coralSoft} />
                  Multi-Day Tour Cart ({days.length} Day{days.length > 1 ? "s" : ""})
                </div>
                <button
                  onClick={() => addNewDay()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: COLORS.sand,
                    color: COLORS.ink,
                    border: "none",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={13} /> Add Day
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="no-scrollbar">
                {days.map((day, idx) => (
                  <div
                    key={day.id}
                    onClick={() => setActiveDayIndex(idx)}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: activeDayIndex === idx ? COLORS.coral : COLORS.ocean,
                      color: activeDayIndex === idx ? COLORS.sand : COLORS.muted,
                      fontWeight: 600,
                      fontSize: 13,
                      border: `1px solid ${activeDayIndex === idx ? COLORS.coral : COLORS.oceanLight}`,
                    }}
                  >
                    <span>{day.title}</span>
                    {days.length > 1 && (
                      <X
                        size={13}
                        onClick={(e) => removeDay(idx, e)}
                        style={{ opacity: 0.7, cursor: "pointer" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Package Shortcuts Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Sparkles size={13} color={COLORS.coralSoft} />
                <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>
                  Package Shortcuts for {activeDay.title}:
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="no-scrollbar">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetToDay(activeDayIndex, p)}
                    style={{
                      flexShrink: 0,
                      padding: "7px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: COLORS.sand,
                      color: COLORS.ink,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Pricing Card */}
            <div
              style={{
                background: COLORS.sand,
                borderRadius: 18,
                padding: "18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                marginBottom: 18,
              }}
            >
              {/* Pax Stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <Users size={16} color={COLORS.ink} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600 }}>Adults</span>
                  <button className="stepper-btn" onClick={() => setAdults((a) => Math.max(1, a - 1))} style={stepBtn(COLORS.deep, COLORS.sand)}>
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: COLORS.ink }}>{adults}</span>
                  <button className="stepper-btn" onClick={() => setAdults((a) => a + 1)} style={stepBtn(COLORS.coral, COLORS.sand)}>
                    <Plus size={12} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600 }}>Kids</span>
                  <button className="stepper-btn" onClick={() => setKids((k) => Math.max(0, k - 1))} style={stepBtn(COLORS.deep, COLORS.sand)}>
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: COLORS.ink }}>{kids}</span>
                  <button className="stepper-btn" onClick={() => setKids((k) => k + 1)} style={stepBtn(COLORS.coral, COLORS.sand)}>
                    <Plus size={12} />
                  </button>
                </div>
                {kids > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Child Rate:</span>
                    <input
                      type="number"
                      value={kidsRate}
                      onChange={(e) => setKidsRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                      style={{
                        width: 44,
                        padding: "3px 4px",
                        borderRadius: 6,
                        border: `1px solid ${COLORS.line}`,
                        fontSize: 12,
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    />
                    <span style={{ fontSize: 12, color: COLORS.muted }}>%</span>
                  </div>
                )}
              </div>

              {/* Sell Price Display Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>
                    Total Sell Price ({days.length} Day{days.length > 1 ? "s" : ""})
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 32, color: COLORS.ink, lineHeight: 1.1 }}>
                    {idr(totals.price)}
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "none",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: "6px 10px",
                    color: COLORS.muted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Per Pax Breakdown Cards */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: COLORS.sandDeep, padding: "8px 12px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>Adult Price / pax</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{idr(totals.adultPricePax)}</div>
                </div>
                {kids > 0 && (
                  <div style={{ flex: 1, background: COLORS.sandDeep, padding: "8px 12px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>Child Price / pax ({kidsRate}%)</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.coral }}>{idr(totals.childPricePax)}</div>
                  </div>
                )}
              </div>

              {/* Cost & Profit Margin Bar */}
              {canSeeCosts ? (
                <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12, paddingBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>Profit Margin Target</span>
                      {!isGodUser && userMinMargin > 0 && (
                        <span style={{ fontSize: 11, color: COLORS.coral, fontWeight: 700 }}>(Min {userMinMargin}% enforced)</span>
                      )}
                    </label>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: COLORS.coral }}>{margin}%</span>
                  </div>
                  <input
                    type="range"
                    min={isGodUser ? 0 : userMinMargin}
                    max={100}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    style={{ width: "100%", display: "block" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.ink, marginTop: 8 }}>
                    <span>Vendor Cost: {idr(totals.cost)}</span>
                    <span>Est. Profit: {idr(totals.profit)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 8, paddingBottom: 8, fontSize: 11.5, color: COLORS.muted, display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={13} color={COLORS.coral} />
                  <span>Vendor cost details & profit margin locked by policy.</span>
                </div>
              )}

              {/* Selected Items Breakdown Drawer */}
              <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
                <button
                  onClick={() => setShowBreakdown((b) => !b)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    color: COLORS.ink,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <List size={15} color={COLORS.coral} />
                    <span>Selected Tour Items ({totals.lineCount} items)</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: showBreakdown ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {showBreakdown && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {totals.dayBreakdowns.map(({ day, dayCost, selectedItems }, dIdx) => (
                      <div key={day.id} style={{ background: COLORS.sandDeep, borderRadius: 12, padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12.5, color: COLORS.ink, marginBottom: 6 }}>
                          <span>{day.title} Items:</span>
                          {canSeeCosts && <span>Subtotal: {idr(dayCost)}</span>}
                        </div>
                        {selectedItems.length === 0 ? (
                          <div style={{ fontSize: 11.5, color: COLORS.muted }}>No items selected for this day. Click items below to add.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {selectedItems.map((itemObj, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 12,
                                  background: COLORS.sand,
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 600, color: COLORS.ink }}>{itemObj.item.name}</span>
                                  {canSeeCosts && (
                                    <span style={{ color: COLORS.muted, fontSize: 11, marginLeft: 6 }}>({itemObj.caption})</span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {canSeeCosts && <span style={{ fontWeight: 700, color: COLORS.ink }}>{idr(itemObj.cost)}</span>}
                                  <button
                                    onClick={() => removeItemFromDay(dIdx, itemObj)}
                                    title="Remove item"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: COLORS.coral,
                                      cursor: "pointer",
                                      padding: 0,
                                      display: "flex",
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Item Search Input */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={15} color={COLORS.muted} style={{ position: "absolute", left: 12, top: 11 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search items to add to ${activeDay.title}…`}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 34px",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.oceanLight}`,
                  background: COLORS.ocean,
                  color: COLORS.sand,
                  fontSize: 13.5,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Catalog Accordions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCatalog.map((cat) => {
                const selectedInCat = cat.items.filter((i) =>
                  isSelected(getConfig(i.id, cat.id, i.name))
                );
                const isOpen = open[cat.id] || query.trim().length > 0;

                return (
                  <div key={cat.id} style={{ background: COLORS.oceanLight, borderRadius: 14, overflow: "hidden" }}>
                    <button
                      onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "13px 15px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div style={{ color: COLORS.sand, fontWeight: 600, fontSize: 14 }}>{cat.title}</div>
                        {selectedInCat.length > 0 && (
                          <div style={{ color: COLORS.coralSoft, fontSize: 11.5, marginTop: 1 }}>
                            {selectedInCat.length} selected for {activeDay.title}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={17}
                        color={COLORS.sand}
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{ background: COLORS.sand }}>
                        {cat.items.map((item) => {
                          const cfg = getConfig(item.id, cat.id, item.name);
                          const selected = isSelected(cfg);

                          return (
                            <div key={item.id} style={{ borderTop: `1px solid ${COLORS.line}`, padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 500 }}>{item.name}</div>
                                {canSeeCosts && <div style={{ fontSize: 11.5, color: COLORS.muted }}>{ruleCaption(item, cfg, totalPax)}</div>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {cfg.mode === "flat" ? (
                                  <>
                                    <button onClick={() => setItemQty(item.id, cat.id, item.name, (cfg.qty || 0) - 1)} style={stepBtn(COLORS.deep, COLORS.sand)}>
                                      <Minus size={12} />
                                    </button>
                                    <span style={{ minWidth: 16, textAlign: "center", fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{cfg.qty || 0}</span>
                                    <button onClick={() => setItemQty(item.id, cat.id, item.name, (cfg.qty || 0) + 1)} style={stepBtn(COLORS.coral, COLORS.sand)}>
                                      <Plus size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => toggleInclude(item.id, cat.id, item.name, cfg)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: selected ? COLORS.profit : COLORS.coral, color: "#FFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    {selected ? "Selected ✓" : "+ Add"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Proposal & Itinerary Generator */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 18, padding: 16, marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.sand, fontWeight: 700, fontSize: 14 }}>
                  <Bot size={18} color={COLORS.coralSoft} />
                  <span>AI Proposal & Itinerary Assistant</span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setShowPromptCustomizer(!showPromptCustomizer)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.ocean,
                      color: COLORS.sand,
                      border: `1px solid ${COLORS.coralSoft}`,
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <SlidersHorizontal size={13} /> {showPromptCustomizer ? "Hide Settings" : "AI Prompt Style"}
                  </button>

                  <button
                    onClick={generateGeminiContent}
                    disabled={aiLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.coral,
                      color: COLORS.sand,
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: aiLoading ? 0.6 : 1,
                    }}
                  >
                    <Sparkles size={14} /> {aiLoading ? "Generating AI..." : "Generate AI Content"}
                  </button>
                </div>
              </div>

              {/* Prompt Settings Panel */}
              {showPromptCustomizer && (
                <div style={{ background: COLORS.ocean, borderRadius: 12, padding: 12, marginBottom: 12, border: `1px solid ${COLORS.coralSoft}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.sand, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Pencil size={13} color={COLORS.coral} />
                      <span>Customize Gemini AI Persona & Output Styling</span>
                    </div>
                    {isGodUser ? (
                      <span style={{ fontSize: 10.5, color: COLORS.sand, background: COLORS.coral, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        ⚡ GOD Master AI Privileges Active
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, color: COLORS.coralSoft }}>
                        (Using Master Defaults)
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 8 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 2 }}>Tone / Sales Persona</label>
                      <select
                        value={promptSettings.tone}
                        onChange={(e) => setPromptSettings({ ...promptSettings, tone: e.target.value })}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5, background: "#FFF", fontWeight: 600 }}
                      >
                        <option value="Warm & High-Converting Travel Advisor">Warm & High-Converting Travel Advisor ⭐</option>
                        <option value="VIP Luxury Concierge">VIP Luxury Concierge 💎</option>
                        <option value="Short & Punchy WhatsApp Closer">Short & Punchy WhatsApp Closer ⚡</option>
                        <option value="Casual & Friendly Island Local Guide">Casual & Friendly Local Guide 🌴</option>
                        <option value="Ultra Professional & Detailed Agency">Ultra Professional & Detailed Agency 🏢</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 2 }}>Output Language</label>
                      <select
                        value={promptSettings.language}
                        onChange={(e) => setPromptSettings({ ...promptSettings, language: e.target.value })}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5, background: "#FFF", fontWeight: 600 }}
                      >
                        <option value="English">English</option>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="Bilingual (English + Indonesian)">Bilingual (English & Indonesian)</option>
                        <option value="Mandarin Chinese">Mandarin Chinese (中文)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 2 }}>
                      Custom Tour Highlight Instructions
                    </label>
                    <input
                      type="text"
                      value={promptSettings.customInstructions}
                      onChange={(e) => setPromptSettings({ ...promptSettings, customInstructions: e.target.value })}
                      placeholder="e.g. Highlight photo spots at Treehouse, fast boat departure times..."
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5, boxSizing: "border-box" }}
                    />
                  </div>

                  {isGodUser && (
                    <div style={{ borderTop: `1px dashed ${COLORS.coralSoft}`, paddingTop: 8, marginTop: 6 }}>
                      <label style={{ display: "block", fontSize: 11, color: COLORS.coralSoft, fontWeight: 700, marginBottom: 2 }}>
                        ⚡ GOD Master AI System Prompt Template
                      </label>
                      <textarea
                        value={promptSettings.systemPromptTemplate || ""}
                        onChange={(e) => setPromptSettings({ ...promptSettings, systemPromptTemplate: e.target.value })}
                        rows={2}
                        placeholder="Master system prompt instructions for Gemini AI..."
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11, boxSizing: "border-box", background: "#FFF8F5", color: COLORS.ink }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Proposal Navigation Tabs */}
              <div style={{ display: "flex", gap: 6, background: COLORS.ocean, padding: 4, borderRadius: 10, marginBottom: 10 }}>
                <button
                  onClick={() => setAiTab("quote")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: aiTab === "quote" ? COLORS.sand : "transparent",
                    color: aiTab === "quote" ? COLORS.ink : COLORS.sand,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <FileText size={13} /> WhatsApp Text
                </button>
                <button
                  onClick={() => setAiTab("itinerary")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: aiTab === "itinerary" ? COLORS.sand : "transparent",
                    color: aiTab === "itinerary" ? COLORS.ink : COLORS.sand,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={13} /> Detailed Itinerary
                </button>
                <button
                  onClick={() => setAiTab("pitch")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: aiTab === "pitch" ? COLORS.sand : "transparent",
                    color: aiTab === "pitch" ? COLORS.ink : COLORS.sand,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <MessageSquare size={13} /> Sales Pitch
                </button>
              </div>

              {aiTab === "quote" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: COLORS.sand, fontWeight: 600 }}>WhatsApp Quotation Summary (Editable)</span>
                    <button
                      onClick={() => copyTextToClipboard(displayQuotationText)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: COLORS.coral,
                        color: COLORS.sand,
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <textarea
                    value={displayQuotationText}
                    onChange={(e) => updateCurrentQuote({ customQuoteText: e.target.value })}
                    rows={10}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 10,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      fontFamily: "monospace",
                      color: COLORS.ink,
                      background: "#FCFAF3",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {aiTab === "itinerary" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: COLORS.sand, fontWeight: 600 }}>AI Hour-by-Hour Itinerary (Editable)</span>
                    {currentQuote.aiItinerary && (
                      <button
                        onClick={() => copyTextToClipboard(currentQuote.aiItinerary)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: COLORS.coral,
                          color: COLORS.sand,
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied!" : "Copy Itinerary"}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={currentQuote.aiItinerary || ""}
                    onChange={(e) => updateCurrentQuote({ aiItinerary: e.target.value })}
                    placeholder="Click 'Generate AI Content' above to prompt Gemini for a detailed time schedule..."
                    rows={12}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 10,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      color: COLORS.ink,
                      background: "#FCFAF3",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {aiTab === "pitch" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: COLORS.sand, fontWeight: 600 }}>Sales Pitch (Editable)</span>
                    {currentQuote.aiPitch && (
                      <button
                        onClick={() => copyTextToClipboard(currentQuote.aiPitch)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: COLORS.coral,
                          color: COLORS.sand,
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {copied ? <Check size={12} /> : <Send size={12} />}
                        {copied ? "Copied!" : "Copy Pitch"}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={currentQuote.aiPitch || ""}
                    onChange={(e) => updateCurrentQuote({ aiPitch: e.target.value })}
                    placeholder="Click 'Generate AI Content' to draft a customized sales pitch..."
                    rows={8}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 10,
                      border: `1px solid ${COLORS.line}`,
                      fontSize: 12,
                      color: COLORS.ink,
                      background: "#FCFAF3",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {currentPage === "dashboard" && canAccessDashboard && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: COLORS.sand, borderRadius: 14, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
                  <TrendingUp size={16} color={COLORS.profit} />
                  Confirmed Revenue
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.ink, marginTop: 4 }}>
                  {idr(dashboardStats.totalRev)}
                </div>
              </div>

              {canSeeCosts && (
                <div style={{ background: COLORS.sand, borderRadius: 14, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
                    <DollarSign size={16} color={COLORS.coral} />
                    Estimated Profit
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.profit, marginTop: 4 }}>
                    {idr(dashboardStats.totalProfit)}
                  </div>
                </div>
              )}

              <div style={{ background: COLORS.sand, borderRadius: 14, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle2 size={16} color={COLORS.confirmedText} />
                  Confirmed Tours
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.ink, marginTop: 4 }}>
                  {dashboardStats.totalConfirmed} / {dashboardStats.totalSaved}
                </div>
              </div>

              <div style={{ background: COLORS.sand, borderRadius: 14, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
                  <FileSpreadsheet size={16} color={COLORS.coralSoft} />
                  Conversion Rate
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.ink, marginTop: 4 }}>
                  {dashboardStats.conversionRate}%
                </div>
              </div>
            </div>

            <div style={{ background: COLORS.sand, borderRadius: 16, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.ink }}>
                  Saved Quote & Booking History
                </h3>
                {!canSeeAllQuotes && (
                  <span style={{ fontSize: 11.5, color: COLORS.coral, fontWeight: 600 }}>
                    (Filtered: Viewing your personal quotations)
                  </span>
                )}
              </div>

              {filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: COLORS.muted, fontSize: 13 }}>
                  No saved quotes found. Save quotes in the simulator to view them here.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: COLORS.sandDeep,
                        borderRadius: 12,
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                          <Tag size={13} color={COLORS.coral} />
                          <span>{item.title}</span>
                          <span style={{ fontSize: 11, color: COLORS.muted, background: "#FFF", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                            ID: {item.id}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>
                          🗓 Date: <strong>{item.activityDate || "TBA"}</strong> · {item.days?.length || 1} Day(s) · {item.adults || 2} Pax
                          <span style={{ marginLeft: 8 }}>
                            | Created by: <strong>{item.savedBy || "agent"}</strong>
                            {item.pic && <span> | 👤 PIC: <strong>{item.pic}</strong> </span>}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ink }}>
                            {idr(item.calculatedPrice || 0)}
                          </div>
                          <select
                            value={item.status || "Draft"}
                            onChange={(e) => updateQuoteStatusInDashboard(item.id, e.target.value)}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: 6,
                              padding: "2px 6px",
                              border: `1px solid ${COLORS.line}`,
                              background: item.status === "Confirmed" ? "#E8F5E9" : "#FFF",
                              color: item.status === "Confirmed" ? "#2E7D32" : COLORS.ink,
                            }}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {currentPage === "catalog" && canEditCat && !isFreelanceSales && (
          <div style={{ background: COLORS.sand, borderRadius: 18, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: COLORS.ink }}>
                  Vendor Catalog Editor
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
                  Full GOD & Admin management for vendor pricing rules, items, and custom categories.
                </p>
              </div>

              <button
                onClick={handleResetCatalogToDefault}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: COLORS.coralSoft,
                  color: COLORS.ink,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} /> Reset Factory Catalog
              </button>
            </div>

            {/* Fast Item & Category Search Bar */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Search size={15} color={COLORS.muted} style={{ position: "absolute", left: 12, top: 11 }} />
              <input
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Search vendor items or categories..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 34px",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.line}`,
                  background: "#FFF",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Form to Add New Category */}
            <form onSubmit={handleAddNewCategory} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="New Category Title (e.g. Rafting & ATV, Helicopter Tours)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.line}`,
                  fontSize: 12.5,
                  background: "#FFF",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: COLORS.ocean,
                  color: COLORS.sand,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FolderPlus size={14} /> Add Category
              </button>
            </form>

            {/* Catalog Categories List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {searchedCatalog.map((cat) => (
                <div key={cat.id} style={{ background: "#FFF", borderRadius: 14, padding: 14, border: `1px solid ${COLORS.line}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ocean, display: "flex", alignItems: "center", gap: 6 }}>
                      <Folder size={16} color={COLORS.coral} />
                      <span>{cat.title}</span>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>({cat.items.length} items)</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      title="Delete category"
                      style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer", padding: 2 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Add Item Row Inside Category */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, background: COLORS.sandDeep, padding: 8, borderRadius: 8 }}>
                    <input
                      type="text"
                      placeholder="New vendor item name..."
                      value={newItemForms[cat.id]?.name || ""}
                      onChange={(e) =>
                        setNewItemForms({
                          ...newItemForms,
                          [cat.id]: { ...(newItemForms[cat.id] || {}), name: e.target.value },
                        })
                      }
                      style={{ flex: 2, padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                    />
                    <input
                      type="number"
                      placeholder="Vendor price (IDR)"
                      value={newItemForms[cat.id]?.price || ""}
                      onChange={(e) =>
                        setNewItemForms({
                          ...newItemForms,
                          [cat.id]: { ...(newItemForms[cat.id] || {}), price: e.target.value },
                        })
                      }
                      style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                    />
                    <button
                      onClick={() => handleAddCatalogItem(cat.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: COLORS.coral,
                        color: "#FFF",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* Items List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cat.items.map((item) => {
                      const auto = getAutoRuleForItem(cat.id, item.name, item);
                      return (
                        <div
                          key={item.id}
                          style={{
                            background: COLORS.sand,
                            borderRadius: 8,
                            padding: "8px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted }}>
                              Rule: <strong>{auto.mode.toUpperCase()}</strong>
                              {auto.mode === "unit" && ` · ${auto.capacity} pax/unit`}
                              {auto.mode === "tier" && ` · Base max ${auto.threshold} pax (+${idr(auto.surcharge)}/extra)`}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ocean }}>{idr(item.price)}</span>

                            <button
                              onClick={() => setEditingCatalogItem({ catId: cat.id, ...item, mode: auto.mode, capacity: auto.capacity, threshold: auto.threshold, surcharge: auto.surcharge })}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: `1px solid ${COLORS.line}`,
                                background: "#FFF",
                                color: COLORS.ink,
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Pencil size={12} color={COLORS.coral} /> Edit
                            </button>

                            <button
                              onClick={() => handleDeleteCatalogItem(cat.id, item.id)}
                              style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer", padding: 0 }}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {currentPage === "users" && isGodUser && (
          <div style={{ background: COLORS.sand, borderRadius: 18, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <ShieldAlert size={26} color={COLORS.coral} />
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: COLORS.ink }}>
                  GOD Access Governance & User Permissions
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
                  Assign user roles (Admin, Staff, Freelance Sales, Guides), passwords, and feature access permissions.
                </p>
              </div>
            </div>

            {/* Account Registration Form */}
            <div style={{ background: COLORS.sandDeep, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${COLORS.line}` }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={16} color={COLORS.coral} /> Register New Account & Assign Permissions
              </h3>

              {userNotice.text && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    marginBottom: 12,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: userNotice.type === "error" ? "#FFEBEE" : "#E8F5E9",
                    color: userNotice.type === "error" ? "#C62828" : "#2E7D32",
                    border: `1px solid ${userNotice.type === "error" ? "#EF9A9A" : "#A5D6A7"}`,
                  }}
                >
                  {userNotice.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{userNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleGodCreateUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Freelance Partner"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. alex2026"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Initial Password</label>
                    <input
                      type="text"
                      required
                      placeholder="Set account password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Role Class</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 600, background: "#FFF" }}
                    >
                      <option value="Staff Agent">Staff Agent</option>
                      <option value="Freelance Sales">Freelance Sales (Simulator Only)</option>
                      <option value="Partner Agency / B2B Reseller">Partner Agency / B2B Reseller</option>
                      <option value="Tour Guide / Field Lead">Tour Guide / Field Lead</option>
                      <option value="Operations & Finance">Operations & Finance</option>
                      <option value="Admin Manager">Admin Manager</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, background: COLORS.sand, padding: 10, borderRadius: 8 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.ink, marginBottom: 2 }}>Min Margin % Target</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newUserForm.minMargin}
                      onChange={(e) => setNewUserForm({ ...newUserForm, minMargin: Number(e.target.value) })}
                      style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12, boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newUserForm.canAccessDashboard !== false}
                        onChange={(e) => setNewUserForm({ ...newUserForm, canAccessDashboard: e.target.checked })}
                      />
                      <span>Allow Dashboard Access (Track Personal Quotes)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newUserForm.canEditCatalog}
                        onChange={(e) => setNewUserForm({ ...newUserForm, canEditCatalog: e.target.checked })}
                      />
                      <span>Allow Editing Master Catalog</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newUserForm.canSeeAllDashboardQuotes}
                        onChange={(e) => setNewUserForm({ ...newUserForm, canSeeAllDashboardQuotes: e.target.checked })}
                      />
                      <span>Can View All Staff Quotes in Dashboard</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: COLORS.coral,
                    color: "#FFF",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <UserPlus size={14} /> Create Account
                </button>
              </form>
            </div>

            {/* Account Directory */}
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: COLORS.ink }}>
              System Accounts Governance Directory
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {usersList.map((user) => (
                <div
                  key={user.id}
                  style={{
                    background: COLORS.sandDeep,
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                      {user.role === "GOD" ? <ShieldAlert size={14} color={COLORS.coral} /> : <User size={14} color={COLORS.muted} />}
                      {user.name}
                      <span style={{ fontSize: 11, color: COLORS.muted }}>({user.username})</span>
                      <span style={{ fontSize: 11, color: COLORS.coral, fontWeight: 700, background: "#FFF", padding: "1px 6px", borderRadius: 4 }}>
                        Pass: {user.password || "N/A"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>
                      Role: <strong>{user.role}</strong> · Min Margin: <strong>{user.minMargin}%</strong> ·
                      Vendor Costs: <strong>{user.canSeeVendorCosts ? "Visible" : "Hidden"}</strong> ·
                      Dashboard Access: <strong>{user.canAccessDashboard !== false ? "Enabled" : "Disabled"}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => setEditingUser(user)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        background: COLORS.ocean,
                        color: COLORS.sand,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Pencil size={12} /> {user.role === "GOD" ? "Edit Password" : "Edit Permissions"}
                    </button>
                    {user.role !== "GOD" && (
                      <button
                        onClick={() => deleteUserAccount(user.id)}
                        style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {}
      {editingCatalogItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: COLORS.sand,
              borderRadius: 18,
              width: "100%",
              maxWidth: 480,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.ink }}>
                Edit Vendor Item: {editingCatalogItem.name}
              </h3>
              <button onClick={() => setEditingCatalogItem(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color={COLORS.muted} />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogItem} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCatalogItem.name}
                  onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
                  style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 600, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                  Base Vendor Cost Price (IDR)
                </label>
                <input
                  type="number"
                  required
                  value={editingCatalogItem.price}
                  onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, price: e.target.value })}
                  style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 13, fontWeight: 700, color: COLORS.ocean, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                  Pricing Mode Rule
                </label>
                <select
                  value={editingCatalogItem.mode || "pax"}
                  onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, mode: e.target.value })}
                  style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 600, background: "#FFF" }}
                >
                  <option value="pax">Per Pax (Multiplied by total pax count)</option>
                  <option value="unit">Shared per Unit (Vehicle/Boat/Hotel Room capacity)</option>
                  <option value="flat">Manual Qty / Flat Rate</option>
                  <option value="tier">Tiered Rate (Base pax max + extra surcharge)</option>
                </select>
              </div>

              {editingCatalogItem.mode === "unit" && (
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: COLORS.muted, marginBottom: 2 }}>
                    Max Pax Capacity Per Unit:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingCatalogItem.capacity || 4}
                    onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, capacity: e.target.value })}
                    style={{ width: 100, padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                  />
                </div>
              )}

              {editingCatalogItem.mode === "tier" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: COLORS.muted, marginBottom: 2 }}>
                      Included Base Pax:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingCatalogItem.threshold || 2}
                      onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, threshold: e.target.value })}
                      style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: COLORS.muted, marginBottom: 2 }}>
                      Extra Surcharge / Pax:
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingCatalogItem.surcharge || 50000}
                      onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, surcharge: e.target.value })}
                      style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingCatalogItem(null)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#FFF", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                >
                  Save Item Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: COLORS.sand,
              borderRadius: 18,
              width: "100%",
              maxWidth: 480,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.ink }}>
                {editingUser.role === "GOD" ? `Edit Password: ${editingUser.name}` : `Edit Permissions: ${editingUser.name}`}
              </h3>
              <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color={COLORS.muted} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                  Assigned Password
                </label>
                <input
                  type="text"
                  value={editingUser.password || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 700, boxSizing: "border-box" }}
                />
              </div>

              {editingUser.role !== "GOD" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                      Role Class
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 700, background: "#FFF" }}
                    >
                      <option value="Staff Agent">Staff Agent</option>
                      <option value="Freelance Sales">Freelance Sales (Simulator Only)</option>
                      <option value="Partner Agency / B2B Reseller">Partner Agency / B2B Reseller</option>
                      <option value="Tour Guide / Field Lead">Tour Guide / Field Lead</option>
                      <option value="Operations & Finance">Operations & Finance</option>
                      <option value="Admin Manager">Admin Manager</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
                      Minimum Enforced Profit Margin %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingUser.minMargin || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, minMargin: Number(e.target.value) })}
                      style={{ width: 100, padding: "7px 9px", borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 12, fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, background: COLORS.sandDeep, padding: 12, borderRadius: 10 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editingUser.canAccessDashboard !== false}
                        onChange={(e) => setEditingUser({ ...editingUser, canAccessDashboard: e.target.checked })}
                      />
                      <span>Allow Access to Personal Dashboard & Quote Tracking</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!editingUser.canSeeVendorCosts}
                        onChange={(e) => setEditingUser({ ...editingUser, canSeeVendorCosts: !e.target.checked })}
                      />
                      <span>Hide Vendor Costs & Internal Profit Margin</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editingUser.canEditCatalog}
                        onChange={(e) => setEditingUser({ ...editingUser, canEditCatalog: e.target.checked })}
                      />
                      <span>Can Edit Master Vendor Catalog</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.ink, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editingUser.canSeeAllDashboardQuotes}
                        onChange={(e) => setEditingUser({ ...editingUser, canSeeAllDashboardQuotes: e.target.checked })}
                      />
                      <span>Can View All Staff Quotes in Dashboard</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={saveUpdatedUserPermissions}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: COLORS.coral, color: "#FFF", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}