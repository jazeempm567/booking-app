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

// Render staff cards with gallery
function renderStaffCards() {
    staffContainer.innerHTML = '';
    
    staff.forEach((member, memberIndex) => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        
        let galleryHTML = '';
        if (member.gallery && member.gallery.length > 0) {
            galleryHTML = `
                <div class="staff-gallery-section">
                    <span class="gallery-label">Gallery</span>
                    <div class="gallery-container">
                        <button class="gallery-arrow gallery-prev" data-member="${memberIndex}">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="gallery-wrapper">
                            <div class="gallery-scroll" data-member="${memberIndex}">
                                ${member.gallery.map(imageUrl => `
                                    <div class="gallery-image">
                                        <img src="${imageUrl}" alt="Gallery image" onerror="this.src='https://via.placeholder.com/100x100?text=Image'">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button class="gallery-arrow gallery-next" data-member="${memberIndex}">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="staff-card">
                <div class="staff-image-container">
                    <img src="${member.image}" alt="${member.name}" class="staff-image" onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(member.name)}'">
                    <div class="staff-overlay">
                        <button class="btn-view-details" data-staff='${JSON.stringify(member)}'>
                            View Details
                        </button>
                    </div>
                </div>
                <div class="staff-info">
                    <h5 class="staff-name">${member.name}</h5>
                    <p class="staff-title">${member.specialization}</p>
                    <p class="staff-bio">${member.nationality} • ${member.experience}</p>
                    <div class="staff-rating">
                        <span class="rating-stars">${'★'.repeat(Math.round(member.rating))}${'☆'.repeat(5 - Math.round(member.rating))}</span>
                        <span class="rating-count">(${member.rating})</span>
                    </div>
                    ${galleryHTML}
                    <button class="btn-select-staff" data-staff='${JSON.stringify(member)}'>
                        Select
                    </button>
                </div>
            </div>
        `;
        
        staffContainer.appendChild(card);
    });
    
    // Add event listeners
    document.querySelectorAll('.btn-select-staff').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const member = JSON.parse(btn.dataset.staff);
            selectStaff(member);
        });
    });
    
    // Add gallery arrow listeners
    document.querySelectorAll('.gallery-arrow').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const memberIndex = parseInt(btn.dataset.member);
            const isNext = btn.classList.contains('gallery-next');
            scrollGallery(memberIndex, isNext);
        });
    });
    
    // Add view details listeners
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const member = JSON.parse(btn.dataset.staff);
            // You can implement a details modal here if needed
            console.log('View details for:', member);
        });
    });
    
    // Initialize arrow button states for galleries
    staff.forEach((member, index) => {
        if (member.gallery && member.gallery.length > 0) {
            const prevBtn = document.querySelector(`.gallery-prev[data-member="${index}"]`);
            const nextBtn = document.querySelector(`.gallery-next[data-member="${index}"]`);
            const galleryScroll = document.querySelector(`.gallery-scroll[data-member="${index}"]`);
            
            prevBtn.disabled = true; // Disable left arrow at start
            
            // Set right arrow disabled state based on whether scrolling is needed
            setTimeout(() => {
                const maxScroll = galleryScroll.scrollWidth - galleryScroll.parentElement.clientWidth;
                nextBtn.disabled = maxScroll <= 0;
            }, 100);
        }
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

// Scroll gallery left or right
function scrollGallery(memberIndex, isNext) {
    const galleryScroll = document.querySelector(`.gallery-scroll[data-member="${memberIndex}"]`);
    const imageWidth = 100 + 12; // 100px + 12px gap
    const scrollAmount = imageWidth; // Scroll one image at a time
    
    const currentScroll = galleryScroll.scrollLeft;
    const newScroll = isNext ? currentScroll + scrollAmount : currentScroll - scrollAmount;
    
    // Determine scroll limits
    const maxScroll = galleryScroll.scrollWidth - galleryScroll.parentElement.clientWidth;
    const limitedScroll = Math.max(0, Math.min(newScroll, maxScroll));
    
    galleryScroll.scrollLeft = limitedScroll;
    
    // Update button states
    updateArrowButtons(memberIndex, limitedScroll, maxScroll);
}

// Update arrow button disabled states
function updateArrowButtons(memberIndex, currentScroll, maxScroll) {
    const prevBtn = document.querySelector(`.gallery-prev[data-member="${memberIndex}"]`);
    const nextBtn = document.querySelector(`.gallery-next[data-member="${memberIndex}"]`);
    
    prevBtn.disabled = currentScroll === 0;
    nextBtn.disabled = currentScroll >= maxScroll - 5; // Small threshold for floating point precision
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
    $.getJSON('../data/staff.json', function (data) {
        displayStaff(data);
    }).fail(function () {
        $('#staff-container').addClass('d-none');
        $('#staff-error').removeClass('d-none');
    });

    function displayStaff(staffList) {
        const container = $('#staff-container');
        container.empty();

        staffList.forEach((staff, index) => {
            const stars = generateStars(staff.rating);
            const availableClass = staff.available ? '' : 'staff-unavailable';
            const availableBadge = staff.available
                ? `<span class="badge-available"><i class="fas fa-circle"></i> Available</span>`
                : `<span class="badge-busy"><i class="fas fa-clock"></i> Next: ${staff.nextSlot}</span>`;

            const card = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4 staff-col" style="animation-delay: ${index * 0.06}s">
                    <div class="staff-card ${availableClass}" data-id="${staff.id}" data-name="${staff.name}" ${!staff.available ? 'data-unavailable="true"' : ''}>
                        <div class="staff-image-wrap">
                            <img src="${staff.image}" alt="${staff.name}" class="staff-image" loading="lazy">
                            <div class="staff-image-overlay"></div>
                            ${availableBadge}
                            <span class="staff-rating-badge">${stars} ${staff.rating}</span>
                        </div>
                        <div class="staff-card-body">
                            <h5 class="staff-name">${staff.name}</h5>
                            <p class="staff-specialization">${staff.specialization}</p>
                            <div class="staff-details">
                                <span class="staff-experience"><i class="fas fa-briefcase"></i> ${staff.experience}</span>
                            </div>
                            <div class="staff-select-indicator">
                                <i class="fas fa-check-circle"></i> Selected
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });

        // Click handler for staff cards
        $(document).on('click', '.staff-card:not([data-unavailable])', function () {
            // Remove previous selection
            $('.staff-card').removeClass('selected');
            // Mark this as selected
            $(this).addClass('selected');

            selectedStaffId = $(this).data('id');
            const staffName = $(this).data('name');

            // Store in session
            sessionStorage.setItem('selectedStaffId', selectedStaffId);
            sessionStorage.setItem('selectedStaffName', staffName);

            // Show bottom action bar
            $('#selected-staff-name').text(staffName);
            $('#action-bar').slideDown(300);
        });
    }

    function generateStars(rating) {
        let stars = '';
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
        if (half) stars += '<i class="fas fa-star-half-alt"></i>';
        const empty = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    // Continue button → go to booking form
    $('#btn-continue').on('click', function () {
        if (selectedStaffId) {
            window.location.href = 'booking-form.html';
        }
    });
});