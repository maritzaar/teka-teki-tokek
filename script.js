// ============================================================
// 1. DATA SOAL
// Setiap soal punya "answer" (jawaban) dan "clue" (petunjuk).
// Tinggal tambah/ubah/hapus baris di sini kalau mau ganti soal.
// ============================================================
const WORDS = [
  { answer: "BIRU",       clue: "Warna favoritku, satunya lagi hijau" },
  { answer: "HIJAU",      clue: "Warna favoritku, satunya lagi biru" },
  { answer: "COKLAT",     clue: "Makanan favoritku, selain mie ayam" },
  { answer: "MIEAYAM",    clue: "Makanan favoritku, biasanya dimakan sama pangsit" },
  { answer: "MILO",       clue: "Minuman coklat favoritku" },
  { answer: "UNITED",     clue: "Klub bola Inggris favoritku, sering disingkat MU" },
  { answer: "CUNHA",      clue: "Pemain favoritku di klub bola kesukaanku" },
  { answer: "OASIS",      clue: "Band Inggris favoritku" },
  { answer: "WONDERWALL", clue: "Lagu favoritku dari band Oasis" },
  { answer: "MAZDA",      clue: "Merek mobil favoritku" },
  { answer: "MIATA",      clue: "Tipe mobil impianku dari Mazda" },
  { answer: "JUHOON",     clue: "Nama pacarku" },
  { answer: "BROKOLI",    clue: "Sayuran yang paling aku benci" },
  { answer: "LIBRA",      clue: "Zodiakku" },
];

const SIZE = 10; // ukuran grid maksimal sebelum di-trim ke area yang kepakai

// ============================================================
// 2. GENERATOR GRID
// Tugasnya: nyusun semua kata dari WORDS ke dalam grid 2D,
// saling nyambung lewat huruf yang sama (kayak TTS beneran).
// ============================================================

