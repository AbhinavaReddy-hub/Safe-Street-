// // // src/ui/MarkerHover.js

// // /**
// //  * Returns the HTML content string for a hover-tooltip with image on left and colored severity on right.
// //  */
// // export function getMarkerTooltipHtml({ imageUrl, severity }) {
// //     const severityColors = {
// //       high: '#f5424b',
// //       medium: '#db7209',
// //       low: '#0ccf3a',
// //     };
// //     const color = severityColors[severity] || '#000';
  
// //     return `
// //       <div style="
// //         display: flex;
// //         align-items: center;
// //         background: #fff;
// //         padding: 8px;
// //         border-radius: 4px;
// //         box-shadow: 0 2px 6px rgba(0,0,0,0.25);
// //         max-width: 200px;
// //         font-family: Arial, sans-serif;
// //       ">
// //         <img
// //           src="${imageUrl}"
// //           style="
// //             width: 60px;
// //             height: 60px;
// //             object-fit: cover;
// //             border-radius: 4px;
// //             margin-right: 8px;
// //           "
// //           alt="Damage thumbnail"
// //         />
// //         <div style="
// //           flex: 1;
// //           font-size: 14px;
// //           font-weight: bold;
// //           color: ${color};
// //           text-align: right;
// //         ">
// //           ${severity.charAt(0).toUpperCase() + severity.slice(1)}
// //         </div>
// //       </div>
// //     `;
// //   }
  
// //   /**
// //    * Attaches pointerenter / pointerleave listeners on a HERE marker
// //    * to show / hide an InfoBubble with our tooltip HTML.
// //    *
// //    * @param {H.map.Marker} marker   – the HERE map Marker instance
// //    * @param {H.ui.UI}        ui       – the HERE UI instance from createDefault()
// //    * @param {Object}         options  – { imageUrl: string, severity: string }
// //    */
// //   export function attachHoverTooltip(marker, ui, options) {
// //     let bubble = null;
  
// //     marker.addEventListener('pointerenter', () => {
// //       const content = getMarkerTooltipHtml(options);
// //       bubble = new window.H.ui.InfoBubble(marker.getGeometry(), { content });
// //       ui.addBubble(bubble);
// //     });
  
// //     marker.addEventListener('pointerleave', () => {
// //       if (bubble) {
// //         ui.removeBubble(bubble);
// //         bubble = null;
// //       }
// //     });
// //   }
  





// // src/ui/MarkerHover.js

// /**
//  * Returns the HTML content string for a hover-tooltip with enhanced styling:
//  * - Fixed width with generous padding
//  * - Rounded corners and subtle shadow
//  * - Flex layout with image on left, text on right with spacing
//  */
// export function getMarkerTooltipHtml({ imageUrl, severity }) {
//     const severityColors = {
//       high: '#f5424b',
//       medium: '#db7209',
//       low: '#0ccf3a',
//     };
//     const color = severityColors[severity] || '#333';
//     const capitalSeverity = severity.charAt(0).toUpperCase() + severity.slice(1);
  
//     return `
//       <div style="
//         display: flex;
//         align-items: center;
//         background: #ffffff;
//         padding: 10px;
//         border-radius: 8px;
//         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//         width: 200px;
//         gap: 12px;
//         font-family: Arial, sans-serif;
//       ">
//         <img
//           src="${imageUrl}"
//           style="
//             width: 64px;
//             height: 64px;
//             object-fit: cover;
//             border-radius: 8px;
//           "
//           alt="Damage thumbnail"
//         />
//         <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
//           <div style="
//             font-size: 14px;
//             font-weight: 600;
//             color: #333333;
//             margin-bottom: 4px;
//           ">Damage Report</div>
//           <div style="
//             font-size: 13px;
//             font-weight: bold;
//             color: ${color};
//           ">${capitalSeverity}</div>
//         </div>
//       </div>
//     `;
//   }
  
//   /**
//    * Attaches pointerenter / pointerleave listeners on a HERE marker
//    * to show / hide an InfoBubble with our styled tooltip HTML.
//    *
//    * @param {H.map.Marker} marker   – the HERE map Marker instance
//    * @param {H.ui.UI}       ui       – the HERE UI instance from createDefault()
//    * @param {Object}        options  – { imageUrl: string, severity: string }
//    */
//   export function attachHoverTooltip(marker, ui, options) {
//     let bubble = null;
  
//     marker.addEventListener('pointerenter', () => {
//       const content = getMarkerTooltipHtml(options);
//       bubble = new window.H.ui.InfoBubble(marker.getGeometry(), { content });
//       ui.addBubble(bubble);
//     });
  
//     marker.addEventListener('pointerleave', () => {
//       if (bubble) {
//         ui.removeBubble(bubble);
//         bubble = null;
//       }
//     });
//   }





// src/ui/MarkerHover.js

/**
 * Returns the HTML content string for a hover-tooltip with enhanced styling:
 * - Fixed width with generous padding
 * - Rounded corners and subtle shadow
 * - Flex layout with image on left, text on right with spacing
 * - Link to open location in Google Maps
 */
export function getMarkerTooltipHtml({ imageUrl, severity, lat, lng }) {
    const severityColors = {
      high: '#f5424b',
      medium: '#db7209',
      low: '#0ccf3a',
    };
    const color = severityColors[severity] || '#333';
    const capSeverity = severity.charAt(0).toUpperCase() + severity.slice(1);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  
    return `
      <div style="
        display: flex;
        flex-direction: column;
        background: #ffffff;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        width: 200px;
        font-family: Arial, sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img
            src="${imageUrl}"
            style="
              width: 64px;
              height: 64px;
              object-fit: cover;
              border-radius: 8px;
            "
            alt="Damage thumbnail"
          />
          <div style="flex: 1;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #333333;
              margin-bottom: 4px;
            ">Damage Report</div>
            <div style="
              font-size: 13px;
              font-weight: bold;
              color: ${color};
            ">${capSeverity}</div>
          </div>
        </div>
        <a
          href="${mapsUrl}"
          target="_blank"
          style="
            margin-top: 8px;
            font-size: 12px;
            color: #1a73e8;
            text-decoration: none;
            align-self: flex-end;
          "
        >
          View on Google Maps
        </a>
      </div>
    `;
  }
  
  /**
   * Attaches pointerenter / pointerleave listeners on a HERE marker
   * to show / hide an InfoBubble with our styled tooltip HTML and maps link.
   *
   * @param {H.map.Marker} marker   – the HERE map Marker instance
   * @param {H.ui.UI}       ui       – the HERE UI instance from createDefault()
   * @param {Object}        options  – { imageUrl: string, severity: string, lat: number, lng: number }
   */
  export function attachHoverTooltip(marker, ui, options) {
    let bubble = null;
  
    marker.addEventListener('pointerenter', () => {
      const content = getMarkerTooltipHtml(options);
      bubble = new window.H.ui.InfoBubble(marker.getGeometry(), { content });
      ui.addBubble(bubble);
    });
  
    marker.addEventListener('pointerleave', () => {
      if (bubble) {
        ui.removeBubble(bubble);
        bubble = null;
      }
    });
  }
  