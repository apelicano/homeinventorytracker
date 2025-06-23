const firebaseConfig = {
  apiKey: "AIzaSyBpCw-2-e8rR-4hZGE32-Ug6KJJcKSHnn8",
  authDomain: "family-chore-tracker-db5b2.firebaseapp.com",
  databaseURL: "https://family-chore-tracker-db5b2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "family-chore-tracker-db5b2",
  storageBucket: "family-chore-tracker-db5b2.appspot.com",
  messagingSenderId: "1021277258690",
  appId: "1:1021277258690:web:2bd82da2661448fc800c5b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const inventoryRef = db.ref("inventoryItems");

let inventoryList = [];
let showTimestamps = false;
let currentCategoryFilter = "All";
let showArchived = false;

firebase.auth().signInAnonymously()
  .then(() => {
    console.log("✅ Signed in anonymously");
    initApp();
  })
  .catch(error => {
    console.error("❌ Sign-in failed:", error);
  });

const inventoryForm = document.getElementById('inventory-form');
const inventoryListDiv = document.getElementById('inventory-list');
const categorySelect = document.getElementById('item-category');
const filterSelect = document.getElementById('filter-category');
const toggleArchivedBtn = document.getElementById('toggle-archived-btn');

function initApp() {
  const savedToggle = localStorage.getItem('showTimestamps');
  if (savedToggle) showTimestamps = savedToggle === 'true';

  const checkbox = document.getElementById('toggle-timestamp-checkbox');
  if (checkbox) checkbox.checked = showTimestamps;

  inventoryRef.on('value', snapshot => {
    const data = snapshot.val();
    inventoryList = data ? Object.values(data) : [];
    updateCategoryFilterOptions();
    renderInventoryList();
  });

  setupEventListeners();
}

function setupEventListeners() {
  inventoryForm.addEventListener('submit', e => {
    e.preventDefault();
    addNewItem();
  });

  const timestampCheckbox = document.getElementById('toggle-timestamp-checkbox');
  if (timestampCheckbox) {
    timestampCheckbox.addEventListener('change', () => {
      showTimestamps = timestampCheckbox.checked;
      localStorage.setItem('showTimestamps', showTimestamps);
      renderInventoryList();
    });
  }

  const clearAllBtn = document.getElementById('clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllItems);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      currentCategoryFilter = filterSelect.value;
      renderInventoryList();
    });
  }

  if (toggleArchivedBtn) {
    toggleArchivedBtn.addEventListener('click', () => {
      showArchived = !showArchived;
      toggleArchivedBtn.textContent = showArchived ? 'Hide Archived Items' : 'Show Archived Items';
      renderInventoryList();
    });
  }
}

function addNewItem() {
  const name = document.getElementById('item-name').value.trim();
  const description = document.getElementById('item-description').value.trim();
  const quantity = parseFloat(document.getElementById('item-quantity').value);
  const unit = document.getElementById('item-unit').value;
  const category = categorySelect.value;

  if (!name || !description || isNaN(quantity)) {
    showToast("❌ All fields required");
    return;
  }

  const newItem = {
    id: Date.now(),
    name,
    description,
    quantity,
    unit,
    category,
    timestamp: new Date().toISOString(),
    archived: false
  };

  inventoryRef.child(newItem.id).set(newItem)
    .then(() => {
      inventoryForm.reset();
      showToast("✅ Item added");
    })
    .catch(err => {
      console.error("Add failed:", err);
      showToast("❌ Could not add item");
    });
}

