const STORAGE_KEY = 'medbridge-shipments';
const SAMPLE_SHIPMENT = {
  id: crypto.randomUUID ? crypto.randomUUID() : `shipment-${Date.now()}`,
  trackingCode: 'MDL-KMSD12',
  status: 'Awaiting Customs Clearance',
  currentLocation: 'Latakia Port',
  destination: 'Port of San Diego',
  eta: '2026-08-15',
  paymentStatus: 'Partially Paid',
  outstandingBalance: '$24,000',
  notes: 'Advance duties payment still required before customs release.',
  lastUpdated: new Date().toLocaleString(),
  shipmentValue: '$2,850,000',
  duties: '$64,000',
  equipment: [
    'Advanced Orthopedic Surgical Navigation & Robotic System ($1,450,000)',
    'Digital Mobile C-Arm Fluoroscopy System ($950,000)',
    'Orthopedic Operating Table System ($450,000)'
  ],
  timeline: [
    'Booking confirmation received',
    'Export documentation finalized',
    'Cargo loaded for international transport',
    'Awaiting customs clearance',
    'Final delivery at destination hospital'
  ]
};

function getShipments() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_SHIPMENT]));
    return [SAMPLE_SHIPMENT];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Unable to parse shipments', error);
    return [SAMPLE_SHIPMENT];
  }
}

function saveShipments(shipments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
}

