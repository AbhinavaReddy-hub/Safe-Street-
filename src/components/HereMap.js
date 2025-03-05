import React, { useEffect, useState } from 'react';
import '/Users/raghupersonal/Desktop/SAFESTREET/maps/src/styles/App.css'; // Import the CSS file

const HereMap = ({ apiKey }) => {
  const [map, setMap] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [addresses, setAddresses] = useState([]);

  // Function to fetch address using Reverse Geocoding API
  const fetchAddress = async (lat, lng) => {
    try {
      const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apiKey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log('Reverse Geocoding Response:', data); // Debugging
      if (data.items && data.items.length > 0) {
        return data.items[0].title; // Return the address
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Error fetching address';
    }
  };

  // Function to generate a Google Maps link
  const generateGoogleMapsLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Function to generate a HERE Maps link
  const generateHereMapsLink = (lat, lng) => {
    return `https://share.here.com/${lat},${lng}`;
  };

  useEffect(() => {
    // Check if HERE Maps API is loaded
    if (!window.H) {
      console.error('HERE Maps API not loaded');
      return;
    }

    // Initialize the platform object
    const platform = new window.H.service.Platform({
      apikey: apiKey,
    });
    setPlatform(platform);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, [apiKey]);

  useEffect(() => {
    if (platform && userLocation && window.H) {
      // Create a map centered at the user's location
      const defaultLayers = platform.createDefaultLayers();
      const map = new window.H.Map(
        document.getElementById('map'),
        defaultLayers.vector.normal.map,
        {
          center: userLocation,
          zoom: 14,
        }
      );

      // Add behavior controls
      const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      const ui = window.H.ui.UI.createDefault(map, defaultLayers);

      // Add a marker for the user's location
      const userMarker = new window.H.map.Marker(userLocation);
      map.addObject(userMarker);

      // Fetch addresses and add red dots for predefined coordinates near the user's location
      const predefinedCoordinates = [
        { lat: 17.3850, lng: 78.4867 }, // Hyderabad city center
        { lat: 17.4239, lng: 78.4738 }, // Gachibowli
        { lat: 17.4065, lng: 78.4772 }, // Jubilee Hills
        { lat: 17.3616, lng: 78.4747 }, // Banjara Hills
        { lat: 17.4126, lng: 78.4975 }, // HITEC City
      ];

      predefinedCoordinates.forEach(async (coord) => {
        const address = await fetchAddress(coord.lat, coord.lng);
        setAddresses((prev) => [...prev, { ...coord, address }]);

        const redDotSvg = `<svg width="8" height="8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="red" />
        </svg>`;
        const icon = new window.H.map.Icon(redDotSvg);
        const marker = new window.H.map.Marker(coord, { icon });

        // Add a label with the address
        marker.setData(address);
        marker.addEventListener('tap', () => {
          alert(`Address: ${address}`);
        });

        map.addObject(marker);
      });

      setMap(map);

      // Cleanup on unmount
      return () => {
        map.dispose();
      };
    }
  }, [platform, userLocation]);

  return (
    <div className="App">
      <h1>React App with HERE Maps</h1>
      <div className="map-container">
        <div id="map" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="address-list">
        <h3>Addresses Near You:</h3>
        <ul>
          {addresses.map((addr, index) => (
            <li key={index}>
              <strong>{addr.address}</strong> (Lat: {addr.lat}, Lng: {addr.lng})
              <div className="links">
                <a
                  href={generateGoogleMapsLink(addr.lat, addr.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
                <a
                  href={generateHereMapsLink(addr.lat, addr.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in HERE Maps
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HereMap;