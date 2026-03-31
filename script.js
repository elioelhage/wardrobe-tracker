// ==========================================
// 1. SUPABASE DETAILS
// ==========================================
const SUPABASE_URL = 'https://tgzewfruxpiclsvoqezr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wJQ92Wo3KtH2zN9n14Dw_w_2lZQ0dhZ';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. APP STATE & HTML ELEMENTS
// ==========================================
const shirtList = document.getElementById('shirtList');
const shirtDetail = document.getElementById('shirtDetail');
const formTitle = document.getElementById('formTitle');
const dynamicFieldGroup = document.getElementById('dynamicFieldGroup');

// Modal Elements
const formModal = document.getElementById('formModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const addShirtBtn = document.getElementById('addShirtBtn');
const itemCategorySelect = document.getElementById('itemCategorySelect');

// Form Inputs
const imageInput = document.getElementById('shirtImage');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const uploadText = document.getElementById('uploadText');
const ratingSlider = document.getElementById('ratingSlider');
const ratingBadgePreview = document.getElementById('ratingBadgePreview');

// UI Elements
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchCollapse = document.getElementById('searchCollapse');
const searchInput = document.getElementById('searchInput');
const analyticsBtn = document.getElementById('analyticsBtn');
const analyticsModal = document.getElementById('analyticsModal');
const closeAnalyticsBtn = document.getElementById('closeAnalyticsBtn');

// Rating Variables
const sliderValues = ['D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S'];
const ratingOrder = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'];

const colorMap = {
    'S': 'linear-gradient(135deg, #a855f7, #7e22ce)',
    'A+': 'linear-gradient(135deg, #10b981, #047857)',
    'A': 'linear-gradient(135deg, #34d399, #059669)',
    'A-': 'linear-gradient(135deg, #6ee7b7, #10b981)',
    'B+': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'B': 'linear-gradient(135deg, #60a5fa, #2563eb)',
    'B-': 'linear-gradient(135deg, #93c5fd, #3b82f6)',
    'C+': 'linear-gradient(135deg, #f59e0b, #b45309)',
    'C': 'linear-gradient(135deg, #fb923c, #ea580c)',
    'C-': 'linear-gradient(135deg, #fdba74, #f97316)',
    'D': 'linear-gradient(135deg, #ef4444, #b91c1c)'
};

let allShirts = []; 
let shirts = [];    
let editingId = null;
let currentActiveTab = 'All'; 
let tabsExpanded = false;

const mainCategories = ['All', 'Shirts', 'Hoodies', 'Pants', 'Shoes', 'Jackets'];

const categoryConfig = {
    Shirts: { singular: 'Shirt', fields: [{ key: 'category', label: 'Fit', placeholder: 'Fit (Optional)', options: ['Oversized', 'Regular', 'Tight'] }, { key: 'type', label: 'Type', placeholder: 'Type (Optional)', options: ['Graphic', 'Basic', 'Sporty'] }] },
    Hoodies: { singular: 'Hoodie', fields: [{ key: 'category', label: 'Fit', placeholder: 'Fit (Optional)', options: ['Oversized', 'Regular', 'Tight'] }, { key: 'type', label: 'Type', placeholder: 'Type (Optional)', options: ['Pullover', 'Zip-Up', 'Graphic', 'Basic'] }] },
    Pants: { singular: 'Pants', fields: [{ key: 'category', label: 'Fit', placeholder: 'Fit (Optional)', options: ['Slim', 'Regular', 'Relaxed', 'Loose'] }, { key: 'type', label: 'Style', placeholder: 'Style (Optional)', options: ['Jeans', 'Cargo', 'Chinos', 'Sweatpants', 'Shorts'] }] },
    Shoes: { singular: 'Shoe', fields: [{ key: 'type', label: 'Type', placeholder: 'Type (Optional)', options: ['Sneakers', 'Boots', 'Loafers', 'Dress Shoes', 'Sandals', 'Running'] }] },
    Jackets: { singular: 'Jacket', fields: [{ key: 'category', label: 'Fit', placeholder: 'Fit (Optional)', options: ['Oversized', 'Regular', 'Tight'] }, { key: 'type', label: 'Type', placeholder: 'Type (Optional)', options: ['Puffer', 'Denim', 'Leather', 'Bomber', 'Rain', 'Trench'] }] }
};

const listHeader = document.getElementById('listHeader');
const itemCount = document.getElementById('itemCount');
const toggleFilterBtn = document.getElementById('toggleFilterBtn');
const filterSortPanel = document.getElementById('filterSortPanel');
const sortSelect = document.getElementById('sortSelect');

const colorChipContainer = document.getElementById('colorChipContainer');
const fitChipContainer = document.getElementById('fitChipContainer');
const typeChipContainer = document.getElementById('typeChipContainer');
const colorFilterSection = document.getElementById('colorFilterSection');
const fitFilterSection = document.getElementById('fitFilterSection');
const typeFilterSection = document.getElementById('typeFilterSection');

const categoryTabs = document.getElementById('categoryTabs');
const categoryDrawer = document.getElementById('categoryDrawer');
const categoryToggleBtn = document.getElementById('categoryToggleBtn');

let activeColorFilters = new Set();
let activeFitFilters = new Set();
let activeTypeFilters = new Set();
let currentSortMode = 'ratingDesc';
let searchQuery = '';

// ==========================================
// 3. HELPERS
// ==========================================
function getRatingClass(rating) {
    if (!rating) return 'rating-D';
    return 'rating-' + rating.replace('-', '-minus').replace('+', '-plus');
}

function escapeHtml(text) {
    return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function getCurrentConfig() { 
    return categoryConfig[itemCategorySelect.value] || categoryConfig.Shirts; 
}

function updateSliderPreview() {
    const rating = sliderValues[parseInt(ratingSlider.value, 10)];
    ratingBadgePreview.textContent = rating;
    ratingBadgePreview.className = `rating-badge ${getRatingClass(rating)}`;
}

function updateFormTitle() {
    const singular = getCurrentConfig().singular;
    formTitle.textContent = editingId ? 'Edit Item' : `Add a New ${singular}`;
}

function renderDynamicFields(existingValues = {}) {
    const config = getCurrentConfig();
    dynamicFieldGroup.innerHTML = config.fields.map(field => {
        const optionsHtml = [ `<option value="" selected>${field.placeholder}</option>`, ...field.options.map(opt => `<option value="${escapeHtml(opt)}" ${existingValues[field.key] === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`) ].join('');
        return `<div class="dynamic-field"><label class="field-label" for="field-${field.key}">${escapeHtml(field.label)}</label><select id="field-${field.key}" class="dynamic-select">${optionsHtml}</select></div>`;
    }).join('');
}

function getDynamicFieldValues() {
    const config = getCurrentConfig();
    const values = {};
    config.fields.forEach(field => {
        const el = document.getElementById(`field-${field.key}`);
        values[field.key] = el ? el.value.trim() : '';
    });
    return values;
}

function resetImageUI() {
    imageInput.value = '';
    imagePreview.src = '';
    imagePreviewContainer.style.display = 'none';
    uploadText.textContent = '📁 Choose Image (Required)';
}

function clearInputs() {
    const nameInput = document.getElementById('shirtName');
    if (nameInput) nameInput.value = '';
    ratingSlider.value = 5;
    updateSliderPreview();
    resetImageUI();
    editingId = null;
    renderDynamicFields();
    updateFormTitle();
}

// ==========================================
// 4. HEADER ACTIONS & TABS
// ==========================================
searchToggleBtn.addEventListener('click', () => {
    searchCollapse.classList.toggle('show');
    if (searchCollapse.classList.contains('show')) searchInput.focus();
});

itemCategorySelect.addEventListener('change', () => {
    renderDynamicFields();
    updateFormTitle();
});

function renderTabs() {
    if (!categoryTabs || !categoryDrawer || !categoryToggleBtn) return;
    categoryTabs.innerHTML = '';
    categoryDrawer.innerHTML = '';

    const activeTabButton = document.createElement('button');
    activeTabButton.className = 'category-tab active';
    activeTabButton.textContent = currentActiveTab;
    activeTabButton.addEventListener('click', () => { tabsExpanded = !tabsExpanded; renderTabs(); });
    categoryTabs.appendChild(activeTabButton);

    mainCategories.filter(cat => cat !== currentActiveTab).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-tab';
        btn.textContent = cat;
        btn.addEventListener('click', () => {
            currentActiveTab = cat; tabsExpanded = false; 
            activeColorFilters.clear(); activeFitFilters.clear(); activeTypeFilters.clear();
            currentSortMode = 'ratingDesc'; if (sortSelect) sortSelect.value = 'ratingDesc';
            renderTabs(); fetchShirts();
        });
        categoryDrawer.appendChild(btn);
    });

    categoryDrawer.classList.toggle('show', tabsExpanded);
    categoryToggleBtn.textContent = tabsExpanded ? 'Hide All' : `+${mainCategories.length - 1} More`;
}
categoryToggleBtn?.addEventListener('click', () => { tabsExpanded = !tabsExpanded; renderTabs(); });

