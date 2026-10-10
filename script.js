'use strict';

const CITIES = ['Vijayawada', 'Chennai', 'Hyderabad', 'Visakhapatnam'];
const CARGOS = ['Coal', 'Cement', 'Food Grains', 'Fertilizer', 'Steel', 'Containers'];
const STATUSES = ['Waiting', 'In Yard', 'In Transit', 'Ready for Departure'];
const PRIORITIES = ['High', 'Medium', 'Normal'];
const CITY_COLORS = ['#35d6c3', '#7ab6ff', '#ffb547', '#e78aa1'];
const ZONES = [
  { city: 'Vijayawada', tracks: ['A1', 'A2', 'A3'] },
  { city: 'Chennai', tracks: ['B1', 'B2', 'B3'] },
  { city: 'Hyderabad', tracks: ['C1', 'C2', 'C3'] },
  { city: 'Visakhapatnam', tracks: ['D1', 'D2', 'D3'] }
];
const TRACK_SEEDS = [
  ['A1', 14], ['A2', 15], ['A3', 15], ['B1', 15], ['B2', 15], ['B3', 15],
  ['C1', 15], ['C2', 15], ['C3', 15], ['D1', 15], ['D2', 14], ['D3', 15]
];
const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  wagon: '<path d="M3 7h16a2 2 0 0 1 2 2v8H3zM6 17v2m12-2v2M5 11h14M7 7l1-3h6l1 3"/><circle cx="7" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
  tracks: '<path d="M5 3v18M19 3v18M3 7h18M3 12h18M3 17h18"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a4 4 0 0 0 4-4V10a4 4 0 0 1 4-4"/>',
  chart: '<path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-7"/><path d="M17 6h3v3"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.8-2L20 12M4 12l2.7 5a7 7 0 0 0 11.8-2"/>',
  play: '<path d="m8 5 12 7-12 7z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  edit: '<path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  trash: '<path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 19v2h16v-2"/>',
  train: '<path d="M6 19 4 21m14-2 2 2M5 17V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v10M5 13h14M8 8h8M8 17l2 2m6-2-2 2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  bolt: '<path d="m13 2-3 8h7l-6 12 2-9H6l7-11Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'
};
const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.grid}</svg>`;
const makeSeed = () => {
  const tracks = TRACK_SEEDS.map(([id, capacity]) => ({
    id, capacity, destination: ZONES.find(zone => zone.tracks.includes(id)).city,
    reserved: false
  }));
  const wagons = [];
  let sequence = 1001;
  const arrivalBase = new Date();
  for (let cityIndex = 0; cityIndex < CITIES.length; cityIndex += 1) {
    const zone = ZONES[cityIndex];
    for (let n = 0; n < 30; n += 1) {
      const track = zone.tracks[n % 3];
      wagons.push(makeSeedWagon(sequence++, cityIndex, track, arrivalBase));
    }
    const previousZone = ZONES[(cityIndex + CITIES.length - 1) % CITIES.length];
    wagons.push(makeSeedWagon(sequence++, cityIndex, previousZone.tracks[0], arrivalBase));
    wagons.push(makeSeedWagon(sequence++, cityIndex, previousZone.tracks[1], arrivalBase));
  }
  wagons.forEach((wagon, index) => {
    wagon.status = index < 23 ? 'Waiting' : index < 105 ? 'In Yard' : 'Ready for Departure';
    wagon.priority = index % 17 === 0 ? 'High' : index % 5 === 0 ? 'Medium' : 'Normal';
    wagon.turnaroundMinutes = 260 + ((index % 8) - 3.5) * 8;
  });
  const activities = [
    activity('Shunting plan calculated', 'optimization', 'Initial plan contains 8 necessary wagon relocations.', 1),
    activity('Coal wagon group assigned to Destination Vijayawada', 'assignment', 'A1 · 10 wagons grouped by destination.', 9),
    activity('Track B2 assignment generated', 'assignment', 'Capacity check passed · 11 / 15 positions occupied.', 18),
    activity('Wagon WGN-1004 registered', 'wagon-added', 'Seeded simulation record.', 30),
    activity('Turnaround estimate updated', 'analytics', 'Mean sample estimate: 4h 20m.', 45)
  ];
  return { wagons, tracks, plan: null, marshallingPlan: null, activities, analyticsRange: 'all' };
};
function makeSeedWagon(number, cityIndex, track, base) {
  const index = number - 1001;
  const arrival = new Date(base.getTime() - ((index % 7) * 24 + (index % 13)) * 3600000);
  return {
    id: `WGN-${number}`, cargo: CARGOS[(index * 5 + cityIndex) % CARGOS.length],
    destination: CITIES[cityIndex], currentTrack: track, arrival: arrival.toISOString(),
    priority: 'Normal', status: 'In Yard', turnaroundMinutes: 260
  };
}
function activity(title, type, detail = '', minutesAgo = 0) {
  return { id: `ACT-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, title, type, detail, timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString() };
}
const clone = value => JSON.parse(JSON.stringify(value));
const seedState = makeSeed();
let state = clone(seedState);
let settings = loadSettings();
let planPaused = false;
let activePage = 'overview';
let activitySearch = '';
let activityType = 'all';
let wagonSort = 'arrival-asc';
let wagonFilters = { search: '', cargo: 'all', destination: 'all', status: 'all' };
let trackFilters = { status: 'all', destination: 'all' };
let modalReturnFocus = null;
const pageHeading = document.getElementById('pageHeading');
const pageContent = document.getElementById('pageContent');
const modalLayer = document.getElementById('modalLayer');
const toastRegion = document.getElementById('toastRegion');

