export interface PhotoViewerOptions {
  title: string;
  tahap: string;
  tanggal: string;
  nilai?: string;
  keterangan?: string;
  penginput?: string;
  status?: string;
  photos: string[];
}

export function openPhotoViewer(options: PhotoViewerOptions) {
  if (typeof window === "undefined") return;

  const validPhotos =
    options.photos && options.photos.length > 0
      ? options.photos
      : [
          "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
        ];

  const photosJson = JSON.stringify(validPhotos);
  const titleSafe = options.title.replace(/"/g, "&quot;");
  const tahapSafe = options.tahap.replace(/"/g, "&quot;");
  const tanggalSafe = options.tanggal.replace(/"/g, "&quot;");
  const nilaiSafe = (options.nilai || "-").replace(/"/g, "&quot;");
  const keteranganSafe = (options.keterangan || "-").replace(/"/g, "&quot;");
  const penginputSafe = (options.penginput || "Operator").replace(/"/g, "&quot;");
  const statusSafe = (options.status || "Sedang Dikerjakan").replace(/"/g, "&quot;");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dokumentasi Foto Lapangan - ${tahapSafe} | SIMP Kuningan</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B192C;
      color: #E2E8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #112238;
      border-bottom: 1px solid #1E3A5F;
      padding: 1rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .badge-dinas {
      background: #1E4E8C;
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 0.375rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .header-title h1 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #FFFFFF;
    }
    .header-title p {
      font-size: 0.8rem;
      color: #94A3B8;
      margin-top: 0.15rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease-in-out;
      text-decoration: none;
    }
    .btn-primary {
      background: #1E4E8C;
      color: white;
    }
    .btn-primary:hover {
      background: #143965;
    }
    .btn-secondary {
      background: #1E293B;
      color: #CBD5E1;
      border-color: #334155;
    }
    .btn-secondary:hover {
      background: #334155;
      color: white;
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      gap: 1.25rem;
    }
    .viewer-card {
      width: 100%;
      background: #112238;
      border: 1px solid #1E3A5F;
      border-radius: 1rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .photo-display {
      position: relative;
      width: 100%;
      min-height: 380px;
      max-height: 580px;
      background: #07101B;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .photo-display img {
      max-width: 100%;
      max-height: 580px;
      object-fit: contain;
      transition: transform 0.2s ease-in-out;
    }
    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(15, 23, 42, 0.75);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.25rem;
      transition: background 0.15s;
      z-index: 10;
    }
    .nav-arrow:hover {
      background: rgba(30, 78, 140, 0.95);
    }
    .nav-prev { left: 1rem; }
    .nav-next { right: 1rem; }
    .photo-counter {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(15, 23, 42, 0.85);
      color: white;
      padding: 0.35rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.15);
      z-index: 10;
    }
    .thumbnails-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #0B192C;
      border-top: 1px solid #1E3A5F;
    }
    .thumb {
      width: 64px;
      height: 64px;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.15s ease-in-out;
    }
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumb:hover {
      opacity: 0.9;
    }
    .thumb.active {
      border-color: #38BDF8;
      opacity: 1;
      transform: scale(1.05);
    }
    .meta-card {
      width: 100%;
      background: #112238;
      border: 1px solid #1E3A5F;
      border-radius: 1rem;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .meta-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748B;
    }
    .meta-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #F1F5F9;
    }
    .meta-value.accent {
      color: #38BDF8;
    }
    footer {
      text-align: center;
      padding: 1.25rem;
      color: #64748B;
      font-size: 0.75rem;
      border-top: 1px solid #1E3A5F;
    }
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      header, .header-actions, .nav-arrow, .thumbnails-bar, footer {
        display: none !important;
      }
      .viewer-card, .meta-card {
        border: 1px solid #ccc !important;
        box-shadow: none !important;
        background: white !important;
      }
      .meta-label { color: #555 !important; }
      .meta-value { color: #000 !important; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-info">
      <span class="badge-dinas">Dinas PUTR Kab. Kuningan</span>
      <div class="header-title">
        <h1>Dokumentasi Lapangan: ${tahapSafe}</h1>
        <p>${titleSafe} &bull; ${tanggalSafe}</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="downloadCurrentPhoto()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Unduh Foto
      </button>
      <button class="btn btn-secondary" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Cetak
      </button>
      <button class="btn btn-primary" onclick="window.close()">
        Tutup Halaman
      </button>
    </div>
  </header>

  <main>
    <div class="viewer-card">
      <div class="photo-display">
        <img id="main-image" src="" alt="Dokumentasi Lapangan">
        <button id="prev-btn" class="nav-arrow nav-prev" onclick="prevPhoto()" style="display: none;">&#10094;</button>
        <button id="next-btn" class="nav-arrow nav-next" onclick="nextPhoto()" style="display: none;">&#10095;</button>
        <div id="counter" class="photo-counter">Foto 1 dari 1</div>
      </div>
      <div id="thumbs-container" class="thumbnails-bar" style="display: none;"></div>
    </div>

    <div class="meta-card">
      <div class="meta-item">
        <span class="meta-label">Nama Kegiatan</span>
        <span class="meta-value">${titleSafe}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Tahap Pekerjaan</span>
        <span class="meta-value accent">${tahapSafe}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Nilai Realisasi</span>
        <span class="meta-value">${nilaiSafe}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Tanggal Lapangan</span>
        <span class="meta-value">${tanggalSafe}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Petugas Penginput</span>
        <span class="meta-value">${penginputSafe}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status Terkini</span>
        <span class="meta-value">${statusSafe}</span>
      </div>
      <div class="meta-item" style="grid-column: 1 / -1;">
        <span class="meta-label">Keterangan / Catatan Pengawasan</span>
        <span class="meta-value" style="font-weight: 400; line-height: 1.4;">${keteranganSafe}</span>
      </div>
    </div>
  </main>

  <footer>
    Sistem Informasi Monitoring dan Pelaporan (SIMP) &copy; 2026 Dinas Pekerjaan Umum dan Tata Ruang Kabupaten Kuningan.
  </footer>

  <script>
    const photos = ${photosJson};
    let currentIndex = 0;

    const mainImg = document.getElementById('main-image');
    const counter = document.getElementById('counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const thumbsContainer = document.getElementById('thumbs-container');

    function render() {
      if (!photos || photos.length === 0) return;
      mainImg.src = photos[currentIndex];
      counter.textContent = 'Foto ' + (currentIndex + 1) + ' dari ' + photos.length;

      if (photos.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        thumbsContainer.style.display = 'flex';

        // Update active thumb
        document.querySelectorAll('.thumb').forEach((el, idx) => {
          if (idx === currentIndex) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }
    }

    function prevPhoto() {
      if (photos.length <= 1) return;
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      render();
    }

    function nextPhoto() {
      if (photos.length <= 1) return;
      currentIndex = (currentIndex + 1) % photos.length;
      render();
    }

    function setPhoto(idx) {
      currentIndex = idx;
      render();
    }

    function downloadCurrentPhoto() {
      const src = photos[currentIndex];
      const a = document.createElement('a');
      a.href = src;
      a.download = 'Dokumentasi-Foto-' + (currentIndex + 1) + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Build thumbs if multiple
    if (photos.length > 1) {
      photos.forEach((src, idx) => {
        const div = document.createElement('div');
        div.className = 'thumb' + (idx === 0 ? ' active' : '');
        div.onclick = () => setPhoto(idx);
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Thumbnail ' + (idx + 1);
        div.appendChild(img);
        thumbsContainer.appendChild(div);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') window.close();
    });

    render();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}
