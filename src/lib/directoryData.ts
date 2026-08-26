export interface ContactEntry {
    name: string;
    roleOrService: string;
    phone: string;
    channelOrNotes?: string;
    isWhatsApp?: boolean;
  }
  
  export interface DirectoryCategory {
    id: string;
    category: string;
    icon: string;
    contacts: ContactEntry[];
  }
  
  export const DIRECTORY_DATA: DirectoryCategory[] = [
    {
      id: "team",
      category: "Team (Spencer's People)",
      icon: "👥",
      contacts: [
        { name: "Spencer Shadrach", roleOrService: "Owner", phone: "+1 (901) 487-2991", channelOrNotes: "WhatsApp", isWhatsApp: true },
        { name: "Carol Elkins", roleOrService: "Office Manager", phone: "+1 (901) 318-1736", channelOrNotes: "WhatsApp", isWhatsApp: true },
        { name: "Pam", roleOrService: "Transactions / Closings", phone: "+63 917-145-4747", channelOrNotes: "WhatsApp", isWhatsApp: true },
        { name: "Daaron Flagg", roleOrService: "Seller Relations", phone: "+1 (901) 364-1842", channelOrNotes: "WhatsApp", isWhatsApp: true },
        { name: "Susie Espinoza", roleOrService: "Field Rep / DAD", phone: "+1 (901) 517-7544", channelOrNotes: "WhatsApp", isWhatsApp: true },
      ],
    },
    {
      id: "vendors",
      category: "Vendors & Services",
      icon: "🔧",
      contacts: [
        { name: "Gerardo Melgar", roleOrService: "Cleanouts, mowing, handyman", phone: "(901) 350-3252", channelOrNotes: "Después de 6pm entre semana" },
        { name: "Keith Lockster", roleOrService: "Locksmith / rekeying", phone: "(901) 279-9193" },
        { name: "Santiago Benitez", roleOrService: "Painting", phone: "(901) 218-3180" },
        { name: "Dallan (Magnolia Renew)", roleOrService: "Painting / repairs", phone: "(662) 420-5747" },
      ],
    },
    {
      id: "utilities",
      category: "Utilities",
      icon: "⚡",
      contacts: [
        { name: "MLGW (Memphis Light Gas & Water)", roleOrService: "Residential Services", phone: "(901) 544-6549", channelOrNotes: "Servicios residenciales" },
        { name: "MLGW — Transferencias", roleOrService: "Account Changes / Turn-on", phone: "(901) 544-6549", channelOrNotes: "Opt. 2 — Cambio de cuenta / turn-on" },
        { name: "Mississippi Power (North MS)", roleOrService: "Electric", phone: "1-800-532-1502" },
        { name: "Atmos Energy", roleOrService: "Gas", phone: "1-888-286-6700" },
        { name: "MLGW Emergency", roleOrService: "Gas leak", phone: "(901) 528-4465", channelOrNotes: "24/7" },
      ],
    },
    {
      id: "dumpster",
      category: "Dumpster / Disposal",
      icon: "🗑️",
      contacts: [
        { name: "Proveedor Pendiente", roleOrService: "Dumpster rental", phone: "—", channelOrNotes: "¿Cuál usas actualmente?" },
      ],
    },
    {
      id: "emergency",
      category: "Emergency / City",
      icon: "🚨",
      contacts: [
        { name: "Memphis Code Enforcement", roleOrService: "Code Enforcement", phone: "(901) 636-6300" },
        { name: "Memphis Permits / Inspections", roleOrService: "Permits & Inspections", phone: "(901) 636-6570" },
        { name: "Non-emergency Police", roleOrService: "Police Department", phone: "(901) 545-2677" },
      ],
    },
  ];