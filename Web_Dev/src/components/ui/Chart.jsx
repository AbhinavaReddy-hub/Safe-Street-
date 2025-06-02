import React, { useEffect, useRef } from 'react';
import { attachHoverTooltip } from './MarkerHover';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const PLACEHOLDER = 'https://via.placeholder.com/120x80.png?text=No+Image';

const Chart = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // 1) Inject HERE UI CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
    document.head.appendChild(cssLink);

    // 2) Initialize HERE map (raster tiles)
    const platform = new window.H.service.Platform({
      apikey: 'ZwJpQXPIykn1KNiFFc9h6rSS3hXYbdhVHUvRkFfyLeI',
    });
    const defaultLayers = platform.createDefaultLayers();
    const map = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 17.385, lng: 78.4867 },
        zoom: 11,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );
    new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
    const ui = window.H.ui.UI.createDefault(map, defaultLayers);

    // 3) Helpers
    const getMarkerColor = (sev) =>
      sev === 'high' ? '#f5424b' : sev === 'medium' ? '#db7209' : '#0ccf3a';

    const makePin = (color, size = 36) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // 4) Fetch batch‐reports & plot markers
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/admin/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ data: batches }) => {
        batches.forEach((batch) => {
          const { centroid, damageResult, reports, batchId, reportCount } = batch;
          const lat = centroid?.latitude;
          const lng = centroid?.longitude;
          if (!lat || !lng) return;

          // pin color by severity
          const severity = damageResult.severity || 'low';
          const icon = new window.H.map.Icon(
            makePin(getMarkerColor(severity)),
            { size: { w: 50, h: 50 },
              anchor: { x: 16, y: 32 }, }
          );
          const marker = new window.H.map.Marker({ lat, lng }, { icon });

          // ── IMAGE LOGIC ────────────────────────────────────────
          // first try batch.reports[0].imageUrls[0]
          const firstReport = Array.isArray(reports) && reports.length > 0
            ? reports[0]
            : null;
          const rawThumb =
            firstReport && Array.isArray(firstReport.imageUrls) && firstReport.imageUrls.length > 0
              ? firstReport.imageUrls[0]
              : '';
          const imageUrl = rawThumb.startsWith('http')
            ? rawThumb
            : rawThumb
            ? `${API_BASE}/${rawThumb.replace(/^\/+/, '')}`
            : PLACEHOLDER;

          // attach hover‐tooltip & click behaviour
          attachHoverTooltip(marker, ui, { imageUrl, severity, lat, lng, batchId, reportCount });
          marker.addEventListener('tap', () =>
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
          );

          map.addObject(marker);
        });
      })
      .catch(console.error);

    // clean up
    return () => {
      map.dispose();
      document.head.removeChild(cssLink);
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default Chart;