function buildCrossword(words, size) {
  // grid kosong ukuran size x size, isinya null semua di awal
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = []; // nyimpen kata yang udah berhasil ditaruh + posisinya

  // Cek apakah sebuah kata bisa ditaruh di posisi (row, col) tanpa nabrak
  // ATAU nempel sama kata lain di luar titik silang yang sah.
  // Tanpa pengecekan "nempel" ini, dua kata bisa ketaruh bersebelahan
  // persis (tanpa kotak hitam pemisah) dan kelihatan kayak gabung jadi
  // satu kata yang gak jelas dibacanya.
  function inGrid(r, c) { return r >= 0 && r < size && c >= 0 && c < size; }

  function canPlace(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'down' ? row + i : row;
      const c = dir === 'across' ? col + i : col;
      if (!inGrid(r, c)) return false; // keluar grid

      const existing = grid[r][c];

      if (existing) {
        // ada huruf di sini -> ini cuma boleh jadi titik silang yang valid
        if (existing !== word[i]) return false;
      } else {
        // kotak masih kosong -> pastikan kotak tegak lurus di kiri/kanan
        // (kalau horizontal) atau atas/bawah (kalau vertikal) juga kosong,
        // supaya kata ini gak "nempel" sama kata lain di sampingnya
        if (dir === 'across') {
          if (inGrid(r - 1, c) && grid[r - 1][c]) return false;
          if (inGrid(r + 1, c) && grid[r + 1][c]) return false;
        } else {
          if (inGrid(r, c - 1) && grid[r][c - 1]) return false;
          if (inGrid(r, c + 1) && grid[r][c + 1]) return false;
        }
      }
    }

    // pastikan juga kotak tepat SEBELUM huruf pertama dan SESUDAH huruf
    // terakhir (searah kata) kosong, supaya kata ini gak nyambung diam-diam
    // ke kata lain yang segaris
    const beforeR = dir === 'down' ? row - 1 : row;
    const beforeC = dir === 'across' ? col - 1 : col;
    const afterR = dir === 'down' ? row + word.length : row;
    const afterC = dir === 'across' ? col + word.length : col;
    if (inGrid(beforeR, beforeC) && grid[beforeR][beforeC]) return false;
    if (inGrid(afterR, afterC) && grid[afterR][afterC]) return false;

    return true;
  }

  // Beneran nulis huruf-huruf kata itu ke grid
  function place(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'down' ? row + i : row;
      const c = dir === 'across' ? col + i : col;
      grid[r][c] = word[i];
    }
  }

  // Urutkan kata terpanjang duluan, taruh di tengah sebagai "kata utama"
  let remaining = [...words].sort((a, b) => b.answer.length - a.answer.length);
  const first = remaining.shift();
  const row0 = Math.floor(size / 2) - 1;
  const col0 = Math.max(0, Math.floor((size - first.answer.length) / 2));
  place(first.answer, row0, col0, 'across');
  placed.push({ ...first, row: row0, col: col0, dir: 'across' });

  // Multi-pass: kata yang gagal nyambung di percobaan pertama kadang
  // bisa nyambung belakangan, setelah kata lain (yang bikin huruf baru
  // muncul di grid) berhasil ditaruh duluan. Jadi kita ulang beberapa
  // kali sampai gak ada progres baru lagi.
  let progress = true;
  while (remaining.length && progress) {
    progress = false;
    for (let idx = remaining.length - 1; idx >= 0; idx--) {
      const entry = remaining[idx];
      const word = entry.answer;

      let best = null;
      for (let i = 0; i < word.length; i++) {
        for (const p of placed) {
          for (let j = 0; j < p.answer.length; j++) {
            if (p.answer[j] !== word[i]) continue; // huruf beda, skip
            const dir = p.dir === 'across' ? 'down' : 'across';
            const row = dir === 'down' ? p.row - i : p.row + j;
            const col = dir === 'across' ? p.col - i : p.col + j;
            if (canPlace(word, row, col, dir)) best = { row, col, dir };
          }
        }
      }

      if (best) {
        place(word, best.row, best.col, best.dir);
        placed.push({ ...entry, row: best.row, col: best.col, dir: best.dir });
        remaining.splice(idx, 1);
        progress = true; // ada kemajuan, layak dicoba 1 putaran lagi
      }
    }
  }
  // Kata yang tetap gagal nyambung sampai akhir (biasanya kata langka
  // yang huruf-hurufnya gak ada kesamaan sama kata lain) otomatis dilewati.

  return { grid, placed };
}

let { grid: solution, placed } = buildCrossword(WORDS, SIZE);

// Grid awal ukurannya size x size penuh, padahal kata-katanya
// mungkin cuma makan sebagian kecil area itu. Fungsi ini motong
// grid supaya pas sama area yang beneran kepakai (biar gak banyak kotak kosong).
function trim(solution, placed, size) {
  let minR = size, maxR = 0, minC = size, maxC = 0;
  placed.forEach(p => {
    const len = p.answer.length;
    const endR = p.dir === 'down' ? p.row + len - 1 : p.row;
    const endC = p.dir === 'across' ? p.col + len - 1 : p.col;
    minR = Math.min(minR, p.row); maxR = Math.max(maxR, endR);
    minC = Math.min(minC, p.col); maxC = Math.max(maxC, endC);
  });
  // geser semua koordinat supaya mulai dari 0
  placed.forEach(p => { p.row -= minR; p.col -= minC; });
  const rows = maxR - minR + 1, cols = maxC - minC + 1;
  const newGrid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => solution[r + minR][c + minC])
  );
  return { grid: newGrid, rows, cols };
}

const trimmed = trim(solution, placed, SIZE);
solution = trimmed.grid;
const ROWS = trimmed.rows, COLS = trimmed.cols;

// ============================================================
// 3. PENOMORAN PETUNJUK
// Kotak yang jadi awal sebuah kata (mendatar atau menurun) dikasih nomor,
// urut dari kiri-atas ke kanan-bawah — sama kayak TTS di koran.
// ============================================================
placed.sort((a, b) => (a.row - b.row) || (a.col - b.col));
let num = 1;
const numberMap = {}; // key "row,col" -> nomor
placed.forEach(p => {
  const key = `${p.row},${p.col}`;
  if (!numberMap[key]) numberMap[key] = num++;
  p.number = numberMap[key];
});

