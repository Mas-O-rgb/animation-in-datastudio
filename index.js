// Memuat library peta Leaflet.js secara dinamis
const cssLink = document.createElement('link');
cssLink.rel = 'stylesheet';
cssLink.href = 'https://unpkg.com';
document.head.appendChild(cssLink);

const scriptLink = document.createElement('script');
scriptLink.src = 'https://unpkg.com';
document.head.appendChild(scriptLink);

scriptLink.onload = () => {
  // Buat elemen penampung peta di kanvas Looker Studio
  const mapDiv = document.createElement('div');
  mapDiv.id = 'map';
  mapDiv.style.width = '100%';
  mapDiv.style.height = '100%';
  document.body.appendChild(mapDiv);

  // Inisialisasi peta awal (Fokus area Indonesia secara default)
  const map = L.map('map').setView([-2.5489, 118.0149], 5);

  // Menggunakan OpenStreetMap sebagai basemap gratis
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // FUNGSI UNTUK MEMBACA DATA DARI LOOKER STUDIO
  function drawViz(data) {
    // Hapus marker lama sebelum merender data baru
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const rows = data.tables.DEFAULT;
    
    rows.forEach((row) => {
      // Looker Studio akan mengirimkan koordinat berdasarkan dimensi yang dipilih pengguna
      const lat = parseFloat(row.latDim[0]);
      const lng = parseFloat(row.lngDim[0]);
      const kategori = row.kategoriDim[0]; // Kategori insiden (Fatality/LTI)

      if (!isNaN(lat) && !isNaN(lng)) {
        // Tentukan kelas animasi CSS berdasarkan kategori data
        let markerClass = 'radar-marker';
        if (kategori && kategori.toLowerCase() === 'lti') {
          markerClass = 'radar-marker radar-marker-lti';
        }

        // Buat ikon bulat kustom yang berkedip sesuai file index.css
        const customIcon = L.divIcon({
          className: markerClass,
          iconSize: [14, 14]
        });

        // Pasang titik ke dalam peta beserta info pop-up saat diklik
        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>Kategori:</b> ${kategori || 'Insiden'}`);
      }
    });
  }

  // Menghubungkan script ke sistem internal Google Looker Studio
  dscc.subscribeToData(drawViz, { transform: dscc.thirdPartyTransform });
};