function renderInventoryList() {
  inventoryListDiv.innerHTML = '<h2>Inventory</h2>';

  const filtered = inventoryList.filter(item =>
    (currentCategoryFilter === "All" || item.category === currentCategoryFilter) &&
    (showArchived || !item.archived)
  );

  const hasVisible = filtered.length > 0;
  const timestampWrapper = document.getElementById('timestamp-toggle-wrapper');
  if (timestampWrapper) {
    timestampWrapper.style.display = hasVisible ? 'block' : 'none';
  }

  if (!hasVisible) {
    inventoryListDiv.innerHTML += `<p>No items to show.</p>`;
    return;
  }

  filtered.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'chore-item'; // reuse CSS class

    const titleElem = document.createElement('h3');
    titleElem.textContent = `${item.name} (${item.quantity} ${item.unit})`;
    if (item.archived) {
      const label = document.createElement('span');
      label.textContent = ' [Archived]';
      label.style.color = '#888';
      label.style.fontSize = '0.9rem';
      titleElem.appendChild(label);
    }
    itemDiv.appendChild(titleElem);

    const descElem = document.createElement('p');
    descElem.innerHTML = sanitizeHTML(item.description).replace(/\n/g, "<br>");
    itemDiv.appendChild(descElem);

    if (showTimestamps && item.timestamp) {
      const timeElem = document.createElement('p');
      timeElem.textContent = 'Added: ' + new Date(item.timestamp).toLocaleString();
      timeElem.classList.add('timestamp');
      itemDiv.appendChild(timeElem);
    }

    if (!item.archived) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => editItem(item.id);
      itemDiv.appendChild(editBtn);
    }

    const archiveBtn = document.createElement('button');
    archiveBtn.textContent = item.archived ? 'Unarchive' : 'Archive';
    archiveBtn.style.marginLeft = '5px';
    archiveBtn.onclick = () => toggleArchiveItem(item.id, !item.archived);
    itemDiv.appendChild(archiveBtn);

    inventoryListDiv.appendChild(itemDiv);
  });
}

function editItem(itemId) {
  const item = inventoryList.find(i => i.id === itemId);
  if (!item) return;

  const newName = prompt("Edit name:", item.name);
  const newDesc = prompt("Edit description:", item.description);
  const newQty = prompt("Edit quantity:", item.quantity);
  const newUnit = prompt("Edit unit:", item.unit);
  const newCategory = prompt("Edit category:", item.category);

  if ([newName, newDesc, newQty, newUnit, newCategory].some(v => v === null)) return;

  const updated = {
    ...item,
    name: newName.trim(),
    description: newDesc.trim(),
    quantity: parseFloat(newQty),
    unit: newUnit.trim(),
    category: newCategory.trim()
  };

  inventoryRef.child(itemId).set(updated)
    .then(() => showToast("✅ Item updated"))
    .catch(err => {
      console.error("Update error:", err);
      showToast("❌ Failed to update item");
    });
}

function toggleArchiveItem(itemId, isArchived) {
  inventoryRef.child(itemId).update({ archived: isArchived })
    .then(() => showToast(isArchived ? "✅ Item archived" : "✅ Item unarchived"))
    .catch(err => {
      console.error("Archive toggle failed:", err);
      showToast("❌ Failed to update archive state");
    });
}

function clearAllItems() {
  if (!confirm('Clear all items? This will archive them.')) return;

  const updates = {};
  inventoryList.forEach(item => {
    updates[`${item.id}/archived`] = true;
  });

  inventoryRef.update(updates)
    .then(() => {
      inventoryList = inventoryList.map(item => ({ ...item, archived: true }));
      showTimestamps = false;
      localStorage.setItem('showTimestamps', 'false');
      renderInventoryList();
      updateCategoryFilterOptions();
      showToast("All items archived");
    })
    .catch(err => {
      console.error("Archive error:", err);
      showToast("❌ Failed to archive items");
    });
}

function updateCategoryFilterOptions() {
  const categories = Array.from(new Set(inventoryList.map(i => i.category))).sort();
  filterSelect.innerHTML = `<option value="All">All</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function showToast(msg = "Action done") {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function sanitizeHTML(input) {
  const allowed = { 'A': ['href', 'target'], 'EM': [], 'STRONG': [] };
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tag = node.tagName.toUpperCase();
    if (!allowed[tag]) {
      const frag = document.createDocumentFragment();
      node.childNodes.forEach(c => {
        const n = clean(c);
        if (n) frag.appendChild(n);
      });
      return frag;
    }

    const el = document.createElement(tag);
    allowed[tag].forEach(attr => {
      if (node.hasAttribute(attr)) {
        el.setAttribute(attr, node.getAttribute(attr));
      }
    });
    node.childNodes.forEach(c => {
      const n = clean(c);
      if (n) el.appendChild(n);
    });
    return el;
  }

  const result = document.createDocumentFragment();
  doc.body.childNodes.forEach(n => {
    const cleaned = clean(n);
    if (cleaned) result.appendChild(cleaned);
  });

  const container = document.createElement('div');
  container.appendChild(result);
  return container.innerHTML;
}