// ==========================================
// 5. FILTER & SORT
// ==========================================
if (toggleFilterBtn) { toggleFilterBtn.addEventListener('click', () => { filterSortPanel.classList.toggle('show'); toggleFilterBtn.classList.toggle('active'); }); }
if (sortSelect) { sortSelect.addEventListener('change', (e) => { currentSortMode = e.target.value; renderList(); }); }

function renderFilters() {
    colorChipContainer.innerHTML = '';
    fitChipContainer.innerHTML = '';
    typeChipContainer.innerHTML = '';
    
    const config = currentActiveTab !== 'All' ? categoryConfig[currentActiveTab] : null;
    const hasFit = config ? config.fields.some(f => f.key === 'category') : false;
    const hasType = config ? config.fields.some(f => f.key === 'type') : false;

    const uniqueColors = new Set();
    const uniqueFits = new Set();
    const uniqueTypes = new Set();
    
    shirts.forEach(s => { 
        if (s.color && s.color.trim() !== '') uniqueColors.add(s.color.trim()); 
        if (hasFit && s.category && s.category.trim() !== '') uniqueFits.add(s.category.trim()); 
        if (hasType && s.type && s.type.trim() !== '') uniqueTypes.add(s.type.trim()); 
    });
    
    renderChips(uniqueColors, activeColorFilters, colorChipContainer, colorFilterSection);
    
    if (hasFit) renderChips(uniqueFits, activeFitFilters, fitChipContainer, fitFilterSection);
    else fitFilterSection.style.display = 'none';

    if (hasType) renderChips(uniqueTypes, activeTypeFilters, typeChipContainer, typeFilterSection);
    else typeFilterSection.style.display = 'none';
}