function renderTable(search = '') {
  const shipments = getShipments();
  const body = document.getElementById('shipment-table-body');
  if (!body) return;

  const filtered = shipments.filter((shipment) => {
    const haystack = `${shipment.trackingCode} ${shipment.destination} ${shipment.status}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  body.innerHTML = filtered.length
    ? filtered
        .map((shipment) => {
          const badgeClass = shipment.paymentStatus === 'Paid' ? 'badge-paid' : shipment.paymentStatus === 'Unpaid' ? 'badge-unpaid' : 'badge-pending';
          return `
            <tr>
              <td>${shipment.trackingCode}</td>
              <td>${shipment.status}</td>
              <td>${shipment.destination}</td>
              <td>${shipment.eta}</td>
              <td><span class="badge ${badgeClass}">${shipment.paymentStatus}</span></td>
              <td>
                <button class="btn btn-secondary" data-action="edit" data-id="${shipment.id}">Edit</button>
                <button class="btn btn-secondary" data-action="delete" data-id="${shipment.id}">Delete</button>
              </td>
            </tr>`;
        })
        .join('')
    : '<tr><td colspan="6">No shipments found.</td></tr>';
}

function updateStats() {
  const shipments = getShipments();
  const total = shipments.length;
  const paid = shipments.filter((item) => item.paymentStatus === 'Paid').length;
  const pending = shipments.filter((item) => item.paymentStatus === 'Partially Paid').length;
  const customs = shipments.filter((item) => item.status.includes('Customs')).length;

  document.getElementById('total-shipments').textContent = total;
  document.getElementById('paid-count').textContent = paid;
  document.getElementById('pending-count').textContent = pending;
  document.getElementById('customs-count').textContent = customs;
}

function fillForm(shipment) {
  document.getElementById('shipment-id').value = shipment.id;
  document.getElementById('tracking-code-input').value = shipment.trackingCode;
  document.getElementById('status-input').value = shipment.status;
  document.getElementById('location-input').value = shipment.currentLocation;
  document.getElementById('destination-input').value = shipment.destination;
  document.getElementById('eta-input').value = shipment.eta;
  document.getElementById('payment-status-input').value = shipment.paymentStatus;
  document.getElementById('balance-input').value = shipment.outstandingBalance;
  document.getElementById('notes-input').value = shipment.notes;
}

function resetForm() {
  document.getElementById('shipment-form').reset();
  document.getElementById('shipment-id').value = '';
}

function handleSave(event) {
  event.preventDefault();
  const shipments = getShipments();
  const id = document.getElementById('shipment-id').value;
  const formData = {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : `shipment-${Date.now()}`),
    trackingCode: document.getElementById('tracking-code-input').value.trim(),
    status: document.getElementById('status-input').value.trim(),
    currentLocation: document.getElementById('location-input').value.trim(),
    destination: document.getElementById('destination-input').value.trim(),
    eta: document.getElementById('eta-input').value.trim(),
    paymentStatus: document.getElementById('payment-status-input').value,
    outstandingBalance: document.getElementById('balance-input').value.trim(),
    notes: document.getElementById('notes-input').value.trim(),
    lastUpdated: new Date().toLocaleString(),
    shipmentValue: '$2,850,000',
    duties: '$64,000',
    equipment: SAMPLE_SHIPMENT.equipment,
    timeline: SAMPLE_SHIPMENT.timeline
  };

  const existingIndex = shipments.findIndex((shipment) => shipment.id === id);
  if (existingIndex >= 0) {
    shipments[existingIndex] = { ...shipments[existingIndex], ...formData };
  } else {
    shipments.unshift(formData);
  }

  saveShipments(shipments);
  renderTable(document.getElementById('search-input')?.value || '');
  updateStats();
  resetForm();
}

function handleDelete(id) {
  const shipments = getShipments().filter((shipment) => shipment.id !== id);
  saveShipments(shipments);
  renderTable(document.getElementById('search-input')?.value || '');
  updateStats();
}

function handleTracking(event) {
  event.preventDefault();
  const input = document.getElementById('tracking-code');
  const result = document.getElementById('tracking-result');
  const code = input.value.trim().toUpperCase();
  const shipments = getShipments();
  const shipment = shipments.find((entry) => entry.trackingCode.toUpperCase() === code);

  if (!shipment) {
    result.innerHTML = '<p><strong>Shipment not found.</strong></p>';
    return;
  }

  result.innerHTML = `
    <div class="shipment-summary">
      <div class="shipment-line"><strong>Shipment ID</strong><span>${shipment.id}</span></div>
      <div class="shipment-line"><strong>Tracking code</strong><span>${shipment.trackingCode}</span></div>
      <div class="shipment-line"><strong>Status</strong><span>${shipment.status}</span></div>
      <div class="shipment-line"><strong>Current location</strong><span>${shipment.currentLocation}</span></div>
      <div class="shipment-line"><strong>Destination</strong><span>${shipment.destination}</span></div>
      <div class="shipment-line"><strong>ETA</strong><span>${shipment.eta}</span></div>
      <div class="shipment-line"><strong>Shipment value</strong><span>${shipment.shipmentValue}</span></div>
      <div class="shipment-line"><strong>Duties, taxes & tariffs</strong><span>${shipment.duties}</span></div>
      <div class="notice-box">A portion of the duties, taxes, and tariffs must be paid in advance before customs clearance can proceed.</div>
      <div><strong>Equipment</strong><ul>${shipment.equipment.map((item) => `<li>${item}</li>`).join('')}</ul></div>
      <div class="shipment-line"><strong>Payment status</strong><span>${shipment.paymentStatus}</span></div>
      <div class="shipment-line"><strong>Outstanding balance</strong><span>${shipment.outstandingBalance}</span></div>
      <div class="shipment-line"><strong>Last updated</strong><span>${shipment.lastUpdated}</span></div>
      <div>
        <strong>Progress</strong>
        <div class="progress-track"><div class="progress-fill" style="width: 60%"></div></div>
      </div>
      <div>
        <strong>Timeline</strong>
        <div class="timeline">${shipment.timeline.map((step) => `<div class="timeline-step">${step}</div>`).join('')}</div>
      </div>
      <div><strong>Notes</strong><p>${shipment.notes}</p></div>
    </div>`;
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username')?.value;
  const password = document.getElementById('password')?.value;
  if (username === 'b4famek' && password === 'burna963') {
    window.location.href = 'admin-dashboard.html';
  } else {
    alert('Use b4famek / burna963 to access the dashboard.');
  }
}

function exportShipments() {
  const dataStr = JSON.stringify(getShipments(), null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'medbridge-shipments.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importShipments(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      saveShipments(imported);
      renderTable(document.getElementById('search-input')?.value || '');
      updateStats();
      alert('Shipment data imported successfully.');
    } catch (error) {
      alert('The selected file is not valid JSON.');
    }
  };
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'tracking') {
    document.getElementById('tracking-form')?.addEventListener('submit', handleTracking);
  }

  if (page === 'admin-login') {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  }

  if (page === 'admin-dashboard') {
    renderTable();
    updateStats();
    document.getElementById('shipment-form')?.addEventListener('submit', handleSave);
    document.getElementById('search-input')?.addEventListener('input', (event) => renderTable(event.target.value));
    document.getElementById('add-shipment-btn')?.addEventListener('click', resetForm);
    document.getElementById('export-data')?.addEventListener('click', exportShipments);
    document.getElementById('import-data')?.addEventListener('change', importShipments);

    document.getElementById('shipment-table-body')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.getAttribute('data-action');
      const id = button.getAttribute('data-id');
      const shipments = getShipments();
      if (action === 'edit') {
        const shipment = shipments.find((entry) => entry.id === id);
        if (shipment) fillForm(shipment);
      }
      if (action === 'delete') {
        handleDelete(id);
      }
    });
  }
});