function loadSettings() {
  const defaults = { yardName: 'MTX Demo Freight Yard', movementMinutes: 12, defaultCapacity: 15, accent: '#35d6c3', sound: false };
  try {
    const saved = JSON.parse(localStorage.getItem('railflow-settings') || '{}');
    return { ...defaults, ...saved };
  } catch (_) { return defaults; }
}
function saveSettings() {
  try { localStorage.setItem('railflow-settings', JSON.stringify(settings)); }
  catch (_) { toast('Preferences apply for this session only; browser storage is unavailable.', 'warning'); }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function destinationColor(city) { return CITY_COLORS[Math.max(0, CITIES.indexOf(city))]; }
function trackById(id) { return state.tracks.find(track => track.id === id); }
function wagonsOnTrack(id) { return state.wagons.filter(wagon => wagon.currentTrack === id && wagon.status !== 'In Transit'); }
function trackOccupancy(track) { return wagonsOnTrack(track.id).length; }
function totalCapacity() { return state.tracks.reduce((sum, track) => sum + track.capacity, 0); }
function utilization() { return totalCapacity() ? Math.round(state.wagons.filter(w => w.currentTrack && w.status !== 'In Transit').length / totalCapacity() * 100) : 0; }
function statusClass(value) { return `status-${String(value).toLowerCase().replace(/[^a-z]+/g, '-')}`; }
function formatTime(date) { return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date)); }
function formatDate(date) { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)); }
function formatDuration(minutes) {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return hours ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins} min`;
}
function avgTurnaround() {
  if (!state.wagons.length) return 0;
  return Math.round(state.wagons.reduce((sum, wagon) => sum + wagon.turnaroundMinutes, 0) / state.wagons.length);
}
function destinationTrackIds(destination) { return ZONES.find(zone => zone.city === destination)?.tracks || []; }
function trackState(track) {
  const occupied = trackOccupancy(track);
  if (track.reserved) return 'Reserved';
  if (occupied >= track.capacity) return 'Full';
  if (!occupied) return 'Available';
  return 'Partially Occupied';
}
function preferredTarget(destination, occupancy = null) {
  const candidateTracks = destinationTrackIds(destination).map(trackById).filter(Boolean);
  const counts = occupancy || Object.fromEntries(state.tracks.map(track => [track.id, trackOccupancy(track)]));
  return candidateTracks.filter(track => !track.reserved && counts[track.id] < track.capacity)
    .sort((a, b) => counts[a.id] / a.capacity - counts[b.id] / b.capacity || counts[a.id] - counts[b.id])[0] || null;
}
function buildOptimization() {
  const counts = Object.fromEntries(state.tracks.map(track => [track.id, trackOccupancy(track)]));
  const misplaced = state.wagons.filter(wagon => wagon.currentTrack && wagon.status !== 'In Transit' && !destinationTrackIds(wagon.destination).includes(wagon.currentTrack));
  misplaced.sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.id.localeCompare(b.id));
  const moves = [];
  const blocked = [];
  for (const wagon of misplaced) {
    const target = preferredTarget(wagon.destination, counts);
    if (!target) {
      blocked.push({ wagonId: wagon.id, origin: wagon.currentTrack, destination: wagon.destination, reason: `No unreserved destination track has spare capacity for ${wagon.destination}.` });
      continue;
    }
    counts[wagon.currentTrack] -= 1;
    counts[target.id] += 1;
    moves.push({
      id: `MOVE-${moves.length + 1}`, wagonIds: [wagon.id], from: wagon.currentTrack, to: target.id,
      destination: wagon.destination, reason: `Rejoin the ${wagon.destination} destination group; ${trackById(wagon.currentTrack).destination} track is a different destination zone.`,
      duration: Number(settings.movementMinutes), status: 'Planned'
    });
  }
  const beforeMinutes = misplaced.length * Number(settings.movementMinutes);
  const afterMinutes = moves.length * Number(settings.movementMinutes);
  return { steps: moves, blocked, mismatchCount: misplaced.length, baselineMinutes: beforeMinutes, optimizedMinutes: afterMinutes, completed: 0, createdAt: new Date().toISOString() };
}
function addActivity(title, type, detail = '') {
  state.activities.unshift(activity(title, type, detail));
  state.activities = state.activities.slice(0, 250);
}
function toast(message, kind = 'success', detail = '') {
  const node = document.createElement('div');
  node.className = `toast ${kind === 'success' ? '' : kind}`;
  node.innerHTML = `<span class="toast-mark">${kind === 'success' ? '✓' : kind === 'warning' ? '!' : '×'}</span><div class="toast-copy">${escapeHTML(message)}${detail ? `<small>${escapeHTML(detail)}</small>` : ''}</div><button class="toast-close" type="button" aria-label="Dismiss notification">×</button>`;
  node.querySelector('.toast-close').addEventListener('click', () => node.remove());
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 5200);
}
function playNotification() {
  if (!settings.sound) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(.04, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + .12);
    oscillator.onended = () => audio.close();
  } catch (_) { /* Audio is an optional browser preference. */ }
}
function setPage(page, updateHistory = true) {
  if (!['overview', 'wagons', 'tracks', 'marshalling', 'optimizer', 'analytics', 'activity', 'settings'].includes(page)) return;
  activePage = page;
  document.querySelectorAll('.nav-item').forEach(button => {
    const active = button.dataset.page === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobileMenu').setAttribute('aria-expanded', 'false');
  if (updateHistory) history.replaceState(null, '', `#${page}`);
  renderPage();
  document.getElementById('mainContent').focus({ preventScroll: true });
}
const pageMeta = {
  overview: ['Overview', 'Smarter Shunting. Faster Turnaround. Better Yard Utilization.'],
  wagons: ['Wagon Registry', 'Search, inspect, and manage simulated freight wagon records.'],
  tracks: ['Yard Tracks', 'Capacity, occupancy, and destination-group assignments across the yard.'],
  marshalling: ['Marshalling Planner', 'Build a capacity-checked destination grouping proposal.'],
  optimizer: ['Shunting Optimizer', 'A transparent heuristic for reducing unnecessary wagon relocations.'],
  analytics: ['Turnaround Analytics', 'Calculated estimates from this local simulation dataset.'],
  activity: ['Activity Log', 'Timestamped actions recorded by the current simulation.'],
  settings: ['Settings', 'Configure the local demo yard and simulation assumptions.']
};
function renderPage() {
  const [title, subtitle] = pageMeta[activePage];
  pageHeading.innerHTML = `<div class="heading-copy"><div class="breadcrumb">WORKSPACE <span>/</span> ${escapeHTML(title.toUpperCase())}</div><h1 class="page-title">${escapeHTML(title)}</h1><p class="page-subtitle">${escapeHTML(subtitle)}</p></div>${headingActionMarkup()}`;
  const renderers = { overview: renderOverview, wagons: renderWagons, tracks: renderTracks, marshalling: renderMarshalling, optimizer: renderOptimizer, analytics: renderAnalytics, activity: renderActivity, settings: renderSettings };
  pageContent.innerHTML = renderers[activePage]();
  if (activePage === 'settings') {
    const capacityHelp = pageContent.querySelector('#defaultCapacity')?.closest('.settings-field')?.querySelector('small');
    if (capacityHelp) capacityHelp.textContent = 'Applied to every track; existing occupied positions are never discarded.';
  }
  document.getElementById('sidebarYardName').textContent = settings.yardName;
  document.getElementById('sidebarSnapshot').textContent = `${state.tracks.length} tracks · ${state.wagons.length} wagons`;
  document.getElementById('notificationSummary').textContent = `${state.wagons.filter(wagon => wagon.status === 'Waiting').length} wagons awaiting movement across yard`;
  if (activePage === 'analytics') requestAnimationFrame(drawCharts);
}
function headingActionMarkup() {
  if (activePage === 'overview') return `<div class="heading-actions"><span class="tag">YARD / ${escapeHTML(settings.yardName.toUpperCase())}</span></div>`;
  if (activePage === 'wagons') return `<div class="heading-actions"><button class="btn btn-primary" data-action="add-wagon">${icon('plus')} Add Wagon</button></div>`;
  if (activePage === 'optimizer') return `<div class="heading-actions"><span class="tag">HEURISTIC · SIMULATED</span></div>`;
  if (activePage === 'tracks') return `<div class="heading-actions"><button class="btn" data-action="refresh-tracks">${icon('refresh')} Refresh Yard View</button></div>`;
  return '';
}
function renderOverview() {
  const awaiting = state.wagons.filter(w => w.status === 'Waiting').length;
  const ready = state.wagons.filter(w => w.status === 'Ready for Departure').length;
  const planCount = state.plan ? state.plan.steps.filter(step => step.status !== 'Completed').length : 0;
  const metrics = [
    ['Total Registered Wagons', state.wagons.length, 'wagon', 'Across all simulated destinations'],
    ['Available Yard Tracks', state.tracks.filter(t => trackState(t) !== 'Full' && trackState(t) !== 'Reserved').length, 'tracks', `${state.tracks.length} total track sections`],
    ['Wagons Awaiting Movement', awaiting, 'clock', 'Status: Waiting'],
    ['Planned Shunting Movements', planCount, 'route', state.plan ? 'Current proposed sequence' : 'Run optimizer to calculate'],
    ['Average Turnaround', formatDuration(avgTurnaround()), 'chart', 'Calculated mean · sample estimate'],
    ['Yard Track Utilization', `${utilization()}%`, 'grid', `${state.wagons.length} occupied / ${totalCapacity()} capacity`]
  ];
  return `<section class="metric-grid">${metrics.map(([label, value, glyph, foot]) => `<article class="metric-card"><div class="metric-top"><span>${escapeHTML(label)}</span><span class="metric-icon">${icon(glyph)}</span></div><div class="metric-value">${escapeHTML(value)}</div><div class="metric-foot">${escapeHTML(foot)}</div></article>`).join('')}</section>
    <div class="overview-grid"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('tracks')}</span><div><h2>Yard schematic</h2><p>Track occupancy and destination groups · simulated</p></div></div><span class="tag">12 TRACKS</span></div><div class="yard-map"><div class="map-legend">${CITIES.map((city, index) => `<span class="legend-item"><i class="legend-swatch" style="background:${CITY_COLORS[index]}"></i>${escapeHTML(city)}</span>`).join('')}</div><div class="track-map-list">${state.tracks.map((track, index) => renderMapTrack(track, index)).join('')}</div><div class="quick-actions"><button class="btn btn-sm" data-action="add-wagon">${icon('plus')} Add Wagon</button><button class="btn btn-sm" data-action="go-tracks">${icon('tracks')} View Yard Tracks</button><button class="btn btn-sm" data-action="go-marshalling">${icon('layers')} Generate Marshalling Plan</button><button class="btn btn-sm btn-primary" data-action="go-optimizer">${icon('bolt')} Run Shunting Optimization</button></div></div></section>
      <div class="overview-side"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('activity')}</span><div><h2>Live simulation activity</h2><p>Most recent recorded events</p></div></div><button class="btn btn-quiet btn-sm" data-action="go-activity">View all</button></div><div class="panel-body activity-mini-list">${state.activities.slice(0, 4).map(item => `<div class="activity-mini"><i class="activity-marker"></i><div><p>${escapeHTML(item.title)}</p><time>${formatTime(item.timestamp)} · ${escapeHTML(item.detail || item.type)}</time></div></div>`).join('')}</div></section>
      <section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('pin')}</span><div><h2>Destination summary</h2><p>Registered wagons by city</p></div></div></div><div class="panel-body destination-list">${CITIES.map((city, index) => { const count = state.wagons.filter(w => w.destination === city).length; return `<div class="destination-row"><span>${escapeHTML(city)}</span><b>${count}</b><div class="destination-track"><i style="width:${state.wagons.length ? count / state.wagons.length * 100 : 0}%;--bar-color:${CITY_COLORS[index]}"></i></div></div>`; }).join('')}</div></section>
      <section class="panel quick-panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('bolt')}</span><div><h2>Operating note</h2><p>Prototype scope</p></div></div></div><div class="panel-body"><div class="inline-note">This yard view is an educational simulation. Proposed movements are advisory examples only; no real railway system is connected.</div><div class="control-row" style="margin-top:11px"><span class="tag">${ready} READY TO DEPART</span><span class="tag">${state.tracks.length} TRACKS</span></div></div></section></div></div>`;
}
function renderMapTrack(track, index) {
  const wagons = wagonsOnTrack(track.id);
  const displayed = wagons.slice(0, 6);
  const locomotive = index === 0 ? `<span class="map-loco">${icon('train')}</span>` : '';
  return `<div class="map-track"><span class="map-track-label">${escapeHTML(track.id)}</span><div class="rail-line" aria-label="${escapeHTML(track.id)}, ${wagons.length} wagons">${displayed.map(wagon => `<span class="wagon-block" title="${escapeHTML(wagon.id)} · ${escapeHTML(wagon.destination)}" style="background:${destinationColor(wagon.destination)}">${escapeHTML(wagon.id.slice(-4))}</span>`).join('')}${wagons.length > displayed.length ? `<span class="map-overflow">+${wagons.length - displayed.length}</span>` : ''}${locomotive}</div><span class="map-track-meta"><b>${wagons.length}</b> / ${track.capacity}</span></div>`;
}
function renderWagons() {
  const rows = filteredWagons();
  return `<section class="panel table-panel"><div class="table-tools"><div class="search-wrap">${icon('search')}<input class="input" id="wagonSearch" type="search" placeholder="Search wagon ID or destination" value="${escapeHTML(wagonFilters.search)}" aria-label="Search wagon ID or destination"></div><select class="select" id="cargoFilter" aria-label="Filter by cargo"><option value="all">All cargo types</option>${CARGOS.map(v => `<option ${wagonFilters.cargo === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}</select><select class="select" id="destinationFilter" aria-label="Filter by destination"><option value="all">All destinations</option>${CITIES.map(v => `<option ${wagonFilters.destination === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}</select><select class="select" id="statusFilter" aria-label="Filter by status"><option value="all">All statuses</option>${STATUSES.map(v => `<option ${wagonFilters.status === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}</select><select class="select" id="sortWagons" aria-label="Sort wagon records"><option value="arrival-asc" ${wagonSort === 'arrival-asc' ? 'selected' : ''}>Arrival: earliest</option><option value="arrival-desc" ${wagonSort === 'arrival-desc' ? 'selected' : ''}>Arrival: latest</option><option value="priority" ${wagonSort === 'priority' ? 'selected' : ''}>Priority: high first</option></select><button class="btn btn-primary" data-action="add-wagon">${icon('plus')} Add Wagon</button></div>
    <div class="table-scroll"><table><thead><tr><th>Wagon ID</th><th>Cargo Type</th><th>Destination</th><th>Current Track</th><th>Arrival Time</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.length ? rows.map(renderWagonRow).join('') : `<tr><td colspan="8"><div class="empty-state"><strong>No wagons match these filters</strong>Change the search or filter selections.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Showing ${rows.length} of ${state.wagons.length} wagons</span><span>LOCAL SIMULATION DATA</span></div></section>`;
}
function filteredWagons() {
  return state.wagons.filter(wagon => {
    const term = wagonFilters.search.trim().toLowerCase();
    return (!term || wagon.id.toLowerCase().includes(term) || wagon.destination.toLowerCase().includes(term)) &&
      (wagonFilters.cargo === 'all' || wagon.cargo === wagonFilters.cargo) &&
      (wagonFilters.destination === 'all' || wagon.destination === wagonFilters.destination) &&
      (wagonFilters.status === 'all' || wagon.status === wagonFilters.status);
  }).sort((a, b) => wagonSort === 'priority' ? PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.id.localeCompare(b.id) : wagonSort === 'arrival-desc' ? new Date(b.arrival) - new Date(a.arrival) : new Date(a.arrival) - new Date(b.arrival));
}
function renderWagonRow(wagon) {
  return `<tr><td><button class="table-icon-btn wagon-id" data-action="wagon-details" data-id="${escapeHTML(wagon.id)}" aria-label="View ${escapeHTML(wagon.id)} details">${escapeHTML(wagon.id)}</button></td><td>${escapeHTML(wagon.cargo)}</td><td>${escapeHTML(wagon.destination)}</td><td>${escapeHTML(wagon.currentTrack || 'In transit')}</td><td>${formatDate(wagon.arrival)}</td><td><span class="priority-${wagon.priority.toLowerCase()}">${escapeHTML(wagon.priority)}</span></td><td><span class="status-pill ${statusClass(wagon.status)}">${escapeHTML(wagon.status)}</span></td><td><div class="table-actions"><button class="table-icon-btn" data-action="edit-wagon" data-id="${escapeHTML(wagon.id)}" aria-label="Edit ${escapeHTML(wagon.id)}">${icon('edit')}</button><button class="table-icon-btn" data-action="delete-wagon" data-id="${escapeHTML(wagon.id)}" aria-label="Delete ${escapeHTML(wagon.id)}">${icon('trash')}</button></div></td></tr>`;
}
function renderTracks() {
  const tracks = state.tracks.filter(track => (trackFilters.status === 'all' || trackState(track) === trackFilters.status) && (trackFilters.destination === 'all' || track.destination === trackFilters.destination));
  return `<div class="track-filters"><div class="field"><label for="trackStatusFilter">Track status</label><select class="select" id="trackStatusFilter"><option value="all">All statuses</option>${['Available','Partially Occupied','Full','Reserved'].map(v => `<option ${trackFilters.status === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="field"><label for="trackDestinationFilter">Assigned destination</label><select class="select" id="trackDestinationFilter"><option value="all">All destinations</option>${CITIES.map(v => `<option ${trackFilters.destination === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}</select></div><button class="btn" data-action="refresh-tracks">${icon('refresh')} Refresh Yard View</button><span class="tag">${tracks.length} / ${state.tracks.length} TRACKS</span></div><section class="track-management-grid">${tracks.length ? tracks.map(track => {
    const occupied = trackOccupancy(track); const percent = Math.min(100, Math.round(occupied / track.capacity * 100));
    const groups = [...new Set(wagonsOnTrack(track.id).map(w => w.destination))];
    return `<button class="panel track-card" type="button" data-action="track-details" data-id="${escapeHTML(track.id)}"><div class="track-card-top"><div class="track-card-title"><span class="track-glyph">${icon('tracks')}</span><div><h3>${escapeHTML(track.id)}</h3><p>Max capacity ${track.capacity} wagons</p></div></div><span class="status-pill ${statusClass(trackState(track))}">${escapeHTML(trackState(track))}</span></div><div class="capacity-copy"><span>Occupied capacity</span><b>${occupied} / ${track.capacity}</b></div><div class="progress-track"><i style="width:${percent}%"></i></div><div class="track-card-bottom"><span>Available <b>${Math.max(0, track.capacity - occupied)}</b></span><span>${percent}% utilized</span></div><div class="track-card-dest">Assigned destination <strong>${escapeHTML(groups.length ? groups.join(' · ') : track.destination)}</strong></div></button>`;
  }).join('') : `<div class="panel empty-state">No tracks match the selected filters.</div>`}</section>`;
}
function renderMarshalling() {
  const selectedDestination = CITIES[0];
  const candidates = state.wagons.filter(w => w.destination === selectedDestination).slice(0, 4);
  return `<div class="planner-layout"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('layers')}</span><div><h2>Plan inputs</h2><p>Set a destination-oriented wagon group</p></div></div></div><div class="panel-body"><div class="inline-note">Marshalling means grouping wagons into the correct order or destination groups so they can be assembled into suitable goods trains.</div><form id="marshallingForm" class="form-grid" style="margin-top:15px"><div class="field"><label for="planDestination">Destination</label><select class="select" id="planDestination" name="destination">${CITIES.map(city => `<option>${escapeHTML(city)}</option>`).join('')}</select></div><div class="field"><label for="planCargo">Cargo type</label><select class="select" id="planCargo" name="cargo"><option value="all">Any cargo</option>${CARGOS.map(cargo => `<option>${escapeHTML(cargo)}</option>`).join('')}</select></div><div class="field span-2"><label for="planWagons">Wagon selection</label><select class="select" id="planWagons" name="wagons" multiple size="5" aria-describedby="wagonSelectHelp">${candidates.map(w => `<option value="${escapeHTML(w.id)}" selected>${escapeHTML(w.id)} · ${escapeHTML(w.cargo)} · ${escapeHTML(w.status)}</option>`).join('')}</select><span class="help-text" id="wagonSelectHelp">Use Ctrl / Cmd to select multiple wagons. Selection updates with destination and cargo.</span></div><div class="field"><label for="planTarget">Target track</label><select class="select" id="planTarget" name="target"><option value="auto">Auto-select suitable track</option>${state.tracks.map(track => `<option value="${escapeHTML(track.id)}">${escapeHTML(track.id)} · ${escapeHTML(track.destination)} · ${track.capacity - trackOccupancy(track)} free</option>`).join('')}</select></div><div class="field"><label for="planPriority">Priority</label><select class="select" id="planPriority" name="priority">${PRIORITIES.map(value => `<option>${value}</option>`).join('')}</select></div><div class="field span-2"><label for="planDeadline">Optional movement deadline</label><input class="input" id="planDeadline" name="deadline" type="datetime-local"></div><div class="span-2"><button class="btn btn-primary" type="submit">${icon('route')} Generate Marshalling Plan</button></div></form></div></section><section class="panel plan-result"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('check')}</span><div><h2>Proposed grouping</h2><p>Capacity-aware assignment preview</p></div></div></div><div class="panel-body" id="marshallingResult">${state.marshallingPlan ? renderMarshallingResult(state.marshallingPlan) : `<div class="empty-state"><strong>No plan generated</strong>Choose a destination and wagons to calculate a track assignment.</div>`}</div></section></div>`;
}
function renderMarshallingResult(plan) {
  return `<div class="control-row"><span class="tag">${escapeHTML(plan.destination.toUpperCase())}</span><span class="tag">${plan.wagonIds.length} WAGONS</span><span class="status-pill ${plan.warning ? 'status-blocked' : 'status-completed'}">${plan.warning ? 'Capacity warning' : 'Capacity checked'}</span></div>${plan.warning ? `<div class="inline-note warning-note" style="margin-top:12px">${escapeHTML(plan.warning)}</div>` : ''}<div class="planner-summary"><div class="summary-cell"><small>Proposed track</small><b>${escapeHTML(plan.trackId || 'None')}</b></div><div class="summary-cell"><small>Assigned wagons</small><b>${plan.wagonIds.length}</b></div><div class="summary-cell"><small>Remaining capacity</small><b>${plan.remaining ?? '—'}</b></div></div><div class="field-label">Selected wagon group</div><div class="grouped-wagons">${plan.wagonIds.map(id => `<span class="wagon-chip">${escapeHTML(id)}</span>`).join('') || '<span class="help-text">No eligible wagons in this selection.</span>'}</div><div class="reason-box"><strong>Selection rationale</strong><br>${escapeHTML(plan.reason || 'No assignment could be generated.')}${plan.deadline ? `<br>Deadline entered: ${escapeHTML(new Date(plan.deadline).toLocaleString())}` : ''}</div><div class="control-row" style="margin-top:14px"><button class="btn btn-primary" data-action="apply-marshalling" ${plan.warning || !plan.wagonIds.length ? 'disabled' : ''}>${icon('check')} Apply Demo Assignment</button><button class="btn" data-action="reset-marshalling">Reset Plan</button></div>`;
}
function renderOptimizer() {
  if (!state.plan) state.plan = buildOptimization();
  const plan = state.plan;
  const done = plan.steps.filter(step => step.status === 'Completed').length;
  const total = plan.steps.length;
  const progress = total ? Math.round(done / total * 100) : 100;
  return `<div class="optimizer-banner"><span class="banner-icon">${icon('bolt')}</span><div><strong>Heuristic optimization · simplified simulated constraints</strong><p>Shunting means moving wagons between railway tracks. This prototype prioritizes destination grouping and available capacity; it is not a certified railway scheduling algorithm and cannot authorize or execute real movements.</p></div></div><div class="optimizer-controls" style="margin-bottom:14px"><button class="btn btn-primary" data-action="run-optimization">${icon('refresh')} Run Optimization</button><button class="btn" data-action="execute-next" ${!total || done >= total || planPaused ? 'disabled' : ''}>${icon('play')} Execute Next Step</button><button class="btn" data-action="execute-all" ${!total || done >= total || planPaused ? 'disabled' : ''}>${icon('check')} Execute All Demo Steps</button><button class="btn" data-action="pause-simulation">${icon(planPaused ? 'play' : 'pause')} ${planPaused ? 'Resume Simulation' : 'Pause Simulation'}</button><button class="btn btn-danger" data-action="reset-simulation">${icon('refresh')} Reset Simulation</button></div><div class="optimizer-layout"><div class="optimizer-left"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('chart')}</span><div><h2>Before and after</h2><p>Calculated from current mismatched wagons</p></div></div></div><div class="panel-body"><div class="comparison-grid"><div class="comparison-box"><small>Baseline · independent relocations</small><strong>${plan.mismatchCount}</strong><span>wagons requiring movement</span><div class="metric-foot">${formatDuration(plan.baselineMinutes)} estimated duration</div></div><div class="comparison-box after"><small>Heuristic plan</small><strong>${plan.steps.length}</strong><span>planned movements</span><div class="metric-foot">${formatDuration(plan.optimizedMinutes)} estimated duration</div></div></div><div class="progress-header"><span>Execution progress</span><b>${done} / ${total} · ${progress}%</b></div><div class="progress-track"><i style="width:${progress}%"></i></div><div class="inline-note ${plan.blocked.length ? 'warning-note' : ''}" style="margin-top:13px">${optimizationInsight(plan)}${plan.blocked.length ? ` ${plan.blocked.length} wagon(s) blocked by capacity constraints.` : ''}</div></div></section><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('activity')}</span><div><h2>Movement timeline</h2><p>Execution order respects current track capacity</p></div></div><span class="tag">${total} STEPS</span></div><div class="panel-body timeline">${total ? plan.steps.map((step, index) => `<div class="timeline-step ${step.status.toLowerCase()}"><span class="timeline-number">${index + 1}</span><div class="timeline-copy"><strong>${escapeHTML(step.wagonIds.join(', '))} · ${escapeHTML(step.from)} → ${escapeHTML(step.to)}</strong><small>${escapeHTML(step.destination)} · ${escapeHTML(step.reason)}</small></div><span class="timeline-meta">${step.duration} min<br>${escapeHTML(step.status)}</span></div>`).join('') : `<div class="empty-state"><strong>No relocations required</strong>All wagons are currently assigned within their destination group.</div>`}${plan.blocked.map(item => `<div class="timeline-step blocked"><span class="timeline-number">!</span><div class="timeline-copy"><strong>${escapeHTML(item.wagonId)} · Blocked</strong><small>${escapeHTML(item.reason)}</small></div><span class="timeline-meta">No capacity</span></div>`).join('')}</div></section></div><div class="optimizer-right"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('route')}</span><div><h2>Movement detail</h2><p>Proposed wagon-by-wagon assignments</p></div></div></div><div class="table-scroll"><table><thead><tr><th>#</th><th>Wagon / group</th><th>From</th><th>To</th><th>Destination</th><th>Duration</th><th>Status</th></tr></thead><tbody>${plan.steps.map((step, index) => `<tr><td>${index + 1}</td><td class="wagon-id">${escapeHTML(step.wagonIds.join(', '))}</td><td>${escapeHTML(step.from)}</td><td>${escapeHTML(step.to)}</td><td>${escapeHTML(step.destination)}</td><td>${step.duration} min</td><td><span class="status-pill ${statusClass(step.status)}">${escapeHTML(step.status)}</span></td></tr>`).join('')}${plan.blocked.map((item, index) => `<tr><td>${total + index + 1}</td><td class="wagon-id">${escapeHTML(item.wagonId)}</td><td>${escapeHTML(item.origin)}</td><td>—</td><td>${escapeHTML(item.destination)}</td><td>—</td><td><span class="status-pill status-blocked" title="${escapeHTML(item.reason)}">Blocked</span></td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>Estimated minutes per movement: ${Number(settings.movementMinutes)}</span><span>CAPACITY VALIDATED</span></div></section><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('tracks')}</span><div><h2>Capacity constraints</h2><p>Live counts from simulation</p></div></div></div><div class="panel-body destination-list">${state.tracks.filter(track => destinationTrackIds(track.destination).includes(track.id)).slice(0, 6).map(track => `<div class="destination-row"><span>${escapeHTML(track.id)} · ${escapeHTML(track.destination)}</span><b>${trackOccupancy(track)}/${track.capacity}</b><div class="destination-track"><i style="width:${Math.min(100, trackOccupancy(track) / track.capacity * 100)}%"></i></div></div>`).join('')}</div></section></div></div>`;
}
function optimizationInsight(plan) {
  if (plan.blocked.length) return `The heuristic found ${plan.steps.length} feasible moves and did not assign a destination track without capacity.`;
  const reduction = plan.mismatchCount - plan.steps.length;
  if (reduction > 0) return `The plan consolidates the current mismatches into ${plan.steps.length} movements, ${reduction} fewer than the one-wagon-at-a-time baseline.`;
  if (!plan.steps.length) return 'No mismatched wagons remain, so no shunting movement is proposed.';
  return `The current dataset requires ${plan.steps.length} independent relocations. The heuristic makes no unsupported performance claim; estimated duration is ${formatDuration(plan.optimizedMinutes)}.`;
}
function renderAnalytics() {
  const plan = state.plan || buildOptimization();
  const waiting = state.wagons.filter(w => w.status === 'Waiting').length;
  const ready = state.wagons.filter(w => w.status === 'Ready for Departure').length;
  const duration = plan.optimizedMinutes;
  return `<div class="page-heading" style="margin-top:-4px"><span class="tag">SAMPLE DATA · SIMULATED PERIODS</span><div class="analytics-filters" role="group" aria-label="Analytics date range">${[['today','Today'],['7d','Last 7 Days'],['all','All Demo Data']].map(([key,label]) => `<button type="button" class="segment-button ${state.analyticsRange === key ? 'active' : ''}" data-action="analytics-range" data-value="${key}">${label}</button>`).join('')}</div></div><section class="analytics-metrics">${[['Average turnaround', formatDuration(avgTurnaround())],['Shunting duration', formatDuration(duration)],['Planned movements', plan.steps.filter(s => s.status !== 'Completed').length],['Waiting wagons', waiting],['Track utilization', `${utilization()}%`],['Ready to depart', ready]].map(([label,value]) => `<article class="analytics-metric"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong></article>`).join('')}</section><section class="analytics-grid"><article class="panel chart-panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('chart')}</span><div><h2>Movement duration estimate</h2><p>Baseline compared with current heuristic plan · minutes</p></div></div></div><div class="panel-body"><div class="chart-wrap"><canvas id="durationChart" aria-label="Baseline and optimized movement duration chart"></canvas></div><div class="chart-legend"><span><i style="background:#73879e"></i>Baseline</span><span><i style="background:var(--teal)"></i>Heuristic plan</span></div></div></article><article class="panel chart-panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('tracks')}</span><div><h2>Track utilization</h2><p>Occupied positions / maximum capacity · %</p></div></div></div><div class="panel-body"><div class="chart-wrap"><canvas id="trackChart" aria-label="Utilization by track"></canvas></div></div></article><article class="panel chart-panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('wagon')}</span><div><h2>Wagon status distribution</h2><p>Current simulated registry</p></div></div></div><div class="panel-body"><div class="chart-wrap"><canvas id="statusChart" aria-label="Wagon counts by status"></canvas><div class="chart-legend">${STATUSES.filter(status => state.wagons.some(w => w.status === status)).map((status, index) => `<span><i style="background:${['#ffb547','#35d6c3','#ff647c','#4ade80'][index]}"></i>${escapeHTML(status)} · ${state.wagons.filter(w => w.status === status).length}</span>`).join('')}</div></div></div></article><article class="panel chart-panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('pin')}</span><div><h2>Destination counts</h2><p>Registered wagons by destination city</p></div></div></div><div class="panel-body"><div class="chart-wrap"><canvas id="destinationChart" aria-label="Wagons grouped by destination"></canvas></div></div></article><article class="panel chart-panel" style="grid-column:1/-1"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('activity')}</span><div><h2>Turnaround estimate trend</h2><p>Calculated sample averages by simulated activity batch</p></div></div></div><div class="panel-body"><div class="chart-wrap"><canvas id="turnaroundChart" aria-label="Simulated turnaround estimate trend"></canvas></div></div></article></section><div class="insight-panel"><strong>Calculated insight:</strong> ${escapeHTML(optimizationInsight(plan))} All ranges are labels over the same local sample dataset; they do not represent live or historical railway performance.</div>`;
}
function renderActivity() {
  const rows = state.activities.filter(item => (!activitySearch || `${item.title} ${item.detail}`.toLowerCase().includes(activitySearch.toLowerCase())) && (activityType === 'all' || item.type === activityType));
  return `<div class="activity-filters"><div class="search-wrap" style="flex:1"><label class="field-label" for="activitySearch" style="display:none">Search activity events</label>${icon('search')}<input class="input" id="activitySearch" type="search" placeholder="Search activity events" value="${escapeHTML(activitySearch)}"></div><select class="select" id="activityTypeFilter" aria-label="Filter activity type"><option value="all">All event types</option>${[['wagon-added','Wagon added'],['assignment','Assignment changed'],['marshalling','Marshalling plan'],['optimization','Optimization'],['movement','Movement executed'],['simulation-reset','Simulation reset'],['analytics','Analytics']].map(([value,label]) => `<option value="${value}" ${activityType === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div><section class="panel table-panel"><div class="table-scroll"><table><thead><tr><th>Timestamp</th><th>Event type</th><th>Event</th><th>Details</th></tr></thead><tbody>${rows.length ? rows.map(item => `<tr><td>${formatDate(item.timestamp)}</td><td><span class="event-icon">${item.type === 'movement' ? '↗' : item.type === 'wagon-added' ? '+' : item.type === 'optimization' ? '⚙' : '·'}</span>${escapeHTML(item.type.replaceAll('-', ' '))}</td><td>${escapeHTML(item.title)}</td><td>${escapeHTML(item.detail)}</td></tr>`).join('') : `<tr><td colspan="4"><div class="empty-state"><strong>No events found</strong>Try a different search or event type.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>${rows.length} events</span><span>NEWEST FIRST</span></div></section>`;
}
function renderSettings() {
  return `<div class="settings-layout"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('settings')}</span><div><h2>Simulation preferences</h2><p>Saved locally in this browser when available</p></div></div></div><div class="panel-body"><form id="settingsForm" class="settings-form"><div class="settings-field"><label for="yardName">Yard name<small>Display name for this local demonstration</small></label><input class="input" id="yardName" name="yardName" maxlength="48" required value="${escapeHTML(settings.yardName)}"></div><div class="settings-field"><label for="movementMinutes">Assumed minutes per shunting movement<small>Used in estimated movement duration</small></label><input class="input" id="movementMinutes" name="movementMinutes" type="number" min="1" max="240" required value="${Number(settings.movementMinutes)}"></div><div class="settings-field"><label for="defaultCapacity">Default wagon capacity per track<small>Applied to newly added tracks only</small></label><input class="input" id="defaultCapacity" name="defaultCapacity" type="number" min="1" max="100" required value="${Number(settings.defaultCapacity)}"></div><div class="settings-field"><label>Theme accent<small>Choose the interface highlight color</small></label><div class="accent-options" role="group" aria-label="Theme accent">${[['#35d6c3','Railway teal'],['#ffb547','Signal amber'],['#7ab6ff','Signal blue'],['#e78aa1','Cargo rose']].map(([color,label]) => `<button type="button" class="accent-choice ${settings.accent === color ? 'selected' : ''}" style="--choice:${color}" data-action="set-accent" data-value="${color}" aria-label="${label}" aria-pressed="${settings.accent === color}"></button>`).join('')}</div></div><div class="settings-field"><label for="soundToggle">Sound notifications<small>Short tone after successful actions</small></label><label style="display:flex;align-items:center;gap:9px"><input type="checkbox" id="soundToggle" ${settings.sound ? 'checked' : ''}> <span class="help-text">Enable optional notification tone</span></label></div><div class="control-row"><button class="btn btn-primary" type="submit">Save Preferences</button><button class="btn btn-danger" type="button" data-action="restore-settings">Restore Default Settings</button></div></form></div></section><aside class="settings-info"><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('activity')}</span><div><h2>Prototype boundaries</h2><p>Operational safety and data scope</p></div></div></div><div class="panel-body" style="display:grid;gap:9px"><div class="inline-note warning-note">This is an educational hackathon simulation. It does not connect to Indian Railways or control real trains.</div><div class="inline-note">Real railway movements require authorized operating procedures, interlocking, route clearance, and qualified personnel. All wagon, capacity, and time values shown here are sample data.</div><span class="tag">NO NETWORK CONNECTION</span></div></section><section class="panel"><div class="panel-header"><div class="panel-heading"><span class="heading-icon">${icon('tracks')}</span><div><h2>Current model</h2><p>Simulation state snapshot</p></div></div></div><div class="panel-body destination-list"><div class="destination-row"><span>Yard</span><b>${escapeHTML(settings.yardName)}</b></div><div class="destination-row"><span>Registered wagons</span><b>${state.wagons.length}</b></div><div class="destination-row"><span>Track sections</span><b>${state.tracks.length}</b></div><div class="destination-row"><span>Total capacity</span><b>${totalCapacity()} wagons</b></div></div></section></aside></div>`;
}

function openModal(title, subtitle, body, footer = '', wide = false) {
  modalReturnFocus = document.activeElement;
  modalLayer.innerHTML = `<section class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><div><h2 id="modalTitle">${escapeHTML(title)}</h2><p>${escapeHTML(subtitle)}</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="Close dialog">×</button></header><div class="modal-body">${body}</div>${footer ? `<footer class="modal-foot">${footer}</footer>` : ''}</section>`;
  modalLayer.hidden = false;
  document.body.style.overflow = 'hidden';
  modalLayer.querySelector('.modal-close').focus();
}
function closeModal() {
  modalLayer.hidden = true;
  modalLayer.innerHTML = '';
  document.body.style.overflow = '';
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus({ preventScroll: true });
}
function confirmAction(title, message, onConfirm, confirmLabel = 'Confirm') {
  openModal(title, 'Review this local simulation change before applying.', `<div class="inline-note warning-note">${escapeHTML(message)}</div>`, `<button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-danger" type="button" data-action="confirm-action">${escapeHTML(confirmLabel)}</button>`);
  modalLayer.dataset.confirm = 'pending';
  modalLayer.confirmCallback = onConfirm;
}
function openWagonModal(id = '') {
  const wagon = id ? state.wagons.find(item => item.id === id) : null;
  if (id && !wagon) return;
  const trackOptions = state.tracks.map(track => {
    const occupied = trackOccupancy(track) - (wagon?.currentTrack === track.id ? 1 : 0);
    return `<option value="${escapeHTML(track.id)}" ${wagon?.currentTrack === track.id ? 'selected' : ''} ${occupied >= track.capacity ? 'disabled' : ''}>${escapeHTML(track.id)} · ${escapeHTML(track.destination)} · ${Math.max(0, track.capacity - occupied)} free</option>`;
  }).join('');
  const status = wagon?.status || 'Waiting';
  const arrival = wagon ? new Date(wagon.arrival) : new Date();
  const localArrival = new Date(arrival.getTime() - arrival.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const body = `<form id="wagonForm" class="form-grid"><input type="hidden" name="originalId" value="${escapeHTML(wagon?.id || '')}"><div class="field"><label for="wagonIdField">Wagon ID</label><input class="input" id="wagonIdField" name="id" maxlength="24" required value="${escapeHTML(wagon?.id || nextWagonId())}" ${wagon ? 'readonly' : ''}></div><div class="field"><label for="wagonCargoField">Cargo type</label><select class="select" id="wagonCargoField" name="cargo" required>${CARGOS.map(cargo => `<option ${wagon?.cargo === cargo ? 'selected' : ''}>${escapeHTML(cargo)}</option>`).join('')}</select></div><div class="field"><label for="wagonDestinationField">Destination</label><select class="select" id="wagonDestinationField" name="destination" required>${CITIES.map(city => `<option ${wagon?.destination === city ? 'selected' : ''}>${escapeHTML(city)}</option>`).join('')}</select></div><div class="field"><label for="wagonTrackField">Current track</label><select class="select" id="wagonTrackField" name="track"><option value="">In transit / no track</option>${trackOptions}</select><span class="help-text">A track assignment cannot exceed its capacity.</span></div><div class="field"><label for="wagonArrivalField">Arrival time</label><input class="input" id="wagonArrivalField" name="arrival" type="datetime-local" required value="${localArrival}"></div><div class="field"><label for="wagonPriorityField">Priority</label><select class="select" id="wagonPriorityField" name="priority">${PRIORITIES.map(value => `<option ${wagon?.priority === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div><div class="field"><label for="wagonStatusField">Status</label><select class="select" id="wagonStatusField" name="status">${STATUSES.map(value => `<option ${status === value ? 'selected' : ''}>${escapeHTML(value)}</option>`).join('')}</select></div><div class="field span-2"><div class="form-error" id="wagonFormError" role="alert"></div></div></form>`;
  openModal(wagon ? `Edit ${wagon.id}` : 'Register a wagon', 'Update the local wagon registry.', body, `<button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit" form="wagonForm">${wagon ? 'Save Changes' : 'Add Wagon'}</button>`);
  const form = modalLayer.querySelector('#wagonForm');
  form.addEventListener('submit', event => { event.preventDefault(); saveWagonForm(form); });
}
function nextWagonId() {
  const maximum = state.wagons.reduce((max, wagon) => Math.max(max, Number(wagon.id.match(/(\d+)$/)?.[1] || 1000)), 1000);
  return `WGN-${maximum + 1}`;
}
function openWagonDetails(id) {
  const wagon = state.wagons.find(item => item.id === id);
  if (!wagon) return;
  const body = `<div class="planner-summary"><div class="summary-cell"><small>Wagon ID</small><b>${escapeHTML(wagon.id)}</b></div><div class="summary-cell"><small>Destination</small><b>${escapeHTML(wagon.destination)}</b></div><div class="summary-cell"><small>Track</small><b>${escapeHTML(wagon.currentTrack || 'In transit')}</b></div><div class="summary-cell"><small>Cargo</small><b>${escapeHTML(wagon.cargo)}</b></div><div class="summary-cell"><small>Priority</small><b>${escapeHTML(wagon.priority)}</b></div><div class="summary-cell"><small>Status</small><b>${escapeHTML(wagon.status)}</b></div></div><div class="reason-box">Arrival recorded ${escapeHTML(formatDate(wagon.arrival))}. Simulated turnaround estimate: ${formatDuration(wagon.turnaroundMinutes)}.</div>`;
  openModal(`Wagon ${wagon.id}`, 'Registry record detail · simulated data.', body, `<button class="btn" type="button" data-action="close-modal">Close</button><button class="btn btn-primary" type="button" data-action="edit-wagon" data-id="${escapeHTML(wagon.id)}">${icon('edit')} Edit Wagon</button>`);
}
function openTrackDetails(id) {
  const track = trackById(id);
  if (!track) return;
  const wagons = wagonsOnTrack(id);
  const body = `<div class="planner-summary"><div class="summary-cell"><small>Capacity</small><b>${track.capacity}</b></div><div class="summary-cell"><small>Occupied</small><b>${wagons.length}</b></div><div class="summary-cell"><small>Available</small><b>${Math.max(0, track.capacity - wagons.length)}</b></div></div><div class="control-row" style="margin-bottom:12px"><span class="status-pill ${statusClass(trackState(track))}">${escapeHTML(trackState(track))}</span><span class="tag">ASSIGNED GROUP · ${escapeHTML(track.destination)}</span></div><div class="table-scroll"><table><thead><tr><th>Wagon ID</th><th>Cargo</th><th>Destination</th><th>Status</th></tr></thead><tbody>${wagons.length ? wagons.map(w => `<tr><td class="wagon-id">${escapeHTML(w.id)}</td><td>${escapeHTML(w.cargo)}</td><td>${escapeHTML(w.destination)}</td><td>${escapeHTML(w.status)}</td></tr>`).join('') : `<tr><td colspan="4">No wagons currently assigned.</td></tr>`}</tbody></table></div>`;
  openModal(`Track ${track.id}`, 'Capacity and assigned wagon inspection.', body, `<button class="btn" type="button" data-action="close-modal">Close</button>`, true);
}
function generateMarshallingPlan(form) {
  const data = new FormData(form);
  const destination = String(data.get('destination'));
  const cargo = String(data.get('cargo'));
  const selected = [...form.querySelector('#planWagons').selectedOptions].map(option => option.value);
  const wagons = state.wagons.filter(w => selected.includes(w.id) && w.destination === destination && (cargo === 'all' || w.cargo === cargo));
  const targetChoice = String(data.get('target'));
  let track = targetChoice === 'auto' ? null : trackById(targetChoice);
  let warning = '';
  let remaining = null;
  let reason = '';
  if (!wagons.length) warning = 'Select at least one registered wagon matching the chosen destination and cargo.';
  else if (targetChoice === 'auto') {
    const suitableTracks = destinationTrackIds(destination).map(trackById).filter(candidate => {
      if (!candidate || candidate.reserved) return false;
      const staying = wagons.filter(wagon => wagon.currentTrack === candidate.id).length;
      return candidate.capacity - trackOccupancy(candidate) + staying >= wagons.length;
    }).sort((a, b) => trackOccupancy(a) / a.capacity - trackOccupancy(b) / b.capacity);
    track = suitableTracks[0] || null;
    if (!track) warning = `No single destination track has capacity for all ${wagons.length} selected wagons. Reduce the group or select a different assignment.`;
  } else if (!track) warning = `No track has available capacity for ${destination}.`;
  if (!warning && track) {
    const occupiedAfterDepartures = trackOccupancy(track) - wagons.filter(w => w.currentTrack === track.id).length;
    remaining = track.capacity - occupiedAfterDepartures - wagons.length;
    if (track.reserved) warning = `Track ${track.id} is reserved and cannot receive an assignment.`;
    else if (remaining < 0) warning = `Track ${track.id} is short by ${Math.abs(remaining)} positions; choose a track with sufficient free capacity.`;
    else {
      const foreign = wagonsOnTrack(track.id).filter(w => w.destination !== destination && !selected.includes(w.id));
      reason = `${track.id} has enough capacity for the selected group. The selected wagons will move from their current tracks; existing wagon assignments will remain untouched.${track.destination !== destination ? ` This track is designated for ${track.destination}; using it for ${destination} is a destination-group exception and requires confirmation.` : ''}${foreign.length ? ` ${foreign.length} existing wagon(s) for other destinations remain in place.` : ''}`;
    }
  }
  state.marshallingPlan = { destination, wagonIds: wagons.map(w => w.id), trackId: track?.id || '', warning, remaining: Math.max(0, remaining ?? 0), reason, deadline: String(data.get('deadline') || ''), priority: String(data.get('priority')) };
  addActivity('Marshalling plan generated', 'marshalling', `${wagons.length} selected wagon(s) · ${track?.id || 'no suitable track'}${warning ? ' · capacity warning' : ''}`);
  renderPage();
  toast(warning ? 'Marshalling plan has a capacity warning.' : 'Marshalling plan generated.', warning ? 'warning' : 'success');
}
function applyMarshallingPlan() {
  const plan = state.marshallingPlan;
  const track = plan && trackById(plan.trackId);
  if (!plan || plan.warning || !track) return;
  const selected = state.wagons.filter(w => plan.wagonIds.includes(w.id));
  const remaining = track.capacity - trackOccupancy(track) + selected.filter(w => w.currentTrack === track.id).length;
  if (selected.length > remaining) {
    toast(`Track ${track.id} no longer has enough capacity. Generate a new plan.`, 'error');
    return;
  }
  const confirmText = `Move ${selected.length} selected wagon(s) to ${track.id}? Existing wagons will not be reassigned; this action updates only the selected records.${track.destination !== plan.destination ? ` Track ${track.id} is designated for ${track.destination}, so this is a destination-group exception.` : ''}`;
  confirmAction('Apply demo assignment?', confirmText, () => {
    selected.forEach(wagon => { wagon.currentTrack = track.id; if (wagon.status === 'Waiting') wagon.status = 'In Yard'; });
    addActivity('Wagon assignment changed', 'assignment', `${selected.length} wagon(s) assigned to ${track.id} for ${plan.destination}.`);
    state.marshallingPlan = null;
    state.plan = buildOptimization();
    closeModal(); renderPage(); playNotification(); toast('Demo assignment applied to selected wagons.');
  }, 'Apply Assignment');
}
function executeMovement(step) {
  const target = trackById(step.to);
  const wagons = state.wagons.filter(w => step.wagonIds.includes(w.id));
  const available = target ? target.capacity - trackOccupancy(target) + wagons.filter(w => w.currentTrack === target.id).length : -1;
  if (!target || available < wagons.length || target.reserved) {
    step.status = 'Blocked';
    step.reason = `Blocked: track ${step.to} does not have capacity for this movement.`;
    return false;
  }
  step.status = 'In Progress';
  wagons.forEach(wagon => { wagon.currentTrack = target.id; if (wagon.status === 'Waiting') wagon.status = 'In Yard'; });
  step.status = 'Completed';
  state.plan.completed = state.plan.steps.filter(item => item.status === 'Completed').length;
  addActivity('Movement step executed', 'movement', `${step.wagonIds.join(', ')} · ${step.from} to ${step.to} · ${step.duration} min estimated.`);
  return true;
}
function runOptimization() {
  state.plan = buildOptimization();
  planPaused = false;
  addActivity('Optimization completed', 'optimization', `${state.plan.steps.length} planned movement(s), ${state.plan.blocked.length} blocked by capacity.`);
  renderPage(); playNotification(); toast('Shunting optimization recalculated.', 'success', `${state.plan.steps.length} feasible movements · ${formatDuration(state.plan.optimizedMinutes)} estimate`);
}
function resetSimulation() {
  closeModal();
  state = clone(seedState);
  state.plan = buildOptimization();
  if (settings.defaultCapacity !== 15) state.tracks.forEach(track => { track.capacity = Math.max(settings.defaultCapacity, trackOccupancy(track)); });
  planPaused = false;
  addActivity('Simulation reset', 'simulation-reset', 'Seed wagons and track occupancy restored; preferences retained.');
  setPage('overview'); playNotification(); toast('Simulation restored to the original demo state.', 'success', 'Saved yard preferences were retained.');
}
function saveWagonForm(form) {
  const values = new FormData(form);
  const originalId = String(values.get('originalId') || '');
  const id = String(values.get('id') || '').trim().toUpperCase();
  const status = String(values.get('status'));
  const trackId = String(values.get('track') || '');
  const target = trackId ? trackById(trackId) : null;
  const existing = originalId ? state.wagons.find(w => w.id === originalId) : null;
  const error = modalLayer.querySelector('#wagonFormError');
  let message = '';
  if (!/^WGN-[A-Z0-9-]+$/.test(id)) message = 'Use a wagon ID beginning with WGN-.';
  else if (!existing && state.wagons.some(w => w.id === id)) message = 'That wagon ID is already registered.';
  else if (!trackId && status !== 'In Transit') message = 'Choose a current track unless the wagon is In Transit.';
  else if (trackId && !target) message = 'Choose a valid track.';
  else if (target && target.reserved) message = `Track ${trackId} is reserved.`;
  else if (target && trackOccupancy(target) - (existing?.currentTrack === trackId && existing.status !== 'In Transit' ? 1 : 0) >= target.capacity) message = `Track ${trackId} has no available capacity.`;
  if (message) { error.textContent = message; return; }
  const record = {
    id, cargo: String(values.get('cargo')), destination: String(values.get('destination')),
    currentTrack: trackId || null, arrival: new Date(String(values.get('arrival'))).toISOString(),
    priority: String(values.get('priority')), status, turnaroundMinutes: existing?.turnaroundMinutes ?? 260
  };
  if (existing) {
    Object.assign(existing, record);
    addActivity('Wagon assignment changed', 'assignment', `${id} updated · ${record.currentTrack || 'in transit'}.`);
  } else {
    state.wagons.push(record);
    addActivity('Wagon added', 'wagon-added', `${id} · ${record.cargo} for ${record.destination}.`);
  }
  state.plan = buildOptimization();
  closeModal(); renderPage(); playNotification(); toast(existing ? `${id} updated.` : `${id} added to the registry.`);
}
function deleteWagon(id) {
  const wagon = state.wagons.find(w => w.id === id);
  if (!wagon) return;
  confirmAction(`Delete ${id}?`, 'This removes the wagon from the current local simulation and recalculates track occupancy. This cannot be undone except by resetting the demo.', () => {
    state.wagons = state.wagons.filter(w => w.id !== id);
    addActivity('Wagon deleted', 'wagon-deleted', `${id} removed from current simulation.`);
    state.plan = buildOptimization();
    closeModal(); renderPage(); toast(`${id} removed from the simulation.`, 'warning');
  }, 'Delete Wagon');
}
function renderWagonRowsOnly() {
  const tbody = pageContent.querySelector('tbody');
  if (!tbody) return;
  const rows = filteredWagons();
  tbody.innerHTML = rows.length ? rows.map(renderWagonRow).join('') : `<tr><td colspan="8"><div class="empty-state"><strong>No wagons match these filters</strong>Change the search or filter selections.</div></td></tr>`;
  const footer = pageContent.querySelector('.table-footer span');
  if (footer) footer.textContent = `Showing ${rows.length} of ${state.wagons.length} wagons`;
}
function renderActivityRowsOnly() {
  const filtered = state.activities.filter(item => (!activitySearch || `${item.title} ${item.detail}`.toLowerCase().includes(activitySearch.toLowerCase())) && (activityType === 'all' || item.type === activityType));
  const tbody = pageContent.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(item => `<tr><td>${formatDate(item.timestamp)}</td><td><span class="event-icon">${item.type === 'movement' ? '↗' : item.type === 'wagon-added' ? '+' : item.type === 'optimization' ? '⚙' : '·'}</span>${escapeHTML(item.type.replaceAll('-', ' '))}</td><td>${escapeHTML(item.title)}</td><td>${escapeHTML(item.detail)}</td></tr>`).join('') : `<tr><td colspan="4"><div class="empty-state"><strong>No events found</strong>Try a different search or event type.</div></td></tr>`;
  const count = pageContent.querySelector('.table-footer span');
  if (count) count.textContent = `${filtered.length} events`;
}
function updatePlanWagonChoices() {
  const destination = pageContent.querySelector('#planDestination')?.value;
  const cargo = pageContent.querySelector('#planCargo')?.value;
  const select = pageContent.querySelector('#planWagons');
  if (!select) return;
  const current = new Set([...select.selectedOptions].map(option => option.value));
  const candidates = state.wagons.filter(w => w.destination === destination && (cargo === 'all' || w.cargo === cargo));
  select.innerHTML = candidates.map(w => `<option value="${escapeHTML(w.id)}" ${current.size ? current.has(w.id) ? 'selected' : '' : ''}>${escapeHTML(w.id)} · ${escapeHTML(w.cargo)} · ${escapeHTML(w.status)}</option>`).join('');
  if (![...select.options].some(option => current.has(option.value))) [...select.options].slice(0, 4).forEach(option => { option.selected = true; });
}

function analyticsWagons() {
  const now = Date.now();
  const rangeMs = state.analyticsRange === 'today' ? 86400000 : state.analyticsRange === '7d' ? 7 * 86400000 : Infinity;
  return state.wagons.filter(w => now - new Date(w.arrival).getTime() <= rangeMs);
}
function drawCharts() {
  const records = analyticsWagons();
  drawDurationChart('durationChart');
  drawHorizontalChart('trackChart', state.tracks.map(track => ({ label: track.id, value: track.capacity ? Math.round(trackOccupancy(track) / track.capacity * 100) : 0 })), 100, '%');
  drawHorizontalChart('statusChart', STATUSES.map(status => ({ label: status, value: records.filter(w => w.status === status).length })), Math.max(1, ...STATUSES.map(status => records.filter(w => w.status === status).length)), '');
  drawHorizontalChart('destinationChart', CITIES.map(city => ({ label: city, value: records.filter(w => w.destination === city).length })), Math.max(1, ...CITIES.map(city => records.filter(w => w.destination === city).length)), '');
  const batches = Array.from({ length: 8 }, (_, index) => {
    const sample = records.filter((_, recordIndex) => recordIndex % 8 === index);
    return { label: `B${index + 1}`, value: sample.length ? Math.round(sample.reduce((sum, w) => sum + w.turnaroundMinutes, 0) / sample.length) : 0 };
  });
  drawLineChart('turnaroundChart', batches);
}
function prepareCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  context.clearRect(0, 0, box.width, box.height);
  return { canvas, ctx: context, width: box.width, height: box.height };
}
function drawHorizontalChart(id, data, max, suffix) {
  const plot = prepareCanvas(id); if (!plot) return;
  const { ctx, width, height } = plot;
  const left = 102, right = 28, top = 5, row = Math.min(22, (height - top) / Math.max(data.length, 1));
  ctx.font = '9px "DM Mono", Consolas, monospace';
  data.forEach((item, index) => {
    const y = top + index * row;
    const label = item.label.length > 14 ? `${item.label.slice(0, 12)}…` : item.label;
    ctx.fillStyle = '#91a2b7'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(label, left - 9, y + row * .48);
    ctx.fillStyle = 'rgba(167,181,200,.09)'; ctx.fillRect(left, y + row * .24, Math.max(0, width - left - right), Math.min(8, row * .52));
    const barWidth = Math.max(0, (width - left - right) * item.value / max);
    ctx.fillStyle = id === 'trackChart' ? '#35d6c3' : id === 'statusChart' ? ['#ffb547', '#35d6c3', '#ff647c', '#4ade80'][index] : CITY_COLORS[index % CITY_COLORS.length];
    ctx.fillRect(left, y + row * .24, barWidth, Math.min(8, row * .52));
    ctx.fillStyle = '#cbd6e2'; ctx.textAlign = 'left'; ctx.fillText(`${item.value}${suffix}`, Math.min(width - right - 22, left + barWidth + 5), y + row * .48);
  });
}
function drawDurationChart(id) {
  const plot = prepareCanvas(id); if (!plot) return;
  const { ctx, width, height } = plot;
  const plan = state.plan || buildOptimization();
  const values = [plan.baselineMinutes, plan.optimizedMinutes];
  const max = Math.max(1, ...values) * 1.18;
  const colors = ['#73879e', '#35d6c3'];
  const names = ['Baseline', 'Heuristic'];
  ctx.font = '9px "DM Mono", Consolas, monospace';
  for (let line = 0; line <= 3; line += 1) {
    const y = height - 25 - line * ((height - 48) / 3);
    ctx.strokeStyle = 'rgba(167,181,200,.11)'; ctx.beginPath(); ctx.moveTo(35, y); ctx.lineTo(width - 10, y); ctx.stroke();
    ctx.fillStyle = '#74869c'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(Math.round(max * line / 3)), 29, y);
  }
  values.forEach((value, index) => {
    const x = width * (.34 + index * .34); const barHeight = (height - 49) * value / max;
    ctx.fillStyle = colors[index]; ctx.fillRect(x - 25, height - 25 - barHeight, 50, barHeight);
    ctx.fillStyle = '#d2dce7'; ctx.textAlign = 'center'; ctx.fillText(`${value} min`, x, height - 31 - barHeight);
    ctx.fillStyle = '#92a2b6'; ctx.fillText(names[index], x, height - 8);
  });
}
function drawLineChart(id, data) {
  const plot = prepareCanvas(id); if (!plot) return;
  const { ctx, width, height } = plot;
  const vals = data.map(item => item.value); const min = Math.min(...vals, 0); const max = Math.max(...vals, 1);
  const left = 35, right = 12, top = 12, bottom = 25;
  for (let line = 0; line < 4; line += 1) {
    const y = top + line * (height - top - bottom) / 3;
    ctx.strokeStyle = 'rgba(167,181,200,.11)'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
  }
  ctx.beginPath();
  data.forEach((item, index) => {
    const x = left + index * (width - left - right) / Math.max(1, data.length - 1);
    const y = top + (max - item.value) / Math.max(1, max - min) * (height - top - bottom);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#35d6c3'; ctx.lineWidth = 2; ctx.stroke();
  data.forEach((item, index) => {
    const x = left + index * (width - left - right) / Math.max(1, data.length - 1);
    const y = top + (max - item.value) / Math.max(1, max - min) * (height - top - bottom);
    ctx.fillStyle = '#35d6c3'; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#91a2b7'; ctx.font = '9px "DM Mono", Consolas, monospace'; ctx.textAlign = 'center'; ctx.fillText(item.label, x, height - 7);
  });
}

pageHeading.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'add-wagon') openWagonModal();
  else if (button.dataset.action === 'refresh-tracks') { renderPage(); toast('Yard view refreshed from current simulation state.'); }
});
pageContent.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'add-wagon') openWagonModal();
  else if (action === 'wagon-details') openWagonDetails(id);
  else if (action === 'edit-wagon') openWagonModal(id);
  else if (action === 'delete-wagon') deleteWagon(id);
  else if (action === 'track-details') openTrackDetails(id);
  else if (action === 'refresh-tracks') { renderPage(); toast('Yard view refreshed from current simulation state.'); }
  else if (action === 'go-tracks') setPage('tracks');
  else if (action === 'go-marshalling') setPage('marshalling');
  else if (action === 'go-optimizer') setPage('optimizer');
  else if (action === 'go-activity') setPage('activity');
  else if (action === 'run-optimization') runOptimization();
  else if (action === 'execute-next') {
    const step = state.plan?.steps.find(item => item.status === 'Planned');
    if (!step || planPaused) return;
    if (executeMovement(step)) { renderPage(); playNotification(); toast(`Movement executed: ${step.wagonIds.join(', ')} to ${step.to}.`); }
    else { renderPage(); toast(`Movement blocked: ${step.reason}`, 'error'); }
  } else if (action === 'execute-all') {
    if (planPaused) return;
    let executed = 0;
    state.plan.steps.filter(step => step.status === 'Planned').forEach(step => { if (executeMovement(step)) executed += 1; });
    renderPage(); playNotification(); toast(`${executed} demo movement step(s) executed.`);
  } else if (action === 'pause-simulation') { planPaused = !planPaused; renderPage(); toast(planPaused ? 'Simulation execution paused.' : 'Simulation execution resumed.'); }
  else if (action === 'reset-simulation') confirmAction('Reset simulation?', 'All wagon, track, plan, and activity changes in this session will be restored to the deterministic seed. Saved preferences are kept.', resetSimulation, 'Reset Demo');
  else if (action === 'analytics-range') { state.analyticsRange = button.dataset.value; renderPage(); }
  else if (action === 'apply-marshalling') applyMarshallingPlan();
  else if (action === 'reset-marshalling') { state.marshallingPlan = null; renderPage(); toast('Marshalling plan cleared.'); }
  else if (action === 'set-accent') { settings.accent = button.dataset.value; saveSettings(); applyAccent(); renderPage(); }
  else if (action === 'restore-settings') confirmAction('Restore default settings?', 'Yard name, movement assumptions, capacity defaults, accent color, and sound preference will return to prototype defaults.', () => { settings = { yardName: 'MTX Demo Freight Yard', movementMinutes: 12, defaultCapacity: 15, accent: '#35d6c3', sound: false }; state.tracks.forEach(track => { track.capacity = Math.max(settings.defaultCapacity, trackOccupancy(track)); }); saveSettings(); applyAccent(); closeModal(); renderPage(); toast('Default settings restored.'); }, 'Restore Defaults');
});
pageContent.addEventListener('input', event => {
  if (event.target.id === 'wagonSearch') { wagonFilters.search = event.target.value; renderWagonRowsOnly(); }
  if (event.target.id === 'activitySearch') { activitySearch = event.target.value; renderActivityRowsOnly(); }
});
pageContent.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'cargoFilter') wagonFilters.cargo = target.value;
  else if (target.id === 'destinationFilter') wagonFilters.destination = target.value;
  else if (target.id === 'statusFilter') wagonFilters.status = target.value;
  else if (target.id === 'sortWagons') wagonSort = target.value;
  else if (target.id === 'trackStatusFilter') trackFilters.status = target.value;
  else if (target.id === 'trackDestinationFilter') trackFilters.destination = target.value;
  else if (target.id === 'activityTypeFilter') activityType = target.value;
  else if (target.id === 'planDestination' || target.id === 'planCargo') { updatePlanWagonChoices(); return; }
  else return;
  renderPage();
});
pageContent.addEventListener('submit', event => {
  if (event.target.id === 'marshallingForm') { event.preventDefault(); generateMarshallingPlan(event.target); }
  else if (event.target.id === 'settingsForm') {
    event.preventDefault();
    const data = new FormData(event.target);
    settings.yardName = String(data.get('yardName')).trim() || 'MTX Demo Freight Yard';
    settings.movementMinutes = Number(data.get('movementMinutes'));
    settings.defaultCapacity = Number(data.get('defaultCapacity'));
    settings.sound = Boolean(event.target.querySelector('#soundToggle').checked);
    state.tracks.forEach(track => { track.capacity = Math.max(settings.defaultCapacity, trackOccupancy(track)); });
    saveSettings(); applyAccent(); state.plan = buildOptimization(); renderPage(); playNotification(); toast('Simulation preferences saved locally.');
  }
});
modalLayer.addEventListener('click', event => {
  if (event.target === modalLayer) closeModal();
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'close-modal') closeModal();
  else if (button.dataset.action === 'confirm-action') {
    const callback = modalLayer.confirmCallback;
    modalLayer.confirmCallback = null;
    if (callback) callback();
  } else if (button.dataset.action === 'edit-wagon') openWagonModal(button.dataset.id);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!modalLayer.hidden) closeModal();
    document.getElementById('notificationMenu').hidden = true;
    document.getElementById('notificationButton').setAttribute('aria-expanded', 'false');
    document.getElementById('sidebar').classList.remove('open');
  }
});
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setPage(button.dataset.page)));
document.getElementById('mobileMenu').addEventListener('click', event => {
  const sidebar = document.getElementById('sidebar');
  const open = sidebar.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
document.getElementById('notificationButton').addEventListener('click', event => {
  const menu = document.getElementById('notificationMenu');
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!menu.hidden));
});
document.addEventListener('click', event => {
  if (!event.target.closest('.top-action-wrap')) {
    document.getElementById('notificationMenu').hidden = true;
    document.getElementById('notificationButton').setAttribute('aria-expanded', 'false');
  }
});
document.getElementById('dismissNotice').addEventListener('click', () => { document.querySelector('.simulation-notice').hidden = true; document.getElementById('sidebar').style.top = '70px'; document.querySelector('.main-content').style.paddingTop = '94px'; });
window.addEventListener('hashchange', () => setPage(location.hash.slice(1) || 'overview', false));
window.addEventListener('resize', () => { if (activePage === 'analytics') requestAnimationFrame(drawCharts); });
function applyAccent() { document.documentElement.style.setProperty('--teal', settings.accent); document.documentElement.style.setProperty('--accent', settings.accent); }
function updateClock() {
  document.getElementById('clock').textContent = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}
applyAccent();
state.plan = buildOptimization();
updateClock();
window.setInterval(updateClock, 1000);
const initialPage = location.hash.slice(1);
setPage(pageMeta[initialPage] ? initialPage : 'overview', false);