function renderChips(uniqueSet, activeSet, container, sectionEl) {
    if (uniqueSet.size === 0) { sectionEl.style.display = 'none'; return; }
    sectionEl.style.display = 'block';
    
    Array.from(uniqueSet).sort().forEach(val => {
        const chip = document.createElement('div');
        chip.className = `color-chip ${activeSet.has(val) ? 'active' : ''}`;
        chip.textContent = val;
        chip.addEventListener('click', () => {
            if (activeSet.has(val)) { activeSet.delete(val); chip.classList.remove('active'); } 
            else { activeSet.add(val); chip.classList.add('active'); }
            renderList();
        });
        container.appendChild(chip);
    });
}

// ==========================================
// 6. DATA FETCH + RENDER
// ==========================================
async function fetchShirts() {
    listHeader.style.display = 'none';
    filterSortPanel.classList.remove('show');
    if (toggleFilterBtn) toggleFilterBtn.classList.remove('active');

    shirtList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 18px;">Loading ${currentActiveTab}...</p>`;

    const { data, error } = await supabaseClient.from('shirts').select('*');
    if (error) { shirtList.innerHTML = '<p style="padding: 20px; color: red;">Error loading wardrobe.</p>'; return; }

    allShirts = data || [];
    
    allShirts.forEach(s => { if (!s.item_group) s.item_group = 'Shirts'; });
    
    if (currentActiveTab === 'All') {
        shirts = allShirts;
    } else {
        shirts = allShirts.filter(s => s.item_group === currentActiveTab);
    }
    
    renderFilters();
    renderList();
}

