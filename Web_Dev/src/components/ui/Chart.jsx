import React, { useEffect, useRef } from 'react';
import { Hexagon } from 'lucide-react';
import { useIp } from '../../context/IpContext';



const Chart = () => {
  const mapRef = useRef(null);
  const { ip } = useIp();
  const LOCAL_IP = '192.168.1.5';

  useEffect(() => {
    const platform = new window.H.service.Platform({
      apikey: 'ZwJpQXPIykn1KNiFFc9h6rSS3hXYbdhVHUvRkFfyLeI',
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 17.385, lng: 78.4867 },
        zoom: 12,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );



    new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
    const ui = window.H.ui.UI.createDefault(map, defaultLayers);


    const token = localStorage.getItem('token');
    console.log(LOCAL_IP);
    fetch(`http://192.168.43.97:3000/api/admin/reports/severity/high?page=1&limit=10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        data.data.forEach((report) => {
          const coords = report.centroid;
          if (!coords || !coords.latitude || !coords.longitude) return;

          const locationName = report.reports[0]?.location?.locationName || 'Unknown Location';
          const reportCount = report.reportCount;
          const severity = report.damageResult.severity || 'high';
          console.log(severity)
          const getMarkerColor = (severity) => {
            if (severity === 'high') return 'red';
            if (severity === 'medium') return 'orange';
            return 'green';
          };


          function lucideIconToDataUrl(color = 'red', size = 10) {
            const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M21 16v-8l-9-6-9 6v8l9 6 9-6z" />
    </svg>
  `;
            return `data:image/svg+xml;base64,${btoa(svgString)}`;
          }



          const color = getMarkerColor(severity);
          const iconUrl = lucideIconToDataUrl('#FF0000');
          const icon = new window.H.map.Icon(iconUrl, {
            size: { w: 50, h: 50 },
            anchor: { x: 16, y: 32 },
          });

          const marker = new window.H.map.Marker(
            { lat: coords.latitude, lng: coords.longitude },
            { icon }
          );





          map.addObject(marker);
        });


      })
      .catch((error) => {
        console.error('Error fetching high-severity reports:', error);
      });

    return () => {
      map.dispose();
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default Chart;
