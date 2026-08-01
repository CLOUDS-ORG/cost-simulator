"use client"
import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Sun,
  Moon,
  Cloud,
  CloudLightning,
  Activity,
  Globe,
  Wifi,
  Package,
} from "lucide-react";

const COLORS = {
  ocean: "#082624",
  oceanLight: "#0F3D3A",
  deep: "#0B2E2C",
  cardSub: "#165450",
  sand: "#F4EEDD",
  sandDeep: "#EFECE6",
  coral: "#E05A47",
  coralSoft: "#F28C7D",
  ink: "#132422",
  muted: "#3B5B56",
  line: "#1C6B66",
  profit: "#1B5E20",
  confirmedText: "#1B5E20",
};

const DEFAULT_CATALOG = [
  {
    id: "dive",
    title: "Snorkeling & Diving",
    items: [
      ["Wonderland 4 Place", 900000],
      ["Elite 4 Place", 900000],
      ["Ocean 4 Place", 1200000],
      ["Gili Snorkeling", 150000],
      ["Wonderland 3 Place", 800000],
      ["Elite 3 Place", 850000],
      ["Ocean 3 Place", 900000],
      ["Wonderland 2 Place", 750000],
      ["Elite 2 Place", 800000],
      ["Ocean 2 Place", 850000],
      ["Sharing Snorkeling", 150000],
      ["No Snorkeling", 0],
      ["Manta Point Private", 2500000],
      ["Manta Point Sharing", 300000],
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
      ["Angel Bilabong 125", 125000],
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
      ["Retribution Fee", 25000],
      ["Diamond & Atuh Entry", 60000],
      ["Tree House Entry", 30000],
      ["Paluang Cliff Entry", 35000],
      ["Kelapa Glass", 10000],
      ["Kelapa Whole", 20000],
      ["Welcome Drink Arjuna 5", 5000],
      ["Welcome Drink Arjuna 10", 10000],
      ["Welcome Drink Maruti", 20000],
      ["Guide Fee Day", 500000],
      ["Guide Gili Fee", 500000],
      ["Beer Local", 50000],
      ["Pontoon Pass", 50000],
      ["Push Bike Rental", 50000],
      ["Sunset Drink Gili", 50000],
    ],
  },
  {
    id: "hotel",
    title: "Accommodation & Hotels",
    items: [
      ["Accommodation Semabu Resort", 1800000],
      ["Accommodation AWK Resort", 1500000],
      ["Accommodation MAUA Villa", 2900000],
      ["Accommodation Gili Hotel", 700000],
    ],
  },
  {
    id: "car",
    title: "Car Transport Vendor",
    items: [
      ["West Car Transport", 450000],
      ["East Car Transport", 450000],
      ["Combination West-East Car", 550000],
      ["Extra Car 500", 500000],
      ["Extra Car 350", 350000],
      ["Extra Car 250", 250000],
      ["Extra Car 150", 150000],
      ["Extra Car 50", 50000],
      ["Luggage Van", 200000],
      ["No Car Transport", 0],
    ],
  },
  {
    id: "transport",
    title: "Transport Bali (Drop-off)",
    items: [
      ["Kuta Transfer", 300000],
      ["Seminyak Transfer", 300000],
      ["Denpasar Transfer", 300000],
      ["Nusa Dua Transfer", 350000],
      ["Jimbaran Transfer", 350000],
      ["Uluwatu Transfer", 400000],
      ["Ubud Transfer", 400000],
      ["Canggu Transfer", 400000],
      ["No Bali Transfer", 0],
    ],
  },
  {
    id: "boat",
    title: "Fast Boat Vendor",
    items: [
      ["Maruti Return Ticket", 250000],
      ["Maruti One Way Ticket", 110000],
      ["Rayfish Return Ticket", 200000],
      ["Rayfish One Way Ticket", 120000],
      ["Einstein Return Ticket", 300000],
      ["Einstein One Way Ticket", 150000],
      ["Axestone Return Ticket", 200000],
      ["Axestone One Way Ticket", 100000],
      ["Eka Jaya Gili Fast Boat", 500000],
      ["Sanjaya Return Ticket", 180000],
      ["Sanjaya One Way Ticket", 75000],
      ["Arjuna Return Ticket", 150000],
      ["Arjuna One Way Ticket", 75000],
      ["Gangga Return Ticket", 200000],
      ["Glory Return Ticket", 200000],
      ["Boat Guide Ticket", 100000],
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
    id: "west-pkg",
    label: "West Nusa Penida Tour",
    picks: [
      ["car", "West Car Transport"],
      ["boat", "Maruti Return Ticket"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Retribution Fee"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
  {
    id: "east-pkg",
    label: "East Nusa Penida Tour",
    picks: [
      ["car", "East Car Transport"],
      ["boat", "Maruti Return Ticket"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Diamond & Atuh Entry"],
      ["inclusion", "Retribution Fee"],
      ["inclusion", "Snack Box + Mineral"],
    ],
  },
  {
    id: "combo-pkg",
    label: "West + East Combination",
    picks: [
      ["car", "Combination West-East Car"],
      ["boat", "Maruti Return Ticket"],
      ["resto", "Arjuna Lunch 100"],
      ["inclusion", "Retribution Fee"],
      ["inclusion", "Diamond & Atuh Entry"],
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
  {
    id: "guide-1",
    username: "guide1",
    password: "123",
    email: "guide1@tourhq.com",
    name: "Made Tour Guide Lead",
    role: "Tour Guide / Field Lead",
    status: "Approved",
    minMargin: 20,
    canSeeVendorCosts: false,
    canEditCatalog: false,
    canOverrideCosts: false,
    canEditPresets: false,
    canSeeAllDashboardQuotes: false,
    canAccessDashboard: true,
    createdAt: "2026-04-10",
  },
  {
    id: "partner-1",
    username: "partner1",
    password: "123",
    email: "partner1@agency.com",
    name: "Bali Horizons B2B Reseller",
    role: "Partner Agency / B2B Reseller",
    status: "Approved",
    minMargin: 15,
    canSeeVendorCosts: false,
    canEditCatalog: false,
    canOverrideCosts: false,
    canEditPresets: false,
    canSeeAllDashboardQuotes: false,
    canAccessDashboard: true,
    createdAt: "2026-05-01",
  },
];

const AI_PERSONAS = [
  {
    id: "advisor",
    title: "Warm Travel Advisor (Recommended)",
    description: "Friendly, structured, high-converting WhatsApp proposal highlighting seamless private logistics.",
  },
  {
    id: "vip",
    title: "VIP Luxury Concierge",
    description: "Exclusive white-glove tone emphasizing privacy, unhurried timing, and premium experiences.",
  },
  {
    id: "closer",
    title: "Short & Punchy WhatsApp Closer",
    description: "Direct bulleted format optimized for quick client phone viewing and fast deposit closing.",
  },
  {
    id: "guide",
    title: "Friendly Island Local Guide",
    description: "Authentic local hospitality sharing insider photo spot tips and warm advice.",
  },
  {
    id: "bilingual",
    title: "Bilingual Specialist (English + Indonesian)",
    description: "Clear dual-language proposal ideal for international & domestic group bookings.",
  },
];

const AI_LANGUAGES = [
  "English",
  "Bahasa Indonesia",
  "Bilingual (English + Indonesian)",
  "Mandarin Chinese",
  "French",
  "German",
  "Japanese",
  "Russian",
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

const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API blocked or unavailable, using fallback...", err);
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error("Fallback copy failed:", fallbackErr);
    return false;
  }
};

export default function App() {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem("system_theme_preference");
      if (saved) return saved;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("system_theme_preference", themeMode);
    } catch (e) {
      console.error(e);
    }
  }, [themeMode]);

  const isDark = themeMode === "dark";

  const THEME = useMemo(() => {
    if (isDark) {
      return {
        bg: "#082624",
        cardBg: "#0F3D3A",
        cardDeepBg: "#0B2E2C",
        cardSub: "#165450",
        textMain: "#F4EEDD",
        textMuted: "#92C1BA",
        border: "#1C6B66",
        inputBg: "#0B2E2C",
        inputText: "#F4EEDD",
      };
    }
    return {
      bg: "#F2EFE9",
      cardBg: "#FFFFFF",
      cardDeepBg: "#EFECE6",
      cardSub: "#0E4A47",
      textMain: "#132422",
      textMuted: "#3B5B56",
      border: "#C8BEA7",
      inputBg: "#FFFFFF",
      inputText: "#132422",
    };
  }, [isDark]);

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("tourhq_activity_logs_v3");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem("system_users_v8");
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("active_user_session_v8");
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
  const canEditPresets = isGodUser || (!isFreelanceSales && !!effectiveUser?.canEditPresets);
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

  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("supabase_cloud_config_v1");
      return saved ? JSON.parse(saved) : { url: "", apiKey: "", autoSync: true };
    } catch (e) {
      return { url: "", apiKey: "", autoSync: true };
    }
  });

  const [catalog, setCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_catalog_v8");
      return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
    } catch (e) {
      return DEFAULT_CATALOG;
    }
  });

  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_presets_v8");
      return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
    } catch (e) {
      return DEFAULT_PRESETS;
    }
  });

  const [savedHistory, setSavedHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_quote_history_v8");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showAiItineraryModal, setShowAiItineraryModal] = useState(false);
  const [aiItineraryPrompt, setAiItineraryPrompt] = useState("");
  const [generatedAiItinerary, setGeneratedAiItinerary] = useState("");
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [aiPersona, setAiPersona] = useState("advisor");
  const [aiLanguage, setAiLanguage] = useState("English");
  const [masterAiPrompt, setMasterAiPrompt] = useState(() => {
    try {
      const saved = localStorage.getItem("god_master_ai_prompt_v1");
      return (
        saved ||
        "You are an expert, warm, and high-converting Bali & Nusa Penida tour coordinator. Create a clear, engaging tour proposal for WhatsApp."
      );
    } catch (e) {
      return "You are an expert, warm, and high-converting Bali & Nusa Penida tour coordinator.";
    }
  });
  const [generatedAiProposal, setGeneratedAiProposal] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const logUserActivity = useCallback((actionDescription, quoteId = null) => {
    if (!currentUser) return;
    const logEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      username: currentUser.username,
      role: currentUser.role,
      action: actionDescription,
      quoteId: quoteId || "",
    };

    setActivityLogs((prev) => {
      const updated = [logEntry, ...prev].slice(0, 50);
      try {
        localStorage.setItem("tourhq_activity_logs_v3", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("system_users_v8", JSON.stringify(usersList));
    } catch (e) {
      console.error(e);
    }
  }, [usersList]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("active_user_session_v8", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("active_user_session_v8");
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("saved_quote_history_v8", JSON.stringify(savedHistory));
    } catch (e) {
      console.error(e);
    }
  }, [savedHistory]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_catalog_v8", JSON.stringify(catalog));
    } catch (e) {
      console.error(e);
    }
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_presets_v8", JSON.stringify(presets));
    } catch (e) {
      console.error(e);
    }
  }, [presets]);

  const createDefaultQuoteSession = (titleOverride = null) => {
    const minM = currentUser?.minMargin ?? 25;
    const seriesNumber = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `QUOTE-${seriesNumber}-${Date.now().toString().slice(-4)}`;
    return {
      id: generatedId,
      title: titleOverride || generatedId,
      status: "Draft",
      pic: currentUser?.name || "Wayman Lead",
      agent: currentUser?.role || "Staff Agent",
      savedBy: currentUser?.username || "system",
      activityDate: new Date().toISOString().split("T")[0],
      confirmedAt: null,
      adults: 2,
      kids: 0,
      kidsRate: 65,
      margin: Math.max(25, minM),
      days: [
        {
          id: `day-${Date.now()}-1`,
          title: "Day 1 - Nusa Penida West",
          presetName: "",
          itemConfig: {},
          custom: [],
        },
      ],
      activeDayIndex: 0,
    };
  };

  const [quotes, setQuotes] = useState([createDefaultQuoteSession()]);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const [open, setOpen] = useState({ dive: true, car: true, boat: true, resto: true, inclusion: true });
  const [query, setQuery] = useState("");
  const [loadNotice, setLoadNotice] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);

  const [editingCatalogItem, setEditingCatalogItem] = useState(null);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newItemForms, setNewItemForms] = useState({});

  const [customItemForm, setCustomItemForm] = useState({ name: "", price: "", mode: "flat" });

  const [editingPreset, setEditingPreset] = useState(null);
  const [newPresetForm, setNewPresetForm] = useState({ label: "", picks: [] });

  const currentQuote = quotes[activeQuoteIndex] || quotes[0];

  const updateCurrentQuote = (patch) => {
    setQuotes((prev) =>
      prev.map((q, i) => (i === activeQuoteIndex ? { ...q, ...patch } : q))
    );
  };

  const handleAddNewWorkspaceTab = () => {
    const newSession = createDefaultQuoteSession();
    setQuotes((prev) => [...prev, newSession]);
    setActiveQuoteIndex(quotes.length);
    logUserActivity(`Opened new workspace tab ${newSession.id}`, newSession.id);
  };

  const handleCloseWorkspaceTab = (tabIdx) => {
    if (quotes.length <= 1) return;
    setQuotes((prev) => prev.filter((_, i) => i !== tabIdx));
    if (activeQuoteIndex >= quotes.length - 1) {
      setActiveQuoteIndex(Math.max(0, quotes.length - 2));
    }
  };

  const adults = currentQuote?.adults || 2;
  const setAdults = (val) => {
    const nextVal = typeof val === "function" ? val(currentQuote.adults) : val;
    updateCurrentQuote({ adults: nextVal });
    logUserActivity(`Changed adults count to ${nextVal}`, currentQuote?.id);
  };

  const kids = currentQuote?.kids || 0;
  const setKids = (val) => {
    const nextVal = typeof val === "function" ? val(currentQuote.kids) : val;
    updateCurrentQuote({ kids: nextVal });
    logUserActivity(`Changed kids count to ${nextVal}`, currentQuote?.id);
  };

  const kidsRate = currentQuote?.kidsRate || 65;
  const setKidsRate = (val) => {
    const nextVal = typeof val === "function" ? val(currentQuote.kidsRate) : val;
    updateCurrentQuote({ kidsRate: nextVal });
  };

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

  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    const newDay = {
      id: `day-${Date.now()}-${nextDayNum}`,
      title: `Day ${nextDayNum} - Itinerary`,
      presetName: "",
      itemConfig: {},
      custom: [],
    };
    setDays((prev) => [...prev, newDay]);
    setActiveDayIndex(days.length);
    logUserActivity(`Added Day ${nextDayNum} to itinerary`, currentQuote?.id);
  };

  const handleRemoveDay = (dayIdx) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, idx) => idx !== dayIdx));
    if (activeDayIndex >= days.length - 1) {
      setActiveDayIndex(Math.max(0, days.length - 2));
    }
    logUserActivity(`Removed Day ${dayIdx + 1} from itinerary`, currentQuote?.id);
  };

  const handleUpdateDayTitle = (newTitle) => {
    setDays((prev) =>
      prev.map((d, i) => (i === activeDayIndex ? { ...d, title: newTitle } : d))
    );
  };

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemForm.name.trim() || !customItemForm.price) return;

    const newCustom = {
      id: `custom-${Date.now()}`,
      name: customItemForm.name.trim(),
      price: Number(customItemForm.price) || 0,
      mode: customItemForm.mode || "flat",
      qty: 1,
    };

    setDays((prev) =>
      prev.map((d, i) =>
        i === activeDayIndex ? { ...d, custom: [...(d.custom || []), newCustom] } : d
      )
    );

    setCustomItemForm({ name: "", price: "", mode: "flat" });
    logUserActivity(`Added custom item "${newCustom.name}" to Day ${activeDayIndex + 1}`, currentQuote?.id);
  };

  const handleRemoveCustomItem = (customId) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === activeDayIndex ? { ...d, custom: (d.custom || []).filter((c) => c.id !== customId) } : d
      )
    );
  };

  const handleRemoveItemFromDay = (dayId, itemId, catId, itemName, cfgMode) => {
    if (catId === "custom") {
      setDays((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, custom: (d.custom || []).filter((c) => c.id !== itemId) } : d))
      );
    } else {
      setDays((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const currentCfg = d.itemConfig[itemId];
          if (!currentCfg) return d;
          if (currentCfg.mode === "flat" || cfgMode === "flat") {
            return {
              ...d,
              itemConfig: { ...d.itemConfig, [itemId]: { ...currentCfg, qty: 0 } },
            };
          }
          return {
            ...d,
            itemConfig: { ...d.itemConfig, [itemId]: { ...currentCfg, included: false, override: "" } },
          };
        })
      );
    }
    logUserActivity(`Removed item "${itemName}" from tour itinerary`, currentQuote?.id);
  };

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
      setAuthNotice({ type: "success", text: "Welcome Master GOD! Unrestricted permissions active." });
      setCurrentPage("simulator");
      logUserActivity("Logged in via GOD Master Key");
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

    setCurrentUser(found);
    setAuthNotice({ type: "success", text: `Logged in as ${found.name} (${found.role})` });
    setCurrentPage("simulator");
    logUserActivity(`Logged in as ${found.username} (${found.role})`);
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
    setUserNotice({ type: "success", text: `Account for "${createdUser.name}" created and synced!` });
    logUserActivity(`GOD created new account: ${createdUser.username} (${createdUser.role}) with min margin ${createdUser.minMargin}%`);

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

  const deleteUserAccount = (userId) => {
    const target = usersList.find((u) => u.id === userId);
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    if (target) logUserActivity(`GOD deleted user account: ${target.username}`);
  };

  const handleLogout = () => {
    logUserActivity("Logged out");
    setCurrentUser(null);
    setAuthNotice({ type: "", text: "" });
  };

  const loadQuoteById = (targetId) => {
    if (!targetId || !targetId.trim()) return;
    const cleanId = targetId.trim().toLowerCase();

    const found = savedHistory.find(
      (q) => q.id && q.id.toLowerCase().includes(cleanId)
    );

    if (!found) {
      setLoadNotice({ type: "error", text: `No saved quote found matching ID "${targetId.trim()}".` });
      setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
      return;
    }

    if (!canSeeAllQuotes && found.savedBy !== currentUser?.username && found.pic !== currentUser?.name) {
      setLoadNotice({ type: "error", text: "Permission denied: You do not have access to this quote." });
      setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
      return;
    }

    const existingIndex = quotes.findIndex((q) => q.id === found.id);
    if (existingIndex >= 0) {
      setActiveQuoteIndex(existingIndex);
      setLoadNotice({ type: "success", text: `Switched to active workspace tab for Quote ID: ${found.id}` });
    } else {
      setQuotes((prev) => [...prev, found]);
      setActiveQuoteIndex(quotes.length);
      setLoadNotice({ type: "success", text: `Loaded Quote ID: ${found.id} into workspace!` });
    }

    logUserActivity(`Loaded Quote ID ${found.id} into simulator`, found.id);
    setTimeout(() => setLoadNotice({ type: "", text: "" }), 4000);
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
    logUserActivity(`Set item "${itemName}" qty to ${v}`, currentQuote?.id);
  };

  const toggleInclude = (id, catId, itemName, cfg) => {
    const nextVal = !cfg.included;
    updateActiveDayConfig(id, catId, itemName, {
      included: nextVal,
      override: "",
    });
    logUserActivity(`${nextVal ? "Added" : "Removed"} item "${itemName}"`, currentQuote?.id);
  };

  const applyPresetShortcut = (preset) => {
    if (!preset || !preset.picks) return;
    const newConfig = { ...activeDay.itemConfig };

    preset.picks.forEach(([catId, itemName]) => {
      const foundItem = catalog
        .flatMap((c) => c.items)
        .find((i) => i.name === itemName || i.name.toLowerCase().includes(itemName.toLowerCase()));

      if (foundItem) {
        const auto = getAutoRuleForItem(catId, foundItem.name, foundItem);
        const mode = foundItem.mode || auto.mode;
        newConfig[foundItem.id] = {
          included: true,
          mode: mode,
          qty: mode === "flat" ? 1 : 0,
          capacity: foundItem.capacity ?? auto.capacity,
          threshold: foundItem.threshold ?? auto.threshold,
          surcharge: foundItem.surcharge ?? auto.surcharge,
          override: "",
        };
      }
    });

    setDays((prev) =>
      prev.map((d, i) => (i === activeDayIndex ? { ...d, itemConfig: newConfig, presetName: preset.label } : d))
    );
    logUserActivity(`Applied Preset Shortcut "${preset.label}" to Day ${activeDayIndex + 1}`, currentQuote?.id);
  };

  const handleSavePreset = (presetToSave) => {
    if (!presetToSave.label.trim()) return;
    setPresets((prev) =>
      prev.map((p) => (p.id === presetToSave.id ? presetToSave : p))
    );
    logUserActivity(`Updated Package Shortcut "${presetToSave.label}"`);
    setEditingPreset(null);
  };

  const handleDeletePreset = (presetId) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    logUserActivity(`Deleted Package Shortcut ${presetId}`);
  };

  const handleCreateNewPreset = () => {
    if (!newPresetForm.label.trim()) return;
    const created = {
      id: `preset-${Date.now()}`,
      label: newPresetForm.label.trim(),
      picks: newPresetForm.picks || [],
    };
    setPresets((prev) => [...prev, created]);
    logUserActivity(`Created new Package Shortcut "${created.label}"`);
    setNewPresetForm({ label: "", picks: [] });
  };

  const handleResetFactoryPresets = () => {
    setPresets(DEFAULT_PRESETS);
    logUserActivity("Reset Package Shortcuts to factory defaults");
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

      (day.custom || []).forEach((c) => {
        const cost = c.mode === "pax" ? c.price * weightedPax : (c.qty || 1) * c.price;
        dayCost += cost;
        totalLineCount++;
        selectedItems.push({
          item: { id: c.id, name: c.name, price: c.price },
          cat: { id: "custom", title: "Custom Extra" },
          cfg: { mode: c.mode, qty: c.qty || 1 },
          cost,
          caption: `${idr(c.price)} (${c.mode === "pax" ? "pax" : "flat"})`,
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

  const handleSaveCatalogItem = (updatedItem) => {
    setCatalog((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      }))
    );
    logUserActivity(`Updated vendor item "${updatedItem.name}" price to ${idr(updatedItem.price)}`);
    setEditingCatalogItem(null);
  };

  const handleAddNewItemToCategory = (catId) => {
    const form = newItemForms[catId];
    if (!form || !form.name.trim()) return;

    const newItem = {
      id: `${catId}-${Date.now()}`,
      name: form.name.trim(),
      price: Number(form.price) || 0,
      mode: form.mode || "pax",
      capacity: Number(form.capacity) || 4,
      threshold: Number(form.threshold) || 2,
      surcharge: Number(form.surcharge) || 50000,
    };

    setCatalog((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    );

    setNewItemForms({ ...newItemForms, [catId]: { name: "", price: "", mode: "pax", capacity: 4, threshold: 2, surcharge: 50000 } });
    logUserActivity(`Added new vendor item "${newItem.name}" to category ${catId}`);
  };

  const handleDeleteCatalogItem = (catId, itemId) => {
    setCatalog((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) } : cat
      )
    );
    logUserActivity(`Deleted vendor item ${itemId} from catalog`);
  };

  const handleAddNewCategory = () => {
    if (!newCatTitle.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      title: newCatTitle.trim(),
      items: [],
    };
    setCatalog((prev) => [...prev, newCat]);
    setNewCatTitle("");
    logUserActivity(`Created new vendor category "${newCat.title}"`);
  };

  const handleResetFactoryCatalog = () => {
    setCatalog(DEFAULT_CATALOG);
    logUserActivity("Reset vendor catalog to factory default settings");
  };

  const formattedQuotationText = useMemo(() => {
    let summary = `📍 *TOUR QUOTATION - ${currentQuote.title.toUpperCase()} (${days.length} Day${days.length > 1 ? "s" : ""})*\n`;
    if (currentQuote.id) summary += `🆔 Quote ID: ${currentQuote.id}\n`;
    if (currentQuote.pic) summary += `👤 PIC: ${currentQuote.pic}\n`;
    if (currentQuote.agent) summary += `🏢 Agent / Channel: ${currentQuote.agent}\n`;
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

  const generateAiProposalPrompt = async () => {
    setIsGeneratingAi(true);
    setGeneratedAiProposal("✨ Connecting to Gemini AI to generate custom proposal...");

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const personaObj = AI_PERSONAS.find((p) => p.id === aiPersona);

      const promptText = `
System Master Rules: ${masterAiPrompt}
Sales Persona Tone: ${personaObj?.title} - ${personaObj?.description}
Output Language: ${aiLanguage}

Quote ID: ${currentQuote.id}
Activity Date: ${currentQuote.activityDate || "Flexible"}
Guests: ${adults} Adult(s)${kids > 0 ? `, ${kids} Child(ren)` : ""}

Itinerary Plan:
${totals.dayBreakdowns
  .map(
    ({ day, selectedItems }) =>
      `• ${day.title}:\n  ${
        selectedItems.length > 0
          ? selectedItems.map((i) => i.item.name).join(", ")
          : "Flexible exploration"
      }`
  )
  .join("\n")}

Package Total Price: ${idr(totals.price)}
Price Per Adult: ${idr(totals.adultPricePax)}
${kids > 0 ? `Price Per Child: ${idr(totals.childPricePax)}\n` : ""}

Write an enticing, structured, high-converting WhatsApp proposal using appropriate emojis and clear markdown.
`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: {
          parts: [{ text: "You are an expert, warm, and high-converting Bali & Nusa Penida tour coordinator." }]
        }
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setGeneratedAiProposal(text);
        logUserActivity(`Generated Live Gemini AI Proposal (${aiPersona})`, currentQuote?.id);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      const selectedPersonaObj = AI_PERSONAS.find((p) => p.id === aiPersona);
      let prop = `🌟 *EXPLORE BALI & NUSA PENIDA - CUSTOM TOUR PROPOSAL* 🌟\n\n`;
      prop += `Dear Valued Guest,\nWe are thrilled to present your customized ${days.length}-day island itinerary!\n\n`;
      prop += `🆔 *Proposal Reference*: ${currentQuote.id}\n`;
      prop += `🗓 *Activity Date*: ${currentQuote.activityDate || "Flexible Date"}\n`;
      prop += `👥 *Group Size*: ${adults} Adult(s)${kids > 0 ? ` & ${kids} Child(ren)` : ""}\n\n`;

      totals.dayBreakdowns.forEach(({ day, selectedItems }) => {
        prop += `📍 *${day.title.toUpperCase()}*\n`;
        if (selectedItems.length === 0) {
          prop += ` • Flexible exploration and leisure time.\n`;
        } else {
          selectedItems.forEach(({ item }) => {
            prop += ` • ${item.name}\n`;
          });
        }
        prop += `\n`;
      });

      prop += `💰 *PACKAGE PRICE SUMMARY*\n`;
      prop += `• Total Package Investment: *${idr(totals.price)}*\n`;
      prop += `• Rate Per Adult Guest: *${idr(totals.adultPricePax)}*\n`;
      if (kids > 0) {
        prop += `• Rate Per Child Guest: *${idr(totals.childPricePax)}*\n`;
      }

      prop += `\n✨ *INCLUSIONS*: Private AC transport, fast boat tickets, driver/guide, entrance fees & snack box.\n`;
      prop += `📲 Contact ${currentQuote.pic || "our team"} to confirm your booking date!\n`;
      prop += `\n*Style Tone applied*: ${selectedPersonaObj?.title || "Warm Advisor"} (${aiLanguage})`;

      setGeneratedAiProposal(prop);
      logUserActivity(`Generated AI Proposal (${aiPersona}, ${aiLanguage})`, currentQuote?.id);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const generateAiItineraryWithGemini = async () => {
    if (!aiItineraryPrompt.trim()) return;
    setIsGeneratingItinerary(true);
    setGeneratedAiItinerary("✨ Gemini AI is designing your custom tour itinerary...");

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const availableItems = catalog
        .flatMap((c) => c.items.map((i) => `${i.name} (${c.title})`))
        .join(", ");

      const promptText = `
Design a complete, detailed day-by-day Bali / Nusa Penida tour itinerary based on this request: "${aiItineraryPrompt.trim()}".
Number of Guests: ${adults} Adult(s), ${kids} Child(ren).

Available Vendor Services in Database:
${availableItems}

Please format the output clearly with:
1. Itinerary Overview & Highlights
2. Day-by-Day Detailed Schedule with timing & insider photo tips
3. Recommended Vendor Items from database to include
4. Practical Travel & Packing Advice

Use markdown formatting and engaging travel emojis.
`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: {
          parts: [
            {
              text: "You are a master Bali & Nusa Penida tour architect. Create vivid, realistic, high-value tour itineraries optimized for guest satisfaction and smooth logistics.",
            },
          ],
        },
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setGeneratedAiItinerary(text);
        logUserActivity(`Generated AI Itinerary for prompt: "${aiItineraryPrompt.slice(0, 30)}..."`, currentQuote?.id);
      } else {
        throw new Error("No response text");
      }
    } catch (err) {
      setGeneratedAiItinerary(
        `📍 *CUSTOM ITINERARY SUGGESTION*\n\n` +
          `• **Day 1**: Pickup & Fastboat Transfer to Nusa Penida, West Coast Highlights (Kelingking Cliff, Broken Beach, Angel's Billabong), Sunset Dinner.\n` +
          `• **Day 2**: East Coast Exploration (Diamond Beach, Atuh Beach, Tree House Molenteng), Return Fastboat Transfer to Bali.\n\n` +
          `*Note: Generated using offline backup rule. Reconnect network for live AI responses.*`
      );
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const saveQuoteToDatabase = (statusToSave = "Draft") => {
    const record = {
      ...currentQuote,
      status: statusToSave,
      savedBy: currentUser?.username || "agent",
      creatorRole: currentUser?.role || "Staff Agent",
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

    logUserActivity(`Saved Quote ID ${record.id} (${statusToSave}) with total price ${idr(totals.price)}`, record.id);
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
    logUserActivity(`Updated Quote status for ${quoteId} to "${newStatus}"`, quoteId);
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

    return { totalRev, totalProfit, totalSaved, totalConfirmed };
  }, [filteredHistory]);

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
          background: THEME.bg,
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
            background: THEME.cardBg,
            borderRadius: 20,
            width: "100%",
            maxWidth: 420,
            padding: 24,
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            border: `1px solid ${THEME.border}`,
            position: "relative",
          }}
        >
          <button
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            title="Toggle Light / Dark Mode"
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: COLORS.oceanLight,
              color: "#F4EEDD",
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isDark ? <Sun size={14} color="#FFD166" /> : <Moon size={14} color="#F4EEDD" />}
            {isDark ? "Light" : "Dark"}
          </button>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "inline-flex", padding: 12, borderRadius: 16, background: COLORS.ocean, marginBottom: 10 }}>
              <Waves size={32} color={COLORS.coral} />
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 24, color: THEME.textMain }}>
              Tour HQ Portal
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: THEME.textMuted }}>
              Sign in with your assigned team account
            </p>
          </div>

          {authNotice.text ? (
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
                color: authNotice.type === "error" ? "#C62828" : "#1B5E20",
                border: `1px solid ${authNotice.type === "error" ? "#EF9A9A" : "#A5D6A7"}`,
              }}
            >
              {authNotice.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{authNotice.text}</span>
            </div>
          ) : null}

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>
                Username or Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. god, admin, agent1, freelance1"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${THEME.border}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                  color: "#132422",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>
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
                  border: `1px solid ${THEME.border}`,
                  fontSize: 13,
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                  color: "#132422",
                }}
              />
            </div>

            <div style={{ borderTop: `1px dashed ${THEME.border}`, paddingTop: 10, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: COLORS.coral, marginBottom: 4 }}>
                <Key size={13} /> GOD Master Bypass Passkey
              </label>
              <input
                type="password"
                placeholder="Enter GOD Bypass Key (GOD2026)"
                value={authForm.godMasterKey}
                onChange={(e) => setAuthForm({ ...authForm, godMasterKey: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.coralSoft}`,
                  fontSize: 12,
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                  color: "#132422",
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
                color: "#F4EEDD",
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
        background: THEME.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        color: THEME.textMain,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 16px 120px" }}>
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Waves size={26} color={COLORS.coral} strokeWidth={2.5} />
            <div>
              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: THEME.textMain,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Tour Costing & Booking HQ
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span style={{ color: THEME.textMuted, fontSize: 12, fontWeight: 600 }}>
                  Multi-User Workspaces & Activity Audit
                </span>
                <span
                  title="Cloud Sync Active"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: "#E8F5E9",
                    color: "#1B5E20",
                  }}
                >
                  <Wifi size={11} /> Cloud Live
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              title="Toggle Dark / Light Theme"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: COLORS.oceanLight,
                color: "#F4EEDD",
                border: `1px solid ${COLORS.coralSoft}`,
                borderRadius: 10,
                padding: "7px 11px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isDark ? <Sun size={15} color="#FFD166" /> : <Moon size={15} color="#F4EEDD" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            {isRealGodUser && (
              <div
                style={{
                  background: impersonatedUserId ? COLORS.coral : COLORS.oceanLight,
                  padding: "5px 10px",
                  borderRadius: 10,
                  color: "#F4EEDD",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${impersonatedUserId ? "#F4EEDD" : COLORS.coralSoft}`,
                }}
              >
                <Eye size={14} color="#F4EEDD" />
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
                    background: "#FFFFFF",
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
              </div>
            )}

            <div style={{ background: COLORS.oceanLight, padding: "6px 12px", borderRadius: 10, color: "#F4EEDD", fontSize: 12 }}>
              <span style={{ color: "#A3C2BD" }}>Viewing as: </span>
              <strong>{effectiveUser.name}</strong> ({effectiveUser.role})
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: COLORS.coral,
                color: "#F4EEDD",
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
              background: currentPage === "simulator" ? "#F4EEDD" : "transparent",
              color: currentPage === "simulator" ? COLORS.ink : "#F4EEDD",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Calculator size={16} color={currentPage === "simulator" ? COLORS.coral : "#F4EEDD"} />
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
                background: currentPage === "dashboard" ? "#F4EEDD" : "transparent",
                color: currentPage === "dashboard" ? COLORS.ink : "#F4EEDD",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <LayoutDashboard size={16} color={currentPage === "dashboard" ? COLORS.coral : "#F4EEDD"} />
              Dashboard ({filteredHistory.length})
            </button>
          )}

          {canEditCat && (
            <button
              onClick={() => setCurrentPage("catalog")}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: currentPage === "catalog" ? "#F4EEDD" : "transparent",
                color: currentPage === "catalog" ? COLORS.ink : "#F4EEDD",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Database size={16} color={currentPage === "catalog" ? COLORS.coral : "#F4EEDD"} />
              Vendor Catalog & Presets
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
                color: "#F4EEDD",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ShieldAlert size={16} color="#F4EEDD" />
              God Governance ({usersList.length})
            </button>
          )}
        </div>

        {currentPage === "simulator" && (
          <div>
            {/* Multi-Tab Workspace Switcher Bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, whiteSpace: "nowrap" }}>
                Workspaces:
              </span>
              {quotes.map((q, qIdx) => (
                <div
                  key={q.id}
                  onClick={() => setActiveQuoteIndex(qIdx)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: qIdx === activeQuoteIndex ? COLORS.ocean : THEME.cardBg,
                    color: qIdx === activeQuoteIndex ? "#F4EEDD" : THEME.textMain,
                    border: `1px solid ${qIdx === activeQuoteIndex ? COLORS.coral : THEME.border}`,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Tag size={12} color={qIdx === activeQuoteIndex ? COLORS.coralSoft : THEME.textMuted} />
                  <span>{q.id}</span>
                  {quotes.length > 1 && (
                    <X
                      size={12}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseWorkspaceTab(qIdx);
                      }}
                      style={{ opacity: 0.7 }}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={handleAddNewWorkspaceTab}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: COLORS.profit,
                  color: "#FFF",
                  border: "none",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={13} /> New Workspace
              </button>
            </div>

            {/* Workspace Header Bar */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 16, padding: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F4EEDD", fontWeight: 700, fontSize: 13.5 }}>
                  <Layers size={16} color={COLORS.coralSoft} />
                  Active Quote ID: <span style={{ color: "#FFD166", fontFamily: "monospace" }}>{currentQuote.id}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setShowAiItineraryModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.coral,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Sparkles size={13} /> AI Itinerary Creator
                  </button>
                  <button
                    onClick={() => setShowAiDrawer(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.ocean,
                      color: "#FFD166",
                      border: `1px solid ${COLORS.coralSoft}`,
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Bot size={13} /> AI Proposal
                  </button>
                  <button
                    onClick={() => setShowWhatsappModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: COLORS.ocean,
                      color: "#F4EEDD",
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp Text
                  </button>
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
                </div>
              </div>

              {/* Load Quote by ID Dropdown Bar */}
              <div style={{ marginTop: 10, borderTop: `1px dashed ${COLORS.ocean}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Folder size={14} color={COLORS.coralSoft} />
                <span style={{ fontSize: 12, color: "#F4EEDD", fontWeight: 600 }}>Load Saved Quote from Cloud:</span>
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
              </div>

              {loadNotice.text ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: loadNotice.type === "error" ? "#FFEBEE" : "#E8F5E9",
                    color: loadNotice.type === "error" ? "#C62828" : "#1B5E20",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {loadNotice.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{loadNotice.text}</span>
                </div>
              ) : null}
            </div>

            {/* Metadata Card */}
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 16,
                padding: "14px 16px",
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMuted, marginBottom: 3 }}>
                    Person in Charge (PIC)
                  </label>
                  <input
                    type="text"
                    value={currentQuote.pic || ""}
                    onChange={(e) => updateCurrentQuote({ pic: e.target.value })}
                    placeholder="e.g. Wayman Lead"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: "#FFFFFF",
                      color: "#132422",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMuted, marginBottom: 3 }}>
                    Agent / Channel
                  </label>
                  <input
                    type="text"
                    value={currentQuote.agent || ""}
                    onChange={(e) => updateCurrentQuote({ agent: e.target.value })}
                    placeholder="e.g. Freelance Partner / B2B"
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: "#FFFFFF",
                      color: "#132422",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMuted, marginBottom: 3 }}>
                    Tour Activity Date
                  </label>
                  <input
                    type="date"
                    value={currentQuote.activityDate || ""}
                    onChange={(e) => updateCurrentQuote({ activityDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: "#FFFFFF",
                      color: "#132422",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMuted, marginBottom: 3 }}>
                    Quote Booking Status
                  </label>
                  <select
                    value={currentQuote.status || "Draft"}
                    onChange={(e) => updateCurrentQuote({ status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: "#FFFFFF",
                      color: currentQuote.status === "Confirmed" ? "#1B5E20" : "#132422",
                      boxSizing: "border-box",
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

            {/* Days Tabs Builder */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 14, padding: "10px 12px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#F4EEDD", display: "flex", alignItems: "center", gap: 6 }}>
                  <CalendarDays size={16} color={COLORS.coralSoft} />
                  <span>Itinerary Days Builder ({days.length} Day{days.length > 1 ? "s" : ""}):</span>
                </div>
                <button
                  onClick={handleAddDay}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: COLORS.coral,
                    color: "#FFF",
                    border: "none",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={13} /> Add Day
                </button>
              </div>

              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {days.map((d, idx) => (
                  <div
                    key={d.id}
                    onClick={() => setActiveDayIndex(idx)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: idx === activeDayIndex ? "#F4EEDD" : COLORS.ocean,
                      color: idx === activeDayIndex ? COLORS.ink : "#F4EEDD",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{d.title}</span>
                    {days.length > 1 && (
                      <X
                        size={12}
                        color={idx === activeDayIndex ? COLORS.coral : "#F4EEDD"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDay(idx);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={activeDay.title}
                  onChange={(e) => handleUpdateDayTitle(e.target.value)}
                  placeholder="Rename Active Day Title (e.g. Day 1 - West Nusa Penida)"
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: `1px solid ${COLORS.line}`,
                    fontSize: 12,
                    background: "#FFF",
                    color: COLORS.ink,
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            {/* Package Shortcuts Bar */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 14, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#F4EEDD", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} color="#FFD166" />
                <span>Quick Package Shortcuts (1-Click Fill {activeDay.title}):</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetShortcut(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: COLORS.coral,
                      color: "#FFF",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Pax & Pricing Summary Card */}
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 18,
                padding: "18px",
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                marginBottom: 18,
              }}
            >
              {/* Pax Stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.textMain, fontWeight: 700, fontSize: 13 }}>
                  <Users size={16} color={COLORS.coral} />
                  <span>Guests:</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 700 }}>Adults</span>
                  <button onClick={() => setAdults((a) => Math.max(1, a - 1))} style={stepBtn(COLORS.deep, "#F4EEDD")}>
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: THEME.textMain }}>{adults}</span>
                  <button onClick={() => setAdults((a) => a + 1)} style={stepBtn(COLORS.coral, "#F4EEDD")}>
                    <Plus size={12} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 700 }}>Kids</span>
                  <button onClick={() => setKids((k) => Math.max(0, k - 1))} style={stepBtn(COLORS.deep, "#F4EEDD")}>
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: THEME.textMain }}>{kids}</span>
                  <button onClick={() => setKids((k) => k + 1)} style={stepBtn(COLORS.coral, "#F4EEDD")}>
                    <Plus size={12} />
                  </button>
                </div>

                {kids > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 700 }}>Child Rate:</span>
                    <select
                      value={kidsRate}
                      onChange={(e) => setKidsRate(Number(e.target.value))}
                      style={{ padding: "2px 6px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 11.5, fontWeight: 700, background: "#FFF", color: COLORS.ink }}
                    >
                      <option value={50}>50%</option>
                      <option value={65}>65%</option>
                      <option value={75}>75%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Sell Price Display Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
                    Total Sell Price ({days.length} Day{days.length > 1 ? "s" : ""})
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 32, color: THEME.textMain, lineHeight: 1.1 }}>
                    {idr(totals.price)}
                  </div>
                </div>
              </div>

              {/* Per Pax Breakdown Cards */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: THEME.cardDeepBg, padding: "10px 12px", borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700 }}>Adult Price / pax</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: THEME.textMain }}>{idr(totals.adultPricePax)}</div>
                </div>
                {kids > 0 && (
                  <div style={{ flex: 1, background: THEME.cardDeepBg, padding: "10px 12px", borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                    <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700 }}>Child Price / pax ({kidsRate}%)</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.coral }}>{idr(totals.childPricePax)}</div>
                  </div>
                )}
              </div>

              {/* Cost & Profit Margin Bar */}
              {canSeeCosts ? (
                <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 12, paddingBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginTop: 8 }}>
                    <span>Vendor Cost: {idr(totals.cost)}</span>
                    <span style={{ color: COLORS.profit }}>Est. Profit: {idr(totals.profit)}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Custom Extra Item Builder */}
            <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 12, marginBottom: 14, border: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} color={COLORS.coral} />
                <span>Add Ad-Hoc Extra Expense to {activeDay.title}:</span>
              </div>
              <form onSubmit={handleAddCustomItem} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Custom Item (e.g. Special Tip, Private Speedboat)"
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  style={{ flex: 2, minWidth: 140, padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                />
                <input
                  type="number"
                  placeholder="Cost (IDR)"
                  value={customItemForm.price}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })}
                  style={{ flex: 1, minWidth: 90, padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                />
                <select
                  value={customItemForm.mode}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, mode: e.target.value })}
                  style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                >
                  <option value="flat">Flat Price</option>
                  <option value="pax">Per Pax</option>
                </select>
                <button type="submit" style={{ padding: "6px 12px", borderRadius: 6, background: COLORS.profit, color: "#FFF", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  + Extra
                </button>
              </form>

              {/* Render custom extra items */}
              {(activeDay.custom || []).length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {activeDay.custom.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: THEME.cardDeepBg, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                      <span>✨ {c.name} ({idr(c.price)})</span>
                      <button onClick={() => handleRemoveCustomItem(c.id)} style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Itemized Vendor Pricing & Package Recap Breakdown */}
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 16,
                padding: 16,
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  borderBottom: `1px solid ${THEME.border}`,
                  paddingBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileSpreadsheet size={18} color={COLORS.coral} />
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'Fraunces', serif",
                      fontSize: 16,
                      color: THEME.textMain,
                    }}
                  >
                    Itemized Vendor Costing & Package Recap
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: COLORS.oceanLight,
                    color: "#F4EEDD",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  {totals.lineCount} Selected Item{totals.lineCount !== 1 ? "s" : ""}
                </span>
              </div>

              {totals.lineCount === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 10px",
                    color: THEME.textMuted,
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  No items added to this itinerary yet. Select from Quick Package Shortcuts above or browse the catalog below.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {totals.dayBreakdowns.map(({ day, dayCost, selectedItems }, dIdx) => (
                    <div
                      key={day.id || dIdx}
                      style={{
                        background: THEME.cardDeepBg,
                        borderRadius: 12,
                        padding: 12,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          color: THEME.textMain,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={14} color={COLORS.coral} />
                          <span>{day.title}</span>
                        </div>
                        {canSeeCosts && (
                          <span style={{ fontSize: 12, color: COLORS.profit, fontWeight: 700 }}>
                            Day Net Cost: {idr(dayCost)}
                          </span>
                        )}
                      </div>

                      {selectedItems.length === 0 ? (
                        <div style={{ fontSize: 11.5, color: THEME.textMuted, fontStyle: "italic", paddingLeft: 12 }}>
                          No items selected for this day.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {selectedItems.map(({ item, cat, cfg, cost, caption }, iIdx) => (
                            <div
                              key={`${item.id}-${iIdx}`}
                              style={{
                                background: THEME.cardBg,
                                borderRadius: 8,
                                padding: "7px 10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: 12,
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span>{item.name}</span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      padding: "1px 5px",
                                      borderRadius: 4,
                                      background: COLORS.oceanLight,
                                      color: "#F4EEDD",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {cat.title}
                                  </span>
                                  {cfg.override ? (
                                    <span style={{ fontSize: 10, color: COLORS.coral, fontWeight: 700, background: "#FFEBEE", padding: "1px 4px", borderRadius: 4 }}>
                                      Overridden
                                    </span>
                                  ) : null}
                                </div>
                                {canSeeCosts && (
                                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                                    {caption}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {canSeeCosts ? (
                                  <div style={{ textAlign: "right", fontWeight: 700, color: THEME.textMain, fontSize: 12.5 }}>
                                    {idr(cost)}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: 11, color: COLORS.profit, fontWeight: 700 }}>
                                    Included ✓
                                  </div>
                                )}
                                <button
                                  onClick={() => handleRemoveItemFromDay(day.id, item.id, cat.id, item.name, cfg.mode)}
                                  title={`Remove ${item.name}`}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: COLORS.coral,
                                    cursor: "pointer",
                                    padding: "2px 4px",
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Recap Summary Totals Box */}
                  {canSeeCosts && (
                    <div
                      style={{
                        background: COLORS.ocean,
                        borderRadius: 12,
                        padding: 12,
                        color: "#F4EEDD",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: 10,
                        marginTop: 4,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10.5, color: "#A3C2BD", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Net Cost
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{idr(totals.cost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: "#A3C2BD", fontWeight: 700, textTransform: "uppercase" }}>
                          Margin ({margin}%)
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.coralSoft }}>
                          + {idr(totals.profit)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: "#A3C2BD", fontWeight: 700, textTransform: "uppercase" }}>
                          Final Sell Price
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#FFD166" }}>
                          {idr(totals.price)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={15} color="#A3C2BD" style={{ position: "absolute", left: 12, top: 11 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search vendor items to add to ${activeDay.title}…`}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 34px",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.oceanLight}`,
                  background: COLORS.ocean,
                  color: "#F4EEDD",
                  fontSize: 13.5,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Vendor Items Accordion Catalog */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCatalog.map((cat) => {
                const isOpen = open[cat.id] || query.trim().length > 0;

                return (
                  <div key={cat.id} style={{ background: COLORS.oceanLight, borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.line}` }}>
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
                        <div style={{ color: "#F4EEDD", fontWeight: 700, fontSize: 14 }}>{cat.title}</div>
                      </div>
                      <ChevronDown
                        size={17}
                        color="#F4EEDD"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{ background: THEME.cardBg }}>
                        {cat.items.map((item) => {
                          const cfg = getConfig(item.id, cat.id, item.name);
                          const selected = isSelected(cfg);

                          return (
                            <div key={item.id} style={{ borderTop: `1px solid ${THEME.border}`, padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 600 }}>{item.name}</div>
                                {canSeeCosts && <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>{ruleCaption(item, cfg, totalPax)}</div>}
                                
                                {effectiveUser?.canOverrideCosts && selected && (
                                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ fontSize: 10.5, color: COLORS.coral, fontWeight: 700 }}>Custom Cost Override:</span>
                                    <input
                                      type="number"
                                      placeholder={item.price}
                                      value={cfg.override || ""}
                                      onChange={(e) => updateActiveDayConfig(item.id, cat.id, item.name, { override: e.target.value })}
                                      style={{ width: 80, padding: "2px 4px", fontSize: 11, borderRadius: 4, border: `1px solid ${THEME.border}`, background: "#FFF", color: COLORS.ink }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {cfg.mode === "flat" ? (
                                  <>
                                    <button onClick={() => setItemQty(item.id, cat.id, item.name, (cfg.qty || 0) - 1)} style={stepBtn(COLORS.deep, "#F4EEDD")}>
                                      <Minus size={12} />
                                    </button>
                                    <span style={{ minWidth: 16, textAlign: "center", fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{cfg.qty || 0}</span>
                                    <button onClick={() => setItemQty(item.id, cat.id, item.name, (cfg.qty || 0) + 1)} style={stepBtn(COLORS.coral, "#F4EEDD")}>
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
          </div>
        )}

        {currentPage === "dashboard" && canAccessDashboard && (
          <div>
            {/* Real-time Activity Audit Card */}
            {isGodUser && (
              <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${THEME.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: THEME.textMain, fontWeight: 700, fontSize: 15 }}>
                    <Activity size={18} color={COLORS.coral} />
                    <span>Real-Time Team Activity Audit Stream</span>
                  </div>
                  <span style={{ fontSize: 11, background: COLORS.profit, color: "#FFF", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                    Live Monitor
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                  {activityLogs.length === 0 ? (
                    <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>No active user simulator logs recorded yet.</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: THEME.cardDeepBg,
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        <div>
                          <strong style={{ color: THEME.textMain }}>{log.userName}</strong> ({log.role}):{" "}
                          <span style={{ color: THEME.textMain }}>{log.action}</span>
                          {log.quoteId && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: THEME.cardBg, padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>
                              [{log.quoteId}]
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Dashboard Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 16, border: `1px solid ${THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.textMuted, fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={16} color={COLORS.profit} />
                  Confirmed Revenue
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: THEME.textMain, marginTop: 4 }}>
                  {idr(dashboardStats.totalRev)}
                </div>
              </div>

              {canSeeCosts && (
                <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 16, border: `1px solid ${THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.textMuted, fontSize: 12, fontWeight: 700 }}>
                    <DollarSign size={16} color={COLORS.coral} />
                    Estimated Profit
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: COLORS.profit, marginTop: 4 }}>
                    {idr(dashboardStats.totalProfit)}
                  </div>
                </div>
              )}

              <div style={{ background: THEME.cardBg, borderRadius: 14, padding: 16, border: `1px solid ${THEME.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.textMuted, fontSize: 12, fontWeight: 700 }}>
                  <CheckCircle2 size={16} color={COLORS.confirmedText} />
                  Confirmed Tours
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: THEME.textMain, marginTop: 4 }}>
                  {dashboardStats.totalConfirmed} / {dashboardStats.totalSaved}
                </div>
              </div>
            </div>

            {/* Saved Quotes Table */}
            <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 16, border: `1px solid ${THEME.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: THEME.textMain }}>
                  Saved Quote & Booking History
                </h3>
              </div>

              {filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: THEME.textMuted, fontSize: 13, fontWeight: 600 }}>
                  No saved quotes found in the database.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: THEME.cardDeepBg,
                        borderRadius: 12,
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                          <Tag size={13} color={COLORS.coral} />
                          <span>{item.title}</span>
                          <span style={{ fontSize: 11, color: THEME.textMuted, background: THEME.cardBg, padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                            ID: {item.id}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 4, fontWeight: 600 }}>
                          🗓 Date: <strong>{item.activityDate || "TBA"}</strong> · PIC: <strong>{item.pic || "N/A"}</strong> · Agent: <strong>{item.agent || "N/A"}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: THEME.textMain }}>
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
                              border: `1px solid ${THEME.border}`,
                              background: item.status === "Confirmed" ? "#E8F5E9" : "#FFF",
                              color: item.status === "Confirmed" ? "#1B5E20" : "#132422",
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

        {currentPage === "catalog" && canEditCat && (
          <div style={{ background: THEME.cardBg, borderRadius: 18, padding: 18, border: `1px solid ${THEME.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: THEME.textMain }}>
                  Vendor Catalog & Preset Manager
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
                  Manage vendor prices, unit capacities, pricing rules, and 1-click package shortcuts.
                </p>
              </div>
              {isGodUser && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={handleResetFactoryPresets}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: COLORS.coral,
                      color: "#FFF",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={13} /> Reset Presets
                  </button>
                  <button
                    onClick={handleResetFactoryCatalog}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: COLORS.oceanLight,
                      color: "#F4EEDD",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={13} /> Reset Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Quick Package Shortcuts Manager Section */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${COLORS.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F4EEDD", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={16} color="#FFD166" />
                  Quick Package Shortcuts Manager ({presets.length} Active Presets)
                </h3>
              </div>

              {/* List of Presets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {presets.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: THEME.cardBg,
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                        <Tag size={13} color={COLORS.coral} />
                        {p.label}
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, fontWeight: 600 }}>
                        Contains {p.picks ? p.picks.length : 0} item picks: {p.picks ? p.picks.map(([_, name]) => name).join(", ") : "None"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditingPreset(p)}
                        style={{ padding: "4px 8px", borderRadius: 6, background: COLORS.oceanLight, color: "#F4EEDD", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Pencil size={12} /> Edit Picks
                      </button>
                      <button
                        onClick={() => handleDeletePreset(p.id)}
                        style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Package Preset Shortcut Form */}
              <div style={{ background: THEME.cardDeepBg, borderRadius: 10, padding: 10, border: `1px solid ${THEME.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="New Package Shortcut Name (e.g. Snorkeling VIP Package)"
                  value={newPresetForm.label}
                  onChange={(e) => setNewPresetForm({ ...newPresetForm, label: e.target.value })}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFFFFF", color: "#132422" }}
                />
                <button
                  onClick={handleCreateNewPreset}
                  style={{ padding: "7px 12px", borderRadius: 8, background: COLORS.profit, color: "#FFF", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Plus size={14} /> Create Package Shortcut
                </button>
              </div>
            </div>

            {/* Add New Vendor Category Form */}
            <div style={{ background: THEME.cardDeepBg, borderRadius: 12, padding: 12, marginBottom: 16, border: `1px solid ${THEME.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="New Vendor Category Name (e.g. VIP Charters, Water Sports)"
                value={newCatTitle}
                onChange={(e) => setNewCatTitle(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFFFFF", color: "#132422" }}
              />
              <button
                onClick={handleAddNewCategory}
                style={{ padding: "8px 14px", borderRadius: 8, background: COLORS.coral, color: "#FFF", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            {/* Vendor Categories & Items List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {catalog.map((cat) => (
                <div key={cat.id} style={{ background: THEME.cardDeepBg, borderRadius: 14, padding: 14, border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={16} color={COLORS.coral} />
                      {cat.title} ({cat.items.length} Items)
                    </h3>
                  </div>

                  {/* Category Items Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: THEME.cardBg,
                          borderRadius: 8,
                          padding: "8px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>
                            Base Price: <strong>{idr(item.price)}</strong> · Rule: <strong>{item.mode || "Auto"}</strong>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setEditingCatalogItem({ ...item, catId: cat.id })}
                            style={{ padding: "4px 8px", borderRadius: 6, background: COLORS.oceanLight, color: "#F4EEDD", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCatalogItem(cat.id, item.id)}
                            style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Item Row in Category */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px dashed ${THEME.border}`, paddingTop: 8 }}>
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={newItemForms[cat.id]?.name || ""}
                      onChange={(e) =>
                        setNewItemForms({
                          ...newItemForms,
                          [cat.id]: { ...newItemForms[cat.id], name: e.target.value },
                        })
                      }
                      style={{ flex: 2, minWidth: 120, padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                    />
                    <input
                      type="number"
                      placeholder="Price (IDR)"
                      value={newItemForms[cat.id]?.price || ""}
                      onChange={(e) =>
                        setNewItemForms({
                          ...newItemForms,
                          [cat.id]: { ...newItemForms[cat.id], price: e.target.value },
                        })
                      }
                      style={{ flex: 1, minWidth: 90, padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                    />
                    <select
                      value={newItemForms[cat.id]?.mode || "pax"}
                      onChange={(e) =>
                        setNewItemForms({
                          ...newItemForms,
                          [cat.id]: { ...newItemForms[cat.id], mode: e.target.value },
                        })
                      }
                      style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                    >
                      <option value="pax">Per Pax</option>
                      <option value="unit">Per Unit</option>
                      <option value="flat">Flat / Qty</option>
                      <option value="tier">Tiered</option>
                    </select>
                    <button
                      onClick={() => handleAddNewItemToCategory(cat.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, background: COLORS.profit, color: "#FFF", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      + Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Preset Shortcut Modal */}
            {editingPreset && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: 16,
                }}
              >
                <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 20, maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto", border: `1px solid ${THEME.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.3)" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, color: THEME.textMain }}>
                    Edit Package Shortcut: {editingPreset.label}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Shortcut Label</label>
                      <input
                        type="text"
                        value={editingPreset.label}
                        onChange={(e) => setEditingPreset({ ...editingPreset, label: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                        Select Vendor Items to Include in Preset:
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                        {catalog.map((cat) => (
                          <div key={cat.id} style={{ background: THEME.cardDeepBg, padding: 8, borderRadius: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.coral, marginBottom: 4 }}>{cat.title}</div>
                            {cat.items.map((i) => {
                              const isChecked = editingPreset.picks.some(([cId, name]) => cId === cat.id && name === i.name);
                              return (
                                <label key={i.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: THEME.textMain, marginBottom: 4, cursor: "pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditingPreset({
                                          ...editingPreset,
                                          picks: [...editingPreset.picks, [cat.id, i.name]],
                                        });
                                      } else {
                                        setEditingPreset({
                                          ...editingPreset,
                                          picks: editingPreset.picks.filter(([cId, name]) => !(cId === cat.id && name === i.name)),
                                        });
                                      }
                                    }}
                                  />
                                  {i.name} ({idr(i.price)})
                                </label>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => handleSavePreset(editingPreset)}
                        style={{ flex: 1, padding: "10px", borderRadius: 8, background: COLORS.profit, color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}
                      >
                        Save Package Shortcut
                      </button>
                      <button
                        onClick={() => setEditingPreset(null)}
                        style={{ padding: "10px 14px", borderRadius: 8, background: THEME.cardDeepBg, color: THEME.textMain, border: `1px solid ${THEME.border}`, fontWeight: 700, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Item Edit Overlay Modal */}
            {editingCatalogItem && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: 16,
                }}
              >
                <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 20, maxWidth: 420, width: "100%", border: `1px solid ${THEME.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.3)" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, color: THEME.textMain }}>
                    Edit Vendor Item: {editingCatalogItem.name}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Item Name</label>
                      <input
                        type="text"
                        value={editingCatalogItem.name}
                        onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Vendor Base Price (IDR)</label>
                      <input
                        type="number"
                        value={editingCatalogItem.price}
                        onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, price: Number(e.target.value) })}
                        style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Pricing Mode</label>
                      <select
                        value={editingCatalogItem.mode || "pax"}
                        onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, mode: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422" }}
                      >
                        <option value="pax">Per Pax</option>
                        <option value="unit">Per Unit (Capacity Based)</option>
                        <option value="flat">Flat Quantity Stepper</option>
                        <option value="tier">Tiered (Base + Extra Pax Surcharge)</option>
                      </select>
                    </div>

                    {editingCatalogItem.mode === "unit" && (
                      <div>
                        <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Unit Pax Capacity</label>
                        <input
                          type="number"
                          value={editingCatalogItem.capacity ?? 4}
                          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, capacity: Number(e.target.value) })}
                          style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                        />
                      </div>
                    )}

                    {editingCatalogItem.mode === "tier" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 2 }}>Base Pax Max</label>
                          <input
                            type="number"
                            value={editingCatalogItem.threshold ?? 2}
                            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, threshold: Number(e.target.value) })}
                            style={{ width: "100%", padding: "6px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 2 }}>Extra Surcharge (IDR)</label>
                          <input
                            type="number"
                            value={editingCatalogItem.surcharge ?? 50000}
                            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, surcharge: Number(e.target.value) })}
                            style={{ width: "100%", padding: "6px", borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422" }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => handleSaveCatalogItem(editingCatalogItem)}
                        style={{ flex: 1, padding: "10px", borderRadius: 8, background: COLORS.profit, color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingCatalogItem(null)}
                        style={{ padding: "10px 14px", borderRadius: 8, background: THEME.cardDeepBg, color: THEME.textMain, border: `1px solid ${THEME.border}`, fontWeight: 700, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === "users" && isGodUser && (
          <div style={{ background: THEME.cardBg, borderRadius: 18, padding: 18, border: `1px solid ${THEME.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <ShieldAlert size={26} color={COLORS.coral} />
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: THEME.textMain }}>
                  God Access Governance
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
                  Create accounts, set profit margin limits, and customize role permissions.
                </p>
              </div>
            </div>

            {/* Supabase Cloud Sync Settings Panel */}
            <div style={{ background: COLORS.oceanLight, borderRadius: 14, padding: 14, marginBottom: 18, border: `1px solid ${COLORS.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F4EEDD", fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>
                <Cloud size={16} color="#FFD166" />
                <span>Supabase Cloud Database Settings (GOD Only)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#A3C2BD", fontWeight: 600, marginBottom: 2 }}>Supabase Project URL</label>
                  <input
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5, background: "#FFF", color: COLORS.ink, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#A3C2BD", fontWeight: 600, marginBottom: 2 }}>Supabase Anon API Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={supabaseConfig.apiKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, apiKey: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 11.5, background: "#FFF", color: COLORS.ink, boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            {/* Account Registration Form */}
            <div style={{ background: THEME.cardDeepBg, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${THEME.border}` }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={16} color={COLORS.coral} /> Register New Team Account
              </h3>

              {userNotice.text ? (
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
                    color: userNotice.type === "error" ? "#C62828" : "#1B5E20",
                    border: `1px solid ${userNotice.type === "error" ? "#EF9A9A" : "#A5D6A7"}`,
                  }}
                >
                  {userNotice.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  <span>{userNotice.text}</span>
                </div>
              ) : null}

              <form onSubmit={handleGodCreateUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Freelance Partner"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. alex2026"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Initial Password</label>
                    <input
                      type="text"
                      required
                      placeholder="Set account password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Role Class</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontWeight: 600, background: "#FFF", color: "#132422" }}
                    >
                      <option value="Staff Agent">Staff Agent</option>
                      <option value="Freelance Sales">Freelance Sales</option>
                      <option value="Partner Agency / B2B Reseller">Partner Agency / B2B Reseller</option>
                      <option value="Tour Guide / Field Lead">Tour Guide / Field Lead</option>
                      <option value="Operations & Finance">Operations & Finance</option>
                      <option value="Admin Manager">Admin Manager</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>Min Profit Margin (%)</label>
                    <input
                      type="number"
                      value={newUserForm.minMargin}
                      onChange={(e) => setNewUserForm({ ...newUserForm, minMargin: e.target.value })}
                      style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Granular Permission Toggles */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, borderTop: `1px dashed ${THEME.border}`, paddingTop: 10 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={newUserForm.canSeeVendorCosts}
                      onChange={(e) => setNewUserForm({ ...newUserForm, canSeeVendorCosts: e.target.checked })}
                    />
                    Can View Vendor Costs & Margins
                  </label>

                  <label style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={newUserForm.canEditCatalog}
                      onChange={(e) => setNewUserForm({ ...newUserForm, canEditCatalog: e.target.checked })}
                    />
                    Can Edit Vendor Catalog
                  </label>

                  <label style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={newUserForm.canEditPresets}
                      onChange={(e) => setNewUserForm({ ...newUserForm, canEditPresets: e.target.checked })}
                    />
                    Can Edit Package Presets
                  </label>

                  <label style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={newUserForm.canSeeAllDashboardQuotes}
                      onChange={(e) => setNewUserForm({ ...newUserForm, canSeeAllDashboardQuotes: e.target.checked })}
                    />
                    Can View All Company Quotes
                  </label>

                  <label style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={newUserForm.canAccessDashboard}
                      onChange={(e) => setNewUserForm({ ...newUserForm, canAccessDashboard: e.target.checked })}
                    />
                    Can Access Personal Dashboard
                  </label>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: COLORS.coral,
                    color: "#FFF",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <UserPlus size={15} /> Create & Publish Account
                </button>
              </form>
            </div>

            {/* Accounts Directory */}
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: THEME.textMain }}>
              Registered Accounts Directory ({usersList.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {usersList.map((user) => (
                <div
                  key={user.id}
                  style={{
                    background: THEME.cardDeepBg,
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: THEME.textMain, display: "flex", alignItems: "center", gap: 6 }}>
                      <User size={14} color={COLORS.coral} />
                      <span>{user.name}</span>
                      <span style={{ fontSize: 11, color: THEME.textMuted, background: THEME.cardBg, padding: "1px 6px", borderRadius: 4 }}>
                        @{user.username}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: COLORS.oceanLight, color: "#F4EEDD" }}>
                        {user.role}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, fontWeight: 600 }}>
                      Min Margin: {user.minMargin}% · Email: {user.email}
                    </div>
                  </div>

                  {isGodUser && user.id !== currentUser.id && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{ padding: "4px 8px", borderRadius: 6, background: COLORS.oceanLight, color: "#F4EEDD", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                      >
                        Edit Rules
                      </button>
                      <button
                        onClick={() => deleteUserAccount(user.id)}
                        style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showAiItineraryModal && (
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
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 20,
                padding: 24,
                maxWidth: 640,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={22} color={COLORS.coral} />
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: THEME.textMain }}>
                    Gemini AI Itinerary Creator
                  </h3>
                </div>
                <button onClick={() => setShowAiItineraryModal(false)} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Quick Inspiration Prompts */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                  Quick Inspiration Prompts:
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    "3 Days Honeymoon with Snorkeling & Beach Clubs",
                    "1 Day West Nusa Penida Express + Private Car",
                    "2 Days Scuba Diving Certified + Luxury Resort",
                    "East & West Combination Family Tour (2 Adults, 2 Kids)",
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setAiItineraryPrompt(tpl)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.cardDeepBg,
                        color: THEME.textMain,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      💡 {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Area */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>
                  Describe Your Desired Guest Tour Experience:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Create a 2-day relaxed luxury itinerary with Manta Point snorkeling, oceanview lunch, private car, and fastboat transfers..."
                  value={aiItineraryPrompt}
                  onChange={(e) => setAiItineraryPrompt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 10,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 12.5,
                    background: "#FFFFFF",
                    color: "#132422",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={generateAiItineraryWithGemini}
                disabled={isGeneratingItinerary || !aiItineraryPrompt.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  background: COLORS.coral,
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 14,
                  opacity: isGeneratingItinerary || !aiItineraryPrompt.trim() ? 0.7 : 1,
                }}
              >
                <Bot size={16} /> {isGeneratingItinerary ? "Designing Itinerary with Gemini AI..." : "Create Itinerary with AI"}
              </button>

              {/* Generated Itinerary Output */}
              {generatedAiItinerary && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>AI Designed Itinerary:</span>
                    <button
                      onClick={async () => {
                        const success = await copyToClipboard(generatedAiItinerary);
                        if (success) {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: COLORS.profit,
                        color: "#FFF",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Copy size={12} /> {copied ? "Copied!" : "Copy Itinerary"}
                    </button>
                  </div>
                  <pre
                    style={{
                      background: THEME.cardDeepBg,
                      padding: 12,
                      borderRadius: 10,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12,
                      color: THEME.textMain,
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      maxHeight: 280,
                      overflowY: "auto",
                    }}
                  >
                    {generatedAiItinerary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {showAiDrawer && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 20,
                padding: 24,
                maxWidth: 600,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bot size={22} color={COLORS.coral} />
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, color: THEME.textMain }}>
                    AI Tour Proposal Generator
                  </h3>
                </div>
                <button onClick={() => setShowAiDrawer(false)} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Persona Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                  Select Sales Persona Tone:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {AI_PERSONAS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setAiPersona(p.id)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: `1px solid ${aiPersona === p.id ? COLORS.coral : THEME.border}`,
                        background: aiPersona === p.id ? THEME.cardDeepBg : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: THEME.textMuted }}>{p.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>
                  Target Proposal Language:
                </label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12.5, background: "#FFF", color: "#132422" }}
                >
                  {AI_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* GOD Master System Instructions Editor */}
              {isGodUser && (
                <div style={{ marginBottom: 14, borderTop: `1px dashed ${THEME.border}`, paddingTop: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: COLORS.coral, marginBottom: 4 }}>
                    <Key size={13} /> Master AI System Prompt Rules (GOD Only)
                  </label>
                  <textarea
                    rows={3}
                    value={masterAiPrompt}
                    onChange={(e) => setMasterAiPrompt(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 11.5, background: "#FFF", color: "#132422", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <button
                onClick={generateAiProposalPrompt}
                disabled={isGeneratingAi}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  background: COLORS.coral,
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Sparkles size={16} /> {isGeneratingAi ? "Generating Proposal..." : "Generate AI Proposal"}
              </button>

              {/* Output Preview */}
              {generatedAiProposal && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>Generated Proposal Output:</span>
                    <button
                      onClick={async () => {
                        const success = await copyToClipboard(generatedAiProposal);
                        if (success) {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{ padding: "4px 8px", borderRadius: 6, background: COLORS.profit, color: "#FFF", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Copy size={12} /> {copied ? "Copied!" : "Copy Proposal"}
                    </button>
                  </div>
                  <pre
                    style={{
                      background: THEME.cardDeepBg,
                      padding: 12,
                      borderRadius: 10,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 12,
                      color: THEME.textMain,
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      maxHeight: 280,
                      overflowY: "auto",
                    }}
                  >
                    {generatedAiProposal}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {showWhatsappModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: THEME.cardBg,
                borderRadius: 20,
                padding: 20,
                maxWidth: 540,
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={20} color={COLORS.coral} />
                  <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: THEME.textMain }}>
                    Formatted WhatsApp Quotation
                  </h3>
                </div>
                <button onClick={() => setShowWhatsappModal(false)} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>

              <pre
                style={{
                  background: THEME.cardDeepBg,
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${THEME.border}`,
                  fontSize: 12,
                  color: THEME.textMain,
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  marginBottom: 14,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {formattedQuotationText}
              </pre>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={async () => {
                    const success = await copyToClipboard(formattedQuotationText);
                    if (success) {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    background: COLORS.profit,
                    color: "#FFF",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Copy size={14} /> {copied ? "Copied to Clipboard!" : "Copy WhatsApp Text"}
                </button>
                <button
                  onClick={() => setShowWhatsappModal(false)}
                  style={{ padding: "10px 16px", borderRadius: 8, background: THEME.cardDeepBg, color: THEME.textMain, border: `1px solid ${THEME.border}`, fontWeight: 700, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}