// ============================================================
// 4. RENDER GRID KE HTML
// Bikin elemen <div class="cell"> untuk tiap kotak, isi <input>
// kalau kotak itu bagian dari kata, atau kosong (blocked) kalau bukan.
// ============================================================
const gridEl = document.getElementById('grid');
gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
gridEl.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

const cellRefs = {}; // key "row,col" -> elemen <input> di kotak itu

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const div = document.createElement('div');
    const letter = solution[r][c];

    if (!letter) {
      // kotak ini bukan bagian dari kata mana pun -> jadi kotak hitam
      div.className = 'cell blocked';
    } else {
      div.className = 'cell';
      const key = `${r},${c}`;

      // kalau kotak ini titik awal sebuah kata, tampilkan nomornya
      if (numberMap[key]) {
        const numSpan = document.createElement('span');
        numSpan.className = 'num';
        numSpan.textContent = numberMap[key];
        div.appendChild(numSpan);
      }

      const input = document.createElement('input');
      input.maxLength = 1;
      input.dataset.row = r;
      input.dataset.col = c;
      input.addEventListener('input', onType);
      input.addEventListener('keydown', onKeyNav);
      input.addEventListener('focus', () => highlightWord(r, c));
      div.appendChild(input);
      cellRefs[key] = input;
    }
    gridEl.appendChild(div);
  }
}

// ============================================================
// 5. INTERAKSI: ketik huruf, pindah otomatis, navigasi panah
// ============================================================

let currentDir = 'across'; // arah kata yang lagi aktif (across/down)
let activeCells = [];      // daftar kotak yang lagi disorot

function onType(e) {
  // cuma terima huruf, otomatis jadi kapital
  e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const r = +e.target.dataset.row, c = +e.target.dataset.col;
  e.target.parentElement.classList.remove('correct', 'wrong');

  // begitu ada huruf diketik, pindah fokus ke kotak berikutnya di arah yang sama
  if (e.target.value) {
    const next = currentDir === 'across'
      ? cellRefs[`${r},${c+1}`]
      : cellRefs[`${r+1},${c}`];
    if (next) next.focus();
  }
  updateProgress();
}

function onKeyNav(e) {
  const r = +e.target.dataset.row, c = +e.target.dataset.col;
  const dirs = {
    ArrowRight: [0, 1], ArrowLeft: [0, -1],
    ArrowDown: [1, 0], ArrowUp: [-1, 0],
  };
  if (dirs[e.key]) {
    e.preventDefault();
    const [dr, dc] = dirs[e.key];
    const next = cellRefs[`${r+dr},${c+dc}`];
    if (next) next.focus();
  } else if (e.key === 'Backspace' && !e.target.value) {
    // kalau kotak udah kosong dan masih ditekan Backspace, mundur ke kotak sebelumnya
    const prev = currentDir === 'across'
      ? cellRefs[`${r},${c-1}`]
      : cellRefs[`${r-1},${c}`];
    if (prev) prev.focus();
  }
}

// Waktu sebuah kotak difokus, cari tau kata mana yang lagi "aktif"
// dan sorot nomor petunjuknya di daftar samping.
function highlightWord(r, c) {
  document.querySelectorAll('.clue-list li').forEach(li => li.classList.remove('active'));

  // cari semua kata yang lewat kotak (r, c) ini
  const words = placed.filter(p => {
    for (let i = 0; i < p.answer.length; i++) {
      const rr = p.dir === 'down' ? p.row + i : p.row;
      const cc = p.dir === 'across' ? p.col + i : p.col;
      if (rr === r && cc === c) return true;
    }
    return false;
  });

  if (!words.length) return;

  // kalau ada 2 kata (persimpangan), pilih yang searah sama currentDir
  const w = words.find(w => w.dir === currentDir) || words[0];
  currentDir = w.dir;

  activeCells = [];
  for (let i = 0; i < w.answer.length; i++) {
    const rr = w.dir === 'down' ? w.row + i : w.row;
    const cc = w.dir === 'across' ? w.col + i : w.col;
    activeCells.push(`${rr},${cc}`);
  }

  const li = document.getElementById(`clue-${w.dir}-${w.number}`);
  if (li) li.classList.add('active');
}

