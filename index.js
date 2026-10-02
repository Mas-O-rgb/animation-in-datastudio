// 1. Memuat library peta Leaflet.js secara dinamis dengan alamat CDN yang valid
const cssLink = document.createElement('link');
cssLink.rel = 'stylesheet';
cssLink.href = 'https://unpkg.com';
document.head.appendChild(cssLink);

const scriptLink = document.createElement('script');
scriptLink.src = 'https://unpkg.com';
document.head.appendChild(scriptLink);

// Tambahkan juga script bantuan Dscc untuk menjembatani data dari Google Looker Studio
const dsccScript = document.createElement('script');
dsccScript.src = 'https://unpkg.com';
document.head.appendChild(dsccScript);

scriptLink.onload = () => {
  // Buat elemen penampung peta di kanvas
  const mapDiv = document.createElement('div');
  mapDiv.id = 'map';
  mapDiv.style.width = '100%';
  mapDiv.style.height = '100%';
  document.body.appendChild(mapDiv);

  // Inisialisasi peta awal fokus ke Indonesia
  const map = L.map('map').setView([-2.5489, 118.0149], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // FUNGSI UTAMA MEMBACA DATA
  function drawViz(data) {
    // Hapus marker lama sebelum merender data baru
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Mengambil data dari tabel bawaan Looker Studio
    const rows = data.tables.DEFAULT;
    
    rows.forEach((row) => {
      // Struktur ekstraksi data yang benar berdasarkan pemetaan variabel di panel kanan
      const lat = parseFloat(row.latDim[0]);
      const lng = parseFloat(row.lngDim[0]);
      const kategori = row.kategoriDim ? row.kategoriDim[0] : '';

      if (!isNaN(lat) && !isNaN(lng)) {
        let markerClass = 'radar-marker';
        if (kategori && kategori.toLowerCase() === 'lti') {
          markerClass = 'radar-marker radar-marker-lti';
        }

        const customIcon = L.divIcon({
          className: markerClass,
          iconSize: [14, 14]
        });

        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>Kategori:</b> ${kategori || 'Insiden'}`);
      }
    });
  }

  // Menghubungkan visualisasi ke sistem subscribe data Google
  window.dscc.subscribeToData(drawViz, { transform: window.dscc.thirdPartyTransform });
};
