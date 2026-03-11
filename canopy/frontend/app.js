// CANOPY Zoo Management System - Frontend Application Logic

const API_BASE = '/api';

// ============ AUTH HELPERS ============
function getToken() {
    return localStorage.getItem('canopy_token');
}

function setToken(token) {
    localStorage.setItem('canopy_token', token);
}

function getAdmin() {
    const admin = localStorage.getItem('canopy_admin');
    return admin ? JSON.parse(admin) : null;
}

function setAdmin(admin) {
    localStorage.setItem('canopy_admin', JSON.stringify(admin));
}

function logout() {
    localStorage.removeItem('canopy_token');
    localStorage.removeItem('canopy_admin');
    window.location.href = 'admin-login.html';
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// ============ API HELPERS ============
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

async function getAnimals() {
    return apiFetch('/animals');
}

async function getAnimal(id) {
    return apiFetch(`/animals/${id}`);
}

async function addAnimal(animalData) {
    return apiFetch('/animals', {
        method: 'POST',
        body: JSON.stringify(animalData)
    });
}

async function updateAnimal(id, animalData) {
    return apiFetch(`/animals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(animalData)
    });
}

async function updateAnimalCount(id, count, image_url) {
    const body = { count };
    if (image_url !== undefined) body.image_url = image_url;
    return apiFetch(`/animals/update-count/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

async function deleteAnimal(id) {
    return apiFetch(`/animals/${id}`, {
        method: 'DELETE'
    });
}

async function loginAdmin(username, password) {
    const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    setAdmin(data.admin);
    return data;
}

// ============ TOAST SYSTEM ============
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============ UTILITY HELPERS ============
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Dynamic image generation — uses custom image_url if provided, otherwise fetches from loremflickr
function getAnimalImage(animalName, imageUrl) {
    if (imageUrl && imageUrl.length > 0) return imageUrl;
    const slug = animalName.toLowerCase().replace(/\s+/g, '-');
    return `https://loremflickr.com/800/500/${slug}`;
}

function getStatusBadge(animalName) {
    const statuses = ['Active', 'Stable', 'Monitoring', 'Endangered'];
    const colors = {
        'Active': 'bg-green-100 text-green-700',
        'Stable': 'bg-blue-100 text-blue-700',
        'Monitoring': 'bg-yellow-100 text-yellow-700',
        'Endangered': 'bg-red-100 text-red-700'
    };
    // Generate consistent status based on animal name hash
    let hash = 0;
    for (let i = 0; i < animalName.length; i++) hash = animalName.charCodeAt(i) + ((hash << 5) - hash);
    const status = statuses[Math.abs(hash) % statuses.length];
    return { status, colorClass: colors[status] };
}

// ============ LOADING HELPER ============
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-overlay">
            <div class="spinner"></div>
            <span>Loading data...</span>
        </div>
    `;
}
