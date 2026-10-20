"use client";

import React, { useEffect, useRef } from "react";
import type { Map as LeafletMapType } from "leaflet";

export const LeafletMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMapType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;
      if (mapInstanceRef.current) return;

      // Fix default marker icon assets
      const defaultIconProto = L.Icon.Default.prototype as unknown as {
        _getIconUrl?: () => string;
      };
      delete defaultIconProto._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView([-6.98, 108.48], 11);

      map.attributionControl.setPrefix(false);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add a marker for Disperkimtan Kuningan
      const marker = L.marker([-6.974, 108.495]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: #143965; font-size: 14px;">Disperkimtan Kab. Kuningan</strong><br/>
          Jl. RE. Martadinata No. 528 Ancaran, Kuningan<br/>
          <span style="color: #65778B; font-size: 11px;">Pusat Monitoring Bidang Kawasan Permukiman</span>
        </div>
      `);

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[280px] md:min-h-[340px] rounded-xl overflow-hidden border border-[#DCE5ED]"
      role="application"
      aria-label="Peta interaktif area Kabupaten Kuningan, Jawa Barat"
    />
  );
};
