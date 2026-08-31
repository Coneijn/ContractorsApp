"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DIRECTORY_DATA, DirectoryCategory } from "@/lib/directoryData";

export default function DirectoryTab() {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isEs = language === "es";

  // Textos bilingües con soporte directo a 't' y fallback dinámico
  const dict = (t as Record<string, any>)?.directory || {};
  const labels = {
    title: dict.title || (isEs ? "Directorio Interno" : "Internal Directory"),
    subtitle: dict.subtitle || (isEs ? "Contactos clave del equipo, proveedores, utilidades y servicios de la ciudad." : "Key contacts for team, vendors, utilities, and city services."),
    searchPlaceholder: dict.searchPlaceholder || (isEs ? "Buscar por nombre, rol, teléfono o nota..." : "Search by name, role, phone, or notes..."),
    allCategories: dict.allCategories || (isEs ? "Todas las categorías" : "All categories"),
    noResults: dict.noResults || (isEs ? "No se encontraron contactos que coincidan con la búsqueda." : "No contacts found matching your search."),
  };

  const cleanPhoneForWhatsApp = (phone: string) => phone.replace(/\D/g, "");

  const filteredCategories = useMemo(() => {
    return DIRECTORY_DATA.map((cat) => {
      if (selectedCategory !== "all" && cat.id !== selectedCategory) {
        return null;
      }

      const filteredContacts = cat.contacts.filter((contact) => {
        const query = searchTerm.toLowerCase();
        return (
          contact.name.toLowerCase().includes(query) ||
          contact.roleOrService.toLowerCase().includes(query) ||
          contact.phone.toLowerCase().includes(query) ||
          (contact.channelOrNotes && contact.channelOrNotes.toLowerCase().includes(query))
        );
      });

      if (filteredContacts.length === 0) return null;

      return {
        ...cat,
        contacts: filteredContacts,
      };
    }).filter(Boolean) as DirectoryCategory[];
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
{/* Header & Controls Bilingue */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{labels.title}</h2>
            <p className="text-sm text-slate-400">{labels.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-600 bg-slate-900 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
          </div>
          
          {/* Filtro por Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-900 text-slate-200 focus:ring-2 focus:ring-yellow-400 outline-none"
          >
            <option value="all">{labels.allCategories}</option>
            {DIRECTORY_DATA.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {dict.categories?.[cat.id] || cat.category}
              </option>
            ))}
          </select>
        </div>
      </div>

{/* Resultados */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400">{labels.noResults}</p>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-slate-100">
                {dict.categories?.[category.id] || category.category}
              </h3>
              <span className="text-xs bg-slate-900 text-yellow-400 px-2 py-0.5 rounded-full font-bold border border-slate-700">
                {category.contacts.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.contacts.map((contact, index) => {
                const isCallable = contact.phone !== " " && contact.phone.length > 3;
                const isWa = contact.isWhatsApp || contact.channelOrNotes?.toLowerCase().includes("whatsapp");

                return (
                  <div
                    key={index}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm hover:border-yellow-400 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-yellow-400 text-base">{contact.name}</h4>
                        {isWa && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                            WhatsApp
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{contact.roleOrService}</p>
                      
                      {contact.channelOrNotes && !isWa && (
                        <p className="text-[11px] text-slate-400 bg-slate-900 rounded p-2 mt-2 border border-slate-700 leading-snug">
                            ℹ️ {contact.channelOrNotes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">{contact.phone}</span>
                      {isCallable && (
                        <div className="flex items-center gap-1.5">
                          {isWa && (
                            <a
                              href={`https://wa.me/${cleanPhoneForWhatsApp(contact.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/60 rounded-lg text-xs font-medium transition"
                              title="WhatsApp"
                            >
                              💬
                            </a>
                          )}
                          <a
                            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                            className="p-2 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-lg text-xs font-medium transition"
                            title={dict.call || (isEs ? "Llamar" : "Call")}
                          >
                            📞
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}