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
        // Build horizontal slider for staff gallery
        let sliderHTML = '';
        if (member.gallery && member.gallery.length > 0) {
            sliderHTML = `
                <div class="staff-slider-container">
                    <button class="slider-arrow slider-arrow-left" data-index="${memberIndex}"><i class="fas fa-chevron-left"></i></button>
                    <div class="staff-slider" id="slider-${memberIndex}">
                        ${member.gallery.map((img, idx) => `
                            <div class="slider-image-wrap">
                                <img src="${img}" alt="${member.name} photo" class="slider-image" loading="lazy" style="object-fit:contain;">
                            </div>
                        `).join('')}
                    </div>
                    <button class="slider-arrow slider-arrow-right" data-index="${memberIndex}"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
        } else {
            sliderHTML = `
                <div class="staff-slider-container">
                    <div class="staff-slider" id="slider-${memberIndex}">
                        <div class="slider-image-wrap">
                            <img src="${member.image}" alt="${member.name} photo" class="slider-image" loading="lazy" style="object-fit:contain;">
                        </div>
                    </div>
                </div>
            `;
        }
        const card = document.createElement('div');
        card.className = 'staff-profile-vertical mb-4';
        card.innerHTML = `
            <div class="staff-profile-card">
                ${sliderHTML}
                <div class="staff-profile-details">
                    <span class="staff-profile-name">${member.name}</span>
                    <span class="staff-profile-nationality">${member.nationality}</span>
                </div>
                <button class="btn-select-staff mt-2" data-staff='${JSON.stringify(member)}'>Select</button>
            </div>
        `;
        staffContainer.appendChild(card);
    });
    // Slider arrow logic
    document.querySelectorAll('.slider-arrow').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-index');
            const slider = document.getElementById(`slider-${idx}`);
            const scrollAmount = slider.offsetWidth * 0.7;
            if (this.classList.contains('slider-arrow-left')) {
                slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    });
    // Touch swipe for mobile
    document.querySelectorAll('.staff-slider').forEach(slider => {
        let startX = 0, scrollLeft = 0, isDown = false;
        slider.addEventListener('touchstart', e => {
            isDown = true;
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('touchmove', e => {
            if (!isDown) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (startX - x);
            slider.scrollLeft = scrollLeft + walk;
        });
        slider.addEventListener('touchend', () => { isDown = false; });
    });
    // Select button logic
    document.querySelectorAll('.btn-select-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const member = JSON.parse(btn.dataset.staff);
            selectStaff(member);
        });
    });

    // Attach click event to slider images for modal (lightbox)
    document.querySelectorAll('.slider-image').forEach(img => {
        img.addEventListener('click', function() {
            const modal = document.getElementById('staffPhotoModal');
            const modalImg = document.getElementById('staffPhotoModalImg');
            modalImg.src = this.src;
            // Remove and re-add animation for repeated opens
            modalImg.style.animation = 'none';
            void modalImg.offsetWidth; // trigger reflow
            modalImg.style.animation = null;
            modal.classList.add('show');
        });
    });
}

// Select staff member
function selectStaff(member) {
    selectedStaff = member;
    selectedStaffNameSpan.textContent = member.name;
    actionBar.style.display = 'flex';

    // Store staff name and duration for summary
    sessionStorage.setItem('selectedStaffName', member.name);
    if (member.duration) {
        sessionStorage.setItem('serviceDuration', member.duration);
    }

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
        // Navigate to details (booking form) page
        window.location.href = './booking-form.html';
    }
});

// WhatsApp Availability button handler
const btnWhatsapp = document.getElementById('btn-whatsapp');
if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
        if (selectedStaff) {
            const staffName = selectedStaff.name;
            const whatsappNumber = selectedStaff.whatsapp || '+971555899629'; // Fallback number
            const message = `Hello! I saw your website and would like to know ${staffName}'s available dates and times.`;
            const encodedMessage = encodeURIComponent(message);
            // Open WhatsApp with pre-filled message
            window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
        }
    });
}

// Load staff on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStaff().then(() => {
        // After staff cards are rendered, check if we need to auto-select a therapist
        const params = new URLSearchParams(window.location.search);
        const therapistId = params.get('therapistId');
        
        if (therapistId) {
            // Find and auto-select the therapist
            const therapist = staff.find(s => s.id == therapistId);
            if (therapist) {
                selectStaff(therapist);
                // Highlight the card
                setTimeout(() => {
                    const selectButtons = document.querySelectorAll('.btn-select-staff');
                    selectButtons.forEach((btn, idx) => {
                        if (staff[idx].id == therapistId) {
                            btn.classList.add('active');
                            // Scroll into view
                            btn.closest('.staff-profile-vertical').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    });
                }, 100);
            }
        }
    });
});

// Make loadStaff return a promise
const loadStaffOriginal = loadStaff;
loadStaff = function() {
    return new Promise((resolve) => {
        loadStaffOriginal();
        // Staff should be loaded very quickly, resolve after render
        setTimeout(resolve, 50);
    });
};

$(document).ready(function () {
    // Read service info from URL params
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('serviceId');
    const serviceName = params.get('serviceName') || 'Selected Service';
    const servicePrice = params.get('price') || '—';
    const serviceDuration = params.get('duration') || '—';
    const serviceLocation = params.get('location') || 'studio';
    const therapistId = params.get('therapistId');
    const therapistName = params.get('therapistName');

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

    // Store therapist info if coming from therapist details page
    if (therapistId) {
        sessionStorage.setItem('selectedTherapistId', therapistId);
        sessionStorage.setItem('selectedTherapistName', decodeURIComponent(therapistName));
    }

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

// Add click event for slider images to open full-size modal (lightbox)
document.querySelectorAll('.slider-image').forEach(img => {
    img.addEventListener('click', function() {
        const modal = document.getElementById('staffPhotoModal');
        const modalImg = document.getElementById('staffPhotoModalImg');
        modalImg.src = this.src;
        // Remove and re-add animation for repeated opens
        modalImg.style.animation = 'none';
        void modalImg.offsetWidth; // trigger reflow
        modalImg.style.animation = null;
        modal.classList.add('show');
    });
});

// Close modal logic
const closeGalleryBtn = document.getElementById('closeGalleryModal');
if (closeGalleryBtn) {
    closeGalleryBtn.addEventListener('click', function() {
        document.getElementById('staffGalleryModal').classList.remove('show');
    });
}

const closePhotoBtn = document.getElementById('closeStaffPhotoModal');
if (closePhotoBtn) {
    closePhotoBtn.onclick = function() {
        document.getElementById('staffPhotoModal').classList.remove('show');
    };
}