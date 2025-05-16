// server/testReport.js
const { createReport } = require('./services/reportService');

(async () => {
  try {
    const rpt = await createReport({
      imageUrls: [
        'https://res.cloudinary.com/dowliahd4/image/upload/v1747321090/safe-street-reports/iv1gsq5ifek8gexmi89a.jpg',
        'https://res.cloudinary.com/dowliahd4/image/upload/v1747321090/safe-street-reports/iv1gsq5ifek8gexmi89a.jpg'
      ],
      userId: '608c1f5a4f1d2c001c8b4567',
      location: { lng: 77.6, lat: 17.4, locationName: 'Test Rd' },
      trafficCongestionScore: 0.7
    });
    console.log('✅ Report created:', rpt);
  } catch (err) {
    console.error('❌ Error creating report:', err);
  } finally {
    process.exit();
  }
})();
