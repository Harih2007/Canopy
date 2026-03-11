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

async function updateAnimalCount(id, count) {
    return apiFetch(`/animals/update-count/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ count })
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

function getAnimalImage(animalName) {
    const images = {
        'Lion': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqMnXlNcMb7YWQAgTz78rzSPeanq2flPkGix9QAIouXabrObkerjRycGgz9OTKMf_qeNPFAqLVTIt8vxVgKkyTFjTb6V7ql8gu9HFjWr9TwalDcdmfUCvUryCCM0n8aXqOP1PpTEf0n7sDOXYngaHLpbdAKeWjGQTHQhyckvI44ZhUCp4rWq5DRy87Wwsxt_7L1E4-rRU4VqbSvtiLoRGJzGT0GeNHEyjEa_4tAoRy6hA9F7vsloePXr5NDgQE_vZwzejwUNQ3YTw',
        'Tiger': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVyL7VKax_bWf8213seFVT0LLLxslgzqv73buM6TRJbIEjx40H5PPj-kjLDMz3SSpTn7MoJxnXawomC4QNAvHz6yMZpVem1BmNtl-yrJdZ_gAhPfTVDcq_0bj04GM6AU8SCRmz2YKh0jDkeqP7r6j9ZdYhrKa8ZgFiWGOyJnOVfZXeL13f9w4rsVbF7VJXMLU_9yEAOWa39AsPFSogtxmMkjREjPkreqpVnU0ElAyuvqTcXOYKDxbjpNzsISSK4yFSeESoOHG3eak',
        'Elephant': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTZ_vSZ_8OAwLjZlNSr1d0XMVYE8fcumHKKrT2CvonAo8l8Xl39BgTRlclit46kO38NMzCCKgKvtM9RJ6jAu88ObkCMufMHr3VGDcH3vFQ1WRHB9jdr0QhVJMbRVRxWmVesR3zhciqhQRgewWi0lkvzLqcUsb6-eGz6dKloLuRfUbjoAgkAl6FZiIA6_0ekhWP4O-f5bj53hPdj1y0rIdR78BwmSrMEfyJsbKlpIpJp9xXV0u0sj1sSa4l21KQHNrQUXdOeztZ0cY',
        'Zebra': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpEyOY2PdVwCRIDA36EXVCJfnqVcAxezDSfySu3a2_-L-7RmV7mfXLvksknrDrMY1go-tqVGV6Sghl9fp1lddGvwuwMHMLI-puHAfyuSYCZAtuMcPbU2Fe7m3-vhyvet981G5FWS876NyxEG6IAwunOq_DGVJAjCuyqz4mVSWVBWROUZLHjI_L_Cm_XGt_SNip3A961hNeJasZcBThEnya3CFju2_j5O5SBXn7Z9S0B-9mvbyB_iXKe50uICyEurJ9gJbqDN7gqVA',
        'Giraffe': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpEyOY2PdVwCRIDA36EXVCJfnqVcAxezDSfySu3a2_-L-7RmV7mfXLvksknrDrMY1go-tqVGV6Sghl9fp1lddGvwuwMHMLI-puHAfyuSYCZAtuMcPbU2Fe7m3-vhyvet981G5FWS876NyxEG6IAwunOq_DGVJAjCuyqz4mVSWVBWROUZLHjI_L_Cm_XGt_SNip3A961hNeJasZcBThEnya3CFju2_j5O5SBXn7Z9S0B-9mvbyB_iXKe50uICyEurJ9gJbqDN7gqVA',
        'Bear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaZ5qeKsipGE6N5uIrfvRzuUx9yrdmnKt2d_DhR0JcwgyLDul6rmN7FXdO0EY-vKjgA07Uc5y2lXJMTp2-SPUK9mkS6z0zy_v19xxAa27eJix2q9Ugt-EVXZLOelxkmwF3xOgTb2CGec1WOm_8gylypYL1Ct-iAZhM8UatRNLnRwGa-BdogPZQCmj06ZtD7iz3hAaXnJmI8t3iYhrwP2QtMQRaqdqCmE9tOEPkGwKJLrn-JXVil9KGoGcV40sidoumEvP-eZDv3fk',
        'Monkey': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE2qGCv2fQg5nehZJptYrPDAuEON6hlMo0puKD33OCj8EEFytyc-g1RKuuL3oA83d_oR37xZ8Xs-WPEHZfsZ0tMfaarmHC0ZbN77sgcCwX32-9TccOLcXXff_KhZJhH_jULZjlpokdPaf2H8MKsMT8bYtVEHAw-CALCpHX1O7H3LgLoGDUUs2SxuWB3HiUMIq-QE0lig2hkLwVhTCqvVfCyESUeDaL7LBVeP1QYo1XgxAZ-E2WeGILByTsDAweRlPOeOPbABUDKYc'
    };
    return images[animalName] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL7tXMCJjbEGHnU-UOfH6X3GTVsncs8YLWci2h3WR3XzhTyOGlXcanqBAikF0utx20UCEpi428PoNHGAaymAjg84mLmMlW2TppQORNd1bM_fVlwMAfUbmQ_xaC4FMFDGwK2VoUGk8cOZ8FYqIp9_ut39fLWeLn8aQxBH3Lc3q6N8ufkssrHArcoBXALDicbxKVBTdyzZRVsl7u03qDS5L_6U3msTs1yb88nCFZpgebIVFH_U_m8shIRM6mkB6KsRTzhZgYx4QNZS0';
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
