"use client";

import React, { useState, useMemo } from "react";
import { DIRECTORY_DATA, DirectoryCategory, ContactEntry } from "@/lib/directoryData";

export default function DirectoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

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
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Directorio Interno</h2>
            <p className="text-sm text-gray-500">Contactos clave del equipo, proveedores, utilidades y servicios de la ciudad.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, rol, teléfono o nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>

          {/* Filtro por Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Todas las categorías</option>
            {DIRECTORY_DATA.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories & Contact Cards */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No se encontraron contactos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-gray-800">{category.category}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {category.contacts.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.contacts.map((contact, index) => {
                const isCallable = contact.phone !== "—" && contact.phone.length > 3;
                const isWa = contact.isWhatsApp || contact.channelOrNotes?.toLowerCase().includes("whatsapp");

                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-gray-900 text-base">{contact.name}</h4>
                        {isWa && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            WhatsApp
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-blue-600 mt-0.5">{contact.roleOrService}</p>

                      {contact.channelOrNotes && !isWa && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded p-1.5 mt-2 border border-amber-100">
                          📌 {contact.channelOrNotes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{contact.phone}</span>

                      {isCallable && (
                        <div className="flex items-center gap-1.5">
                          {isWa && (
                            <a
                              href={`https://wa.me/${cleanPhoneForWhatsApp(contact.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm transition"
                              title="Abrir WhatsApp"
                            >
                              💬
                            </a>
                          )}
                          <a
                            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm transition"
                            title="Llamar"
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