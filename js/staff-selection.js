// Staff Selection Page

const staffContainer = document.getElementById('staff-container');
const staffError = document.getElementById('staff-error');
const selectedStaffNameSpan = document.getElementById('selected-staff-name');
const actionBar = document.getElementById('action-bar');
const btnContinue = document.getElementById('btn-continue');

let selectedStaff = null;
let staff = [];

// Load staff data
async function loadStaff() {
    try {
        const response = await fetch('../data/staff.json');
        if (!response.ok) throw new Error('Failed to load staff');
        staff = await response.json();
        
        renderStaffCards();
    } catch (error) {
        console.error('Error loading staff:', error);
        staffError.classList.remove('d-none');
        staffContainer.innerHTML = '';
    }
}

// Render staff cards with clickable main photo for gallery modal
function renderStaffCards() {
    staffContainer.innerHTML = '';
    staff.forEach((member, memberIndex) => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        // Main image is clickable for gallery
        card.innerHTML = `
            <div class="staff-card staff-card-modern">
                <div class="staff-image-collage">
                    <img src="${member.image}" alt="${member.name}" class="staff-main-image staff-photo-click" data-member-index="${memberIndex}" style="cursor:pointer;" onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(member.name)}'">
                </div>
                <div class="staff-info">
                    <h5 class="staff-name">${member.name}</h5>
                    <p class="staff-title">${member.specialization}</p>
                    <p class="staff-bio">${member.nationality} • ${member.experience}</p>
                    <div class="staff-rating">
                        <span class="rating-stars">${'★'.repeat(Math.round(member.rating))}${'☆'.repeat(5 - Math.round(member.rating))}</span>
                        <span class="rating-count">(${member.rating})</span>
                    </div>
                    <button class="btn-select-staff" data-staff='${JSON.stringify(member)}'>
                        Select
                    </button>
                </div>
            </div>
        `;
        staffContainer.appendChild(card);
    });
    document.querySelectorAll('.btn-select-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const member = JSON.parse(btn.dataset.staff);
            selectStaff(member);
        });
    });
    // Add click event for staff main photo to open gallery modal
    document.querySelectorAll('.staff-photo-click').forEach(img => {
        img.addEventListener('click', function() {
            const memberIdx = this.getAttribute('data-member-index');
            openStaffGalleryModal(staff[memberIdx]);
        });
    });
}

// Select staff member
function selectStaff(member) {
    selectedStaff = member;
    selectedStaffNameSpan.textContent = member.name;
    actionBar.style.display = 'flex';
    
    // Update UI to show selection
    document.querySelectorAll('.btn-select-staff').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// Continue button handler
btnContinue.addEventListener('click', () => {
    if (selectedStaff) {
        // Store selected staff in session storage
        sessionStorage.setItem('selectedStaff', JSON.stringify(selectedStaff));
        // Navigate to next page
        window.location.href = './payment.html';
    }
});

// Load staff on page load
document.addEventListener('DOMContentLoaded', loadStaff);

$(document).ready(function () {
    // Read service info from URL params
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('serviceId');
    const serviceName = params.get('serviceName') || 'Selected Service';
    const servicePrice = params.get('price') || '—';
    const serviceDuration = params.get('duration') || '—';
    const serviceLocation = params.get('location') || 'studio';

    // Format location display
    const locationDisplay = serviceLocation === 'home' ? '🏠 Your Home' : '🏢 Our Studio';

    // Show selected service banner
    $('#service-info').html(`
        <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div>
                <i class="fas fa-concierge-bell mr-2"></i>
                <strong>${decodeURIComponent(serviceName)}</strong>
                <span class="service-duration-tag"><i class="far fa-clock"></i> ${serviceDuration} min</span>
                <span class="service-location-tag" style="margin-left: 8px;"><i class="fas fa-map-marker-alt"></i> ${locationDisplay}</span>
            </div>
            <div class="service-price-tag">${servicePrice} AED</div>
        </div>
    `);

    // Store service data in session
    sessionStorage.setItem('serviceId', serviceId);
    sessionStorage.setItem('serviceName', decodeURIComponent(serviceName));
    sessionStorage.setItem('servicePrice', servicePrice);
    sessionStorage.setItem('serviceDuration', serviceDuration);
    sessionStorage.setItem('serviceLocation', serviceLocation);

    let selectedStaffId = null;

    // Fetch staff data
    // $.getJSON('../data/staff.json', function (data) {
    //     displayStaff(data);
    // }).fail(function () {
    //     $('#staff-container').addClass('d-none');
    //     $('#staff-error').removeClass('d-none');
    // });

    // Remove jQuery-based staff fetch and displayStaff call

    // Continue button → go to booking form
    $('#btn-continue').on('click', function () {
        if (selectedStaffId) {
            window.location.href = 'booking-form.html';
        }
    });
});

// Staff gallery modal logic
function openStaffGalleryModal(member) {
    const modal = document.getElementById('staffGalleryModal');
    const mainImg = document.getElementById('galleryMainImage');
    const thumbs = document.getElementById('galleryThumbnails');
    if (!member.gallery || member.gallery.length === 0) {
        mainImg.src = member.image;
        thumbs.innerHTML = '';
    } else {
        mainImg.src = member.gallery[0];
        thumbs.innerHTML = member.gallery.map((url, idx) =>
            `<img src="${url}" class="${idx === 0 ? 'active' : ''}" data-idx="${idx}" alt="${member.name} photo">`
        ).join('');
    }
    modal.classList.add('show');
    // Thumbnail click changes main image
    thumbs.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', function() {
            mainImg.src = this.src;
            thumbs.querySelectorAll('img').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Close modal logic
const closeGalleryBtn = document.getElementById('closeGalleryModal');
if (closeGalleryBtn) {
    closeGalleryBtn.addEventListener('click', function() {
        document.getElementById('staffGalleryModal').classList.remove('show');
    });
}