function renderList() {
    shirtList.innerHTML = '';
    if (shirts.length === 0) {
        listHeader.style.display = 'none';
        shirtList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 18px;">No ${currentActiveTab.toLowerCase()} found.</p>`;
        return;
    }

    let displayedShirts = shirts.filter(s => {
        if (activeColorFilters.size > 0 && (!s.color || !activeColorFilters.has(s.color.trim()))) return false;
        if (activeFitFilters.size > 0 && (!s.category || !activeFitFilters.has(s.category.trim()))) return false;
        if (activeTypeFilters.size > 0 && (!s.type || !activeTypeFilters.has(s.type.trim()))) return false;
        if (searchQuery && !(s.name || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    displayedShirts.sort((a, b) => {
        if (currentSortMode === 'ratingDesc') return ratingOrder.indexOf(a.rating) - ratingOrder.indexOf(b.rating);
        if (currentSortMode === 'ratingAsc') return ratingOrder.indexOf(b.rating) - ratingOrder.indexOf(a.rating);
        if (currentSortMode === 'nameAsc') return (a.name || '').localeCompare(b.name || '');
        return 0;
    });

    listHeader.style.display = 'flex';
    itemCount.textContent = `${displayedShirts.length} ${displayedShirts.length === 1 ? 'item' : 'items'}`;

    if (displayedShirts.length === 0) { shirtList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 18px;">No items match your selected filters.</p>`; return; }

    displayedShirts.forEach((shirt) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', shirt.id);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'shirt-info';
        nameSpan.textContent = shirt.name || 'Unnamed item';
        li.appendChild(nameSpan);

        const ratingSpan = document.createElement('span');
        ratingSpan.textContent = shirt.rating;
        ratingSpan.className = `rating-badge ${getRatingClass(shirt.rating)}`;
        li.appendChild(ratingSpan);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'item-options-container';

        const kebabBtn = document.createElement('button');
        kebabBtn.className = 'kebab-btn';
        kebabBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>`;

        const optionsMenu = document.createElement('div');
        optionsMenu.className = 'item-options-menu';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️ Edit';
        editBtn.className = 'item-option-btn';
        editBtn.addEventListener('click', (e) => { e.stopPropagation(); optionsMenu.classList.remove('show'); startEditing(shirt); });

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '🗑️ Delete';
        removeBtn.className = 'item-option-btn text-danger';
        removeBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); optionsMenu.classList.remove('show');
            if (confirm(`Are you sure you want to delete ${shirt.name}?`)) await deleteShirt(shirt.id, shirt.name);
        });

        kebabBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = optionsMenu.classList.contains('show');
            document.querySelectorAll('.item-options-menu.show').forEach(menu => menu.classList.remove('show'));
            if (!isOpen) optionsMenu.classList.add('show');
        });

        optionsMenu.appendChild(editBtn); optionsMenu.appendChild(removeBtn); optionsContainer.appendChild(kebabBtn); optionsContainer.appendChild(optionsMenu); li.appendChild(optionsContainer);
        li.addEventListener('click', () => showShirtDetail(shirt));
        shirtList.appendChild(li);
    });
}

// ==========================================
// 7. IMAGE PREVIEW & COLOR EXTRACTION
// ==========================================
imageInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
            uploadText.textContent = '🔄 Change Image';

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = e.target.result;
            img.onload = () => {
                if (typeof ColorThief !== 'undefined') {
                    const colorThief = new ColorThief();
                    const dominantColor = colorThief.getColor(img);
                    const colorName = rgbToColorName(dominantColor[0], dominantColor[1], dominantColor[2]);
                    if (colorName) {
                        const colorSelect = document.getElementById('shirtColor');
                        const option = Array.from(colorSelect.options).find(opt => opt.value === colorName);
                        if (option) option.selected = true;
                    }
                }
            };
        };
        reader.readAsDataURL(this.files[0]);
    }
});

function rgbToColorName(r, g, b) {
    if (r < 50 && g < 50 && b < 50) return 'Black';
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return (r > 150) ? 'Gray' : 'Black';
    if (r > 150 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 150 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 150) return 'Blue';
    if (r > 200 && g > 150 && b < 100) return 'Yellow';
    if (r > 150 && g > 100 && b > 150) return 'Purple';
    if (r > 200 && g > 150 && b > 150) return 'Pink';
    if (r > 150 && g > 100 && b < 50) return 'Orange';
    if (r > 100 && g > 100 && b < 50) return 'Brown';
    if (r > 200 && g > 200 && b < 150) return 'Beige';
    return null;
}

// ==========================================
// 8. ADD / UPDATE LOGIC
// ==========================================
addShirtBtn.addEventListener('click', async () => {
    if (!editingId && (!imageInput.files || imageInput.files.length === 0)) {
        alert('Please select an image! It is required to add an item.');
        return;
    }

    const nameInput = document.getElementById('shirtName');
    if (!nameInput) return;

    let name = nameInput.value.trim();
    const rating = sliderValues[parseInt(ratingSlider.value, 10)];
    const color = document.getElementById('shirtColor').value.trim();
    const dynamicValues = getDynamicFieldValues();
    const category = dynamicValues.category || '';
    const type = dynamicValues.type || '';
    const selectedGroup = itemCategorySelect.value;

    if (!name) {
        const singularTab = categoryConfig[selectedGroup].singular;
        let maxNum = 0;
        allShirts.forEach(s => {
            const regex = new RegExp(`^${singularTab} (\\d+)$`, 'i');
            const match = (s.name || '').match(regex);
            if (match) { const num = parseInt(match[1], 10); if (num > maxNum) maxNum = num; }
        });
        name = `${singularTab} ${maxNum + 1}`;
    }

    if (!rating) return alert('Please select a rating tier!');

    addShirtBtn.textContent = editingId ? 'Updating...' : 'Uploading...';
    addShirtBtn.disabled = true;

    let imageUrl = 'https://via.placeholder.com/400x500?text=No+Image';

    try {
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabaseClient.storage.from('wardrobe-images').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabaseClient.storage.from('wardrobe-images').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        } else if (editingId) {
            const existingItem = allShirts.find(s => s.id === editingId);
            imageUrl = existingItem?.image_url || imageUrl;
        }

        const itemData = { name, rating, category, type, color, item_group: selectedGroup, image_url: imageUrl };
        if (!editingId) itemData.wears_since_wash = 0; 

        if (editingId) {
            const { error: updateError } = await supabaseClient.from('shirts').update(itemData).eq('id', editingId);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabaseClient.from('shirts').insert([itemData]);
            if (insertError) throw insertError;
        }

        formModal.classList.remove('show');
        clearInputs();
        await fetchShirts();

        const updatedItem = allShirts.find(s => s.name === name);
        if (updatedItem && (shirtDetail.querySelector('h2')?.textContent === name || editingId)) {
            showShirtDetail(updatedItem);
        }
    } catch (error) {
        console.error('Error saving:', error);
        alert('There was an error saving your item.');
    } finally {
        addShirtBtn.textContent = 'Save Item';
        addShirtBtn.disabled = false;
    }
});

async function deleteShirt(id, name) {
    const { error } = await supabaseClient.from('shirts').delete().eq('id', id);
    if (!error) {
        if (shirtDetail.querySelector('.desktop-hidden')?.textContent === name || shirtDetail.querySelector('.mobile-hidden')?.textContent === name) {
            shirtDetail.innerHTML = '<div class="empty-state"><p>Select an item from your wardrobe to view its details</p></div>';
            shirtDetail.classList.remove('active');
        }
        await fetchShirts();
    }
}

function startEditing(shirt) {
    itemCategorySelect.value = shirt.item_group || 'Shirts';
    
    document.getElementById('shirtName').value = shirt.name || '';

    const ratingIndex = sliderValues.indexOf(shirt.rating);
    ratingSlider.value = ratingIndex !== -1 ? ratingIndex : 5;
    updateSliderPreview();

    renderDynamicFields({ category: shirt.category || '', type: shirt.type || '' });

    const categoryInput = document.getElementById('field-category');
    const typeInput = document.getElementById('field-type');
    if (categoryInput) categoryInput.value = shirt.category || '';
    if (typeInput) typeInput.value = shirt.type || '';
    document.getElementById('shirtColor').value = shirt.color || '';

    if (shirt.image_url) {
        imagePreview.src = shirt.image_url;
        imagePreviewContainer.style.display = 'block';
        uploadText.textContent = '🔄 Change Image';
    } else {
        resetImageUI();
    }

    editingId = shirt.id;
    updateFormTitle();
    addShirtBtn.textContent = 'Update Item';
    formModal.classList.add('show');
}

function showShirtDetail(shirt) {
    const config = categoryConfig[shirt.item_group] || categoryConfig.Shirts;
    const categoryLabel = config.fields.find(f => f.key === 'category')?.label || 'Fit';
    const typeLabel = config.fields.find(f => f.key === 'type')?.label || 'Type';

    const categoryDisplay = (shirt.category && shirt.category.trim() !== '') ? `<p style="margin: 0 0 10px 0;"><strong>${escapeHtml(categoryLabel)}:</strong> <span style="float: right; color: var(--text-muted);">${escapeHtml(shirt.category)}</span></p>` : '';
    const typeDisplay = (shirt.type && shirt.type.trim() !== '') ? `<p style="margin: 0 0 10px 0;"><strong>${escapeHtml(typeLabel)}:</strong> <span style="float: right; color: var(--text-muted);">${escapeHtml(shirt.type)}</span></p>` : '';
    const colorDisplay = (shirt.color && shirt.color.trim() !== '') ? `<p style="margin: 0 0 10px 0;"><strong>Color:</strong> <span style="float: right; color: var(--text-muted);">${escapeHtml(shirt.color)}</span></p>` : '';

    shirtDetail.innerHTML = `
        <div class="mobile-detail-header">
            <button class="mobile-close-btn" onclick="document.getElementById('shirtDetail').classList.remove('active')">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <h2 class="desktop-hidden">${escapeHtml(shirt.name || 'Unnamed item')}</h2>
        </div>
        <h2 class="mobile-hidden">${escapeHtml(shirt.name || 'Unnamed item')}</h2>
        <div class="detail-content-wrapper">
            <div class="rating-badge detail-rating ${getRatingClass(shirt.rating)}">${escapeHtml(shirt.rating)}</div>
            <img src="${escapeHtml(shirt.image_url)}" alt="${escapeHtml(shirt.name || 'Item')}" onerror="this.src='https://via.placeholder.com/400x500?text=Error+Loading+Image';">
            
            <div class="wash-tracker">
                <div class="wash-info">
                    <span class="wash-count" id="wears-count-${shirt.id}">${shirt.wears_since_wash || 0}</span>
                    <span class="wash-label">Wears since wash</span>
                </div>
                <div class="wash-actions">
                    <button class="btn-wear" id="btn-wear-${shirt.id}">+ Wear</button>
                    <button class="btn-wash" id="btn-wash-${shirt.id}">🧼 Washed</button>
                </div>
            </div>

            <div class="detail-card">
                ${categoryDisplay}
                ${typeDisplay}
                ${colorDisplay}
            </div>
        </div>
    `;

    document.getElementById(`btn-wear-${shirt.id}`)?.addEventListener('click', async () => {
        const newWears = (shirt.wears_since_wash || 0) + 1;
        shirt.wears_since_wash = newWears;
        document.getElementById(`wears-count-${shirt.id}`).textContent = newWears;
        await supabaseClient.from('shirts').update({ wears_since_wash: newWears }).eq('id', shirt.id);
    });

    document.getElementById(`btn-wash-${shirt.id}`)?.addEventListener('click', async () => {
        shirt.wears_since_wash = 0;
        document.getElementById(`wears-count-${shirt.id}`).textContent = 0;
        await supabaseClient.from('shirts').update({ wears_since_wash: 0 }).eq('id', shirt.id);
    });

    if (window.innerWidth <= 1024) shirtDetail.classList.add('active');
}

// ==========================================
// 9. MODAL CONTROLS
// ==========================================
openModalBtn.addEventListener('click', () => { 
    clearInputs(); 
    itemCategorySelect.value = currentActiveTab === 'All' ? 'Shirts' : currentActiveTab;
    renderDynamicFields(); 
    updateFormTitle(); 
    formModal.classList.add('show'); 
});
closeModalBtn.addEventListener('click', () => { formModal.classList.remove('show'); clearInputs(); });
formModal.addEventListener('click', (e) => { if (e.target === formModal) { formModal.classList.remove('show'); clearInputs(); } });

// ==========================================
// 10. THEME TOGGLE (TOP BAR)
// ==========================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

function updateThemeIcon(isDark) {
    if (isDark) {
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
}

if (localStorage.getItem('theme') === 'dark') { 
    document.body.classList.add('dark-mode'); 
    updateThemeIcon(true);
} else {
    updateThemeIcon(false);
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    updateThemeIcon(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


// ==========================================
// 11. AUTHENTICATION
// ==========================================
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authMessage = document.getElementById('authMessage');

async function checkUser() { const { data: { session } } = await supabaseClient.auth.getSession(); if (session) showApp(); else showLogin(); }
function showApp() { authContainer.style.display = 'none'; appContainer.style.display = 'grid'; renderTabs(); fetchShirts(); }
function showLogin() { authContainer.style.display = 'flex'; appContainer.style.display = 'none'; }

document.getElementById('signupBtn').addEventListener('click', async () => {
    authMessage.style.color = 'var(--text-muted)'; authMessage.textContent = 'Creating account...';
    const { error } = await supabaseClient.auth.signUp({ email: emailInput.value, password: passwordInput.value, options: { emailRedirectTo: window.location.origin } });
    if (error) { 
        authMessage.style.color = 'var(--danger)'; authMessage.textContent = error.message; 
    } else { 
        authMessage.style.color = '#10b981'; 
        authMessage.textContent = 'Account created successfully! You can now log in.'; 
    }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    authMessage.style.color = 'var(--text-muted)'; authMessage.textContent = 'Logging in...';
    const { error } = await supabaseClient.auth.signInWithPassword({ email: emailInput.value, password: passwordInput.value });
    if (error) { authMessage.style.color = 'var(--danger)'; authMessage.textContent = error.message; } else { emailInput.value = ''; passwordInput.value = ''; authMessage.textContent = ''; showApp(); }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut(); shirtList.innerHTML = ''; shirtDetail.innerHTML = '<div class="empty-state"><p>Select an item from your wardrobe to view its details</p></div>'; showLogin();
});

// ==========================================
// 12. SEARCH
// ==========================================
searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderList(); });

// ==========================================
// 13. ANALYTICS
// ==========================================
analyticsBtn.addEventListener('click', () => { updateAnalytics(); analyticsModal.classList.add('show'); });
closeAnalyticsBtn.addEventListener('click', () => analyticsModal.classList.remove('show'));
analyticsModal.addEventListener('click', (e) => { if (e.target === analyticsModal) analyticsModal.classList.remove('show'); });

function updateAnalytics() {
    const total = allShirts.length; const ratingCounts = {}; const colorCounts = {};
    allShirts.forEach(s => { ratingCounts[s.rating] = (ratingCounts[s.rating] || 0) + 1; if (s.color && s.color.trim()) colorCounts[s.color] = (colorCounts[s.color] || 0) + 1; });
    document.getElementById('analyticsStats').innerHTML = `
        <div class="stat-card"><div class="stat-title">Total Items: ${total}</div></div>
        <div class="stat-card">
            <div class="stat-title">Rating Distribution</div>
            <div class="rating-bars">
                ${ratingOrder.map(r => { 
                    const count = ratingCounts[r] || 0; 
                    const percent = total ? (count / total * 100) : 0; 
                    const barColor = colorMap[r] || 'var(--primary)';
                    return `<div class="rating-bar"><span class="rating-label" style="width: 45px; font-weight: bold;">${r}</span><div class="bar"><div class="bar-fill" style="width: ${percent}%; background: ${barColor};"></div></div><span>${count}</span></div>`; 
                }).join('')}
            </div>
        </div>
        <div class="stat-card"><div class="stat-title">Color Distribution</div><div class="color-list">${Object.entries(colorCounts).map(([color, count]) => `<span class="color-item">${color} (${count})</span>`).join('')}</div></div>
    `;
}

// ==========================================
// 14. KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchCollapse.classList.add('show'); searchInput.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openModalBtn.click(); }
    if (e.key === 'Escape') {
        if (formModal.classList.contains('show')) formModal.classList.remove('show');
        if (analyticsModal.classList.contains('show')) analyticsModal.classList.remove('show');
        if (filterSortPanel.classList.contains('show')) filterSortPanel.classList.remove('show');
        if (searchCollapse.classList.contains('show')) searchCollapse.classList.remove('show');
    }
});

// ==========================================
// 15. INITIAL SETUP
// ==========================================
ratingSlider.addEventListener('input', updateSliderPreview);
renderTabs(); renderDynamicFields(); updateSliderPreview(); updateFormTitle(); checkUser();