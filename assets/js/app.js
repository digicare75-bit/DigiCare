/**
 * Application Core Utilities and API Wrappers
 */

// API Configuration
// const API_BASE_URL = 'https://healthcare-wtyv.onrender.com/api'; // Replace with actual backend port if diff
const API_BASE_URL = 'https://healthcare-production-1245.up.railway.app/api'; // Replace with actual backend port if diff

/**
 * Toast Notification System
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300); // Wait for removing animation
    }, 5000);
}

/**
 * Form Button Helper
 */
function setButtonLoading(btn, isLoading, originalText = '') {
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Processing...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

/**
 * API Fetch Wrapper
 * @param {string} endpoint - API path e.g. /login
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        ...options.headers
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Common Functions accessible globally
 */
window.AuthAPI = {
    login: async (username, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    
    registerPatient: async (data) => {
        return apiCall('/auth/register/patient', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    registerDoctor: async (data) => {
        return apiCall('/auth/register/doctor', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    forgotPassword: async (email) => {
    return apiCall(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
    });
    },

    verifyEmail: async (email, otp) => {
    return apiCall(`/auth/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
        method: 'POST'
    });
    },

    resetPassword: async (email, otp, newPassword) => {
        return apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword })
        });
    },

    resendOtp: async (email) => {
    return apiCall(`/auth/resend-otp?email=${encodeURIComponent(email)}`, {
        method: 'POST'
    });
    }
};

window.PatientAPI = {
    getProfile: async () => {
        return apiCall('/patients/profile', {
            method: 'GET'
        });
    },
    
    updateProfile: async (data) => {
        return apiCall('/patients/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    addRecord: async (data) => {
        return apiCall('/patients/records', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getPatientProfile: async (userId) => {
        return apiCall(`/patients/${userId}/profile`, {
            method: 'GET'
        });
    }
};

window.DoctorAPI = {
    getProfile: async () => {
        return apiCall('/doctors/profile', { method: 'GET' });
    },
    
    updateProfile: async (data) => {
        return apiCall('/doctors/profile', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateStatus: async (isOnline) => {
        return apiCall(`/doctors/status?isOnline=${isOnline}`, { method: 'PUT' });
    },

    updateAvailability: async (schedule) => {
        return apiCall('/doctors/availability', {
            method: 'PUT',
            body: JSON.stringify(schedule) // Backend expects string
        });
    },

    getPatientsCount: async (id) => {
        return apiCall(`/doctors/${id}/patients-count`, { method: 'GET' });
    },

    getAllDoctors: async () => {
        return apiCall('/doctors', { method: 'GET' });
    },

    getDoctorByUserId: async (userId) => {
        return apiCall(`/doctors/${userId}/profile`, { method: 'GET' });
    },

    searchDoctors: async (keyword) => {
        return apiCall(`/doctors/search?specialization=${encodeURIComponent(keyword)}`, { method: 'GET' });
    }
};

window.AdminAPI = {
    deleteUser: async (id) => apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
    unblockUser: async (id) => apiCall(`/admin/users/${id}/unblock`, { method: 'PUT' }),
    blockUser: async (id) => apiCall(`/admin/users/${id}/block`, { method: 'PUT' }),
    rejectDoctor: async (id) => apiCall(`/admin/doctors/${id}/reject`, { method: 'PUT' }),
    approveDoctor: async (id) => apiCall(`/admin/doctors/${id}/approve`, { method: 'PUT' }),
    updateComplaint: async (id, status) => apiCall(`/admin/complaints/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    searchUsers: async (email, role) => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (role) params.append('role', role);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiCall(`/admin/users/search${query}`, { method: 'GET' });
    },
    getPendingDoctors: async () => apiCall('/admin/doctors/pending', { method: 'GET' })
};

window.AppointmentAPI = {
    // Shared
    cancelAppointment: async (id) => apiCall(`/appointments/${id}/cancel`, { method: 'PUT' }),
    
    // Admin
    getAll: async () => apiCall('/appointments/all', { method: 'GET' }),
    
    // Doctor
    createSlot: async (scheduledTime) => apiCall('/appointments/slot', { method: 'POST', body: JSON.stringify({ scheduledTime }) }),
    getDoctorAppointments: async () => apiCall('/appointments/doctor', { method: 'GET' }),
    updateStatus: async (id, status) => apiCall(`/appointments/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),
    
    // Patient
    getAvailable: async () => apiCall('/appointments/available', { method: 'GET' }),
    getAvailableCount: async () => apiCall('/appointments/available/count', { method: 'GET' }),
    bookAppointment: async (id, reasonForVisit) => apiCall(`/appointments/${id}/book`, { method: 'POST', body: JSON.stringify({ reasonForVisit }) }),
    getPatientAppointments: async () => apiCall('/appointments/patient', { method: 'GET' }),
    getPatientHistory: async () => apiCall('/appointments/history', { method: 'GET' })
};

window.CategoryAPI = {
    getAll: async () => apiCall('/categories', { method: 'GET' }),
    getById: async (id) => apiCall(`/categories/${id}`, { method: 'GET' }),
    create: async (data) => apiCall('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => apiCall(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (id) => apiCall(`/categories/${id}`, { method: 'DELETE' })
};

window.MedicineAPI = {
    getAll: async () => apiCall('/medicines', { method: 'GET' }),
    getById: async (id) => apiCall(`/medicines/${id}`, { method: 'GET' }),
    getByCategory: async (categoryId) => apiCall(`/medicines/category/${categoryId}`, { method: 'GET' }),
    search: async (name) => apiCall(`/medicines/search?name=${encodeURIComponent(name)}`, { method: 'GET' }),
    create: async (data) => apiCall('/medicines', { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => apiCall(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (id) => apiCall(`/medicines/${id}`, { method: 'DELETE' })
};

window.OrderAPI = {
    getAll: async () => apiCall('/orders', { method: 'GET' }),
    getById: async (id) => apiCall(`/orders/${id}`, { method: 'GET' }),
    getMyOrders: async () => apiCall('/orders/my-orders', { method: 'GET' }),
    create: async (data) => apiCall('/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: async (id, status) => apiCall(`/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' })
};

window.PrescriptionAPI = {
    create: async (data) => apiCall('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
    getById: async (id) => apiCall(`/prescriptions/${id}`, { method: 'GET' }),
    getPatientPrescriptions: async () => apiCall('/prescriptions/patient', { method: 'GET' }),
    getDoctorPrescriptions: async () => apiCall('/prescriptions/doctor', { method: 'GET' }),
    getByAppointment: async (appointmentId) => apiCall(`/prescriptions/appointment/${appointmentId}`, { method: 'GET' })
};

window.VideoSessionAPI = {
    create: async (data) => apiCall('/video-sessions', { method: 'POST', body: JSON.stringify(data) }),
    start: async (sessionId) => apiCall(`/video-sessions/${sessionId}/start`, { method: 'PUT' }),
    end: async (sessionId) => apiCall(`/video-sessions/${sessionId}/end`, { method: 'PUT' }),
    getByAppointment: async (appointmentId) => apiCall(`/video-sessions/appointment/${appointmentId}`, { method: 'GET' })
};

window.ChatAPI = {
    send: async (data) => apiCall('/chat/send', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: async (userId) => apiCall(`/chat/history/${userId}`, { method: 'GET' })
};

window.FeedbackAPI = {
    create: async (userId, data) => apiCall(`/feedback?arg0=${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    getDoctorFeedback: async (doctorId) => apiCall(`/feedback/doctor/${doctorId}`, { method: 'GET' }),
    getDoctorRating: async (doctorId) => apiCall(`/feedback/doctor/${doctorId}/rating`, { method: 'GET' })
};

window.EmergencyAPI = {
    create: async (userId, data) => apiCall(`/emergency?arg0=${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    getAll: async () => apiCall('/emergency', { method: 'GET' }),
    updateStatus: async (id, status) => apiCall(`/emergency/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    assign: async (id, doctorId) => apiCall(`/emergency/${id}/assign/${doctorId}`, { method: 'PUT' }),
    getByDoctor: async (doctorId) => apiCall(`/emergency/doctor/${doctorId}`, { method: 'GET' })
};

window.ComplaintAPI = {
    create: async (userId, data) => apiCall(`/complaints?userId=${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    getAll: async () => apiCall('/complaints', { method: 'GET' })
};

window.UploadAPI = {
    uploadProfileImage: async (userId, file) => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('file', file);
        return apiCall('/image/profile', {
            method: 'POST',
            body: formData
        });
    }
};

window.ProjectFeedbackAPI = {
    submit: async (userId, data) => apiCall(`/public/feedback/submit?userId=${userId}`, { method: 'POST', body: JSON.stringify(data) }),
    getAll: async () => apiCall('/public/feedback', { method: 'GET' }),
    delete: async (id) => apiCall(`/public/feedback/${id}`, { method: 'DELETE' })
};

window.Helpers = {
    showToast,
    setButtonLoading,
    getFormData: (formElement) => {
        const data = {};
        const formData = new FormData(formElement);
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },
    getAvatarHtml: (profileImageUrl, name = 'User', sizeClass = 'avatar-sm') => {
        const initials = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
        if (profileImageUrl) {
            return `<div class="avatar ${sizeClass}">
                        <img src="${profileImageUrl}" alt="${name}" onerror="this.parentElement.innerHTML='<div class=\\'avatar-placeholder\\'>${initials}</div>'">
                    </div>`;
        }
        return `<div class="avatar ${sizeClass}"><div class="avatar-placeholder">${initials}</div></div>`;
    }
};




// right click disabled 
  document.addEventListener("contextmenu", (e) => e.preventDefault());






const cards = document.querySelectorAll(".visual-card");

cards.forEach((card) => {
  const img = card.querySelector("img");

  card.addEventListener("mousemove", (e) => {
    let rect = card.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    let centerX = rect.width / 2;
    let centerY = rect.height / 2;

    let rotateX = -(y - centerY) / 15;
    let rotateY = (x - centerX) / 15;

    // Card Tilt
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Image Zoom + Move
    let moveX = (centerX - x) / 20;
    let moveY = (centerY - y) / 20;

    img.style.transform = `scale(1.2) translate(${moveX}px, ${moveY}px)`;
  });

  // Reset
  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0)";
    img.style.transform = "scale(1) translate(0,0)";
  });
});



// +++++++++++++++++++++++++++++++++++++++++++++ chatbot +++++++++++++++++++++++++++++++++++++++++++++
const tooltip = document.getElementById("chatTooltip");

// 👉 Different messages list
const messages = [
    "Chat with DigiCare",
    " Need medical help?",
    " Ask about medicines",
    " Emergency support", 
    " Ask about Dragon Team",
    
];

let index = 0;

function showTooltipLoop() {
    //  text change
    tooltip.textContent = messages[index];
    index = (index + 1) % messages.length;

    //  show
    tooltip.classList.add("show");

    //  hide after 3 sec
    setTimeout(() => {
        tooltip.classList.remove("show");
    }, 3000);
}

//  Repeat every 6 sec
setInterval(showTooltipLoop, 20000);

//  First time delay
setTimeout(showTooltipLoop, 9000);



/* ================= CHAT TOGGLE ================= */

const toggleBtn = document.getElementById("toggleBtn");
const chatBox = document.getElementById("chatBox");

// Toggle click
toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    chatBox.classList.toggle("active");
});

// Chatbox click
chatBox.addEventListener("click", function (e) {
    e.stopPropagation();
});

// Outside click = close
document.addEventListener("click", function () {
    chatBox.classList.remove("active");
});
