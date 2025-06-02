export function getMarkerTooltipHtml({ imageUrl, severity, lat, lng, batchId, reportCount }) {
    const severityColors = {
      high: '#f5424b',
      medium: '#ffda03',
      low: '#0ccf3a',
    };
    const color = severityColors[severity] || '#333';
    const capSeverity = severity.charAt(0).toUpperCase() + severity.slice(1);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const shortBatchId = batchId ? batchId.slice(-5) : 'N/A';
    const displayReportCount = reportCount !== undefined ? reportCount : 'N/A';

    return `
      <div style="
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 220px;
  font-family: Arial, sans-serif;
">
  <div style="display: flex; align-items: center; gap: 12px;">
    <img
      src="${imageUrl}"
      style="
        width: 96px;
        height: 96px;
        object-fit: cover;
        border-radius: 3px;
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
      <div style="
        font-size: 12px;
        color: #666666;
        margin-top: 4px;
      ">Batch ID: ${shortBatchId}</div>
      <div style="
        font-size: 12px;
        color: #666666;
        margin-top: 4px;
      ">Report Count: ${displayReportCount}</div>
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