// ============================================================
// 6. RENDER DAFTAR PETUNJUK (Mendatar / Menurun)
// ============================================================
const acrossList = document.getElementById('acrossList');
const downList = document.getElementById('downList');

placed.slice().sort((a, b) => a.number - b.number).forEach(p => {
  const li = document.createElement('li');
  li.id = `clue-${p.dir}-${p.number}`;
  li.innerHTML = `<b>${p.number}.</b> ${p.clue}`;
  li.addEventListener('click', () => {
    currentDir = p.dir;
    const target = cellRefs[`${p.row},${p.col}`];
    if (target) target.focus();
  });
  (p.dir === 'across' ? acrossList : downList).appendChild(li);
});

// ============================================================
// 7. SISTEM SKOR
// Mulai dari 100. Tiap kali tombol "Buka 1 Huruf" dipakai,
// skor dikurangi 5 (minimal 0). Skor akhir ditampilkan begitu
// semua jawaban benar.
// ============================================================
const HINT_PENALTY = 5;
let score = 100;

function updateScoreDisplay() {
  document.getElementById('scoreDisplay').textContent = `Skor: ${score}`;
}

// ============================================================
// 8. TOMBOL KONTROL: Periksa Jawaban, Hint, Reset
// ============================================================

function updateProgress() {
  const total = Object.keys(cellRefs).length;
  const filled = Object.values(cellRefs).filter(i => i.value).length;
  document.getElementById('progress').textContent = `${filled} / ${total} kotak terisi`;
}

document.getElementById('checkBtn').addEventListener('click', () => {
  let allCorrect = true;
  let anyFilled = false;

  Object.entries(cellRefs).forEach(([key, input]) => {
    const [r, c] = key.split(',').map(Number);
    const correct = solution[r][c];
    input.parentElement.classList.remove('correct', 'wrong');

    if (input.value) {
      anyFilled = true;
      if (input.value === correct) {
        input.parentElement.classList.add('correct');
      } else {
        input.parentElement.classList.add('wrong');
        allCorrect = false;
      }
    } else {
      allCorrect = false;
    }
  });

  const status = document.getElementById('status');
  status.classList.remove('win');
  if (!anyFilled) {
    status.textContent = 'Isi dulu beberapa kotak sebelum diperiksa.';
  } else if (allCorrect) {
    status.textContent = `Semua jawaban benar! Skor akhir kamu: ${score} 🎉`;
    status.classList.add('win');
  } else {
    status.textContent = 'Masih ada yang salah atau kosong — kotak hijau sudah benar.';
  }
});

document.getElementById('hintBtn').addEventListener('click', () => {
  // ambil semua kotak yang masih kosong, pilih satu secara acak, isi jawabannya
  const empties = Object.entries(cellRefs).filter(([, input]) => !input.value);
  if (!empties.length) return;
  const [key, input] = empties[Math.floor(Math.random() * empties.length)];
  const [r, c] = key.split(',').map(Number);
  input.value = solution[r][c];
  input.parentElement.classList.add('correct');

  // tiap pakai hint, skor berkurang (minimal 0)
  score = Math.max(0, score - HINT_PENALTY);
  updateScoreDisplay();

  updateProgress();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  Object.values(cellRefs).forEach(input => {
    input.value = '';
    input.parentElement.classList.remove('correct', 'wrong');
  });
  document.getElementById('status').textContent = '';
  document.getElementById('status').classList.remove('win');

  // reset skor balik ke 100
  score = 100;
  updateScoreDisplay();

  updateProgress();
});

updateScoreDisplay(); // tampilan awal: Skor 100

updateProgress(); // tampilan awal: 0 / total