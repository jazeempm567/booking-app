const galleryInPagesRoute = window.location.pathname.includes('/pages/');
const galleryDataPath = galleryInPagesRoute ? '../data/staff.json' : 'data/staff.json';
const therapistDetailsPath = galleryInPagesRoute ? 'therapist-details.html' : 'pages/therapist-details.html';

// Load staff data and render gallery
async function loadStaffGallery() {
    try {
        const response = await fetch(galleryDataPath);
        const staff = await response.json();

        const container = document.getElementById('staff-gallery-container');
        if (!container) return;
        container.innerHTML = '';

        staff.forEach(person => {
            const card = document.createElement('div');
            card.className = 'col-lg-3 col-md-4 col-6 mb-4';
            
            const availabilityClass = person.available ? '' : 'unavailable';
            const availabilityText = person.available ? '✓ Available' : '✗ Unavailable';
            const galleryCount = person.gallery ? person.gallery.length : 0;
            const stars = '★'.repeat(Math.round(person.rating));

            card.innerHTML = `
                <div class="staff-card">
                    <div class="staff-card-image">
                        <img src="${person.image}" alt="${person.name}" loading="lazy" style="cursor: pointer;" onclick="goToTherapistDetails(${person.id})">
                        <span class="availability-badge ${availabilityClass}">${availabilityText}</span>
                        <span class="gallery-count"><i class="fas fa-images"></i> ${galleryCount}</span>
                    </div>
                    <div class="staff-card-content">
                        <h5 class="staff-card-name" style="cursor: pointer;" onclick="goToTherapistDetails(${person.id})">${person.name}</h5>
                        <p class="staff-card-specialty">${person.specialization}</p>
                        <div class="staff-card-info"><strong>From:</strong> ${person.nationality}</div>
                        <div class="staff-card-info"><strong>Experience:</strong> ${person.experience}</div>
                        <div class="staff-card-info"><strong>Next Slot:</strong> ${person.nextSlot}</div>
                        <div class="staff-card-rating">
                            <span class="stars">${stars}</span>
                            <span>${person.rating}/5.0</span>
                        </div>
                    </div>
                    <div class="staff-card-footer">
                        <button class="btn-view-gallery" data-staff-id="${person.id}" data-staff-name="${person.name}" data-gallery-images='${JSON.stringify(person.gallery || [])}'>
                            <i class="fas fa-images"></i> Gallery
                        </button>
                        <button class="btn-book-staff" onclick="goToTherapistDetails(${person.id})">
                            <i class="fas fa-user-md"></i> View Profile
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        
        // Attach event listeners to gallery buttons
        document.querySelectorAll('.btn-view-gallery').forEach(button => {
            button.addEventListener('click', function() {
                const staffName = this.getAttribute('data-staff-name');
                const galleryImagesJson = this.getAttribute('data-gallery-images');
                const galleryImages = JSON.parse(galleryImagesJson);
                openStaffGallery(staffName, galleryImages);
            });
        });
    } catch (error) {
        console.error('Error loading staff gallery:', error);
    }
}

// Open gallery modal for a specific staff member
function openStaffGallery(staffName, galleryImages) {
    console.log('Opening gallery for:', staffName, 'Images:', galleryImages);
    
    // Ensure gallery images is an array
    if (typeof galleryImages === 'string') {
        try {
            galleryImages = JSON.parse(galleryImages);
        } catch (e) {
            console.error('Error parsing gallery images:', e);
            galleryImages = [];
        }
    }
    
    document.getElementById('staffNameTitle').textContent = `${staffName}'s Gallery`;
    
    const galleryGrid = document.getElementById('staffGalleryGrid');
    if (!galleryGrid) {
        console.error('Gallery grid element not found!');
        return;
    }
    
    galleryGrid.innerHTML = '';

    if (!galleryImages || galleryImages.length === 0) {
        console.warn('No gallery images for', staffName);
        galleryGrid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No photos available</p></div>';
        $('#staffGalleryModal').modal('show');
        return;
    }

    // Create carousel for sliding gallery
    let carouselHTML = `
        <div id="galleryCarousel" class="carousel slide" data-interval="false">
            <div class="carousel-inner">
    `;

    galleryImages.forEach((img, index) => {
        const activeClass = index === 0 ? 'active' : '';
        carouselHTML += `
                <div class="carousel-item ${activeClass}">
                    <div class="carousel-image-wrapper">
                        <img src="${img}" alt="Gallery image ${index + 1}" class="carousel-gallery-image">
                        <div class="carousel-image-counter">
                            <span>${index + 1}</span> / <span>${galleryImages.length}</span>
                        </div>
                    </div>
                </div>
        `;
    });

    carouselHTML += `
            </div>
            <a class="carousel-control-prev" href="#galleryCarousel" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </a>
            <a class="carousel-control-next" href="#galleryCarousel" role="button" data-slide="next">
                <span class="carousel-control-next-icon"></span>
            </a>
        </div>
    `;

    galleryGrid.innerHTML = carouselHTML;
    
    // Show modal first
    $('#staffGalleryModal').modal('show');
    
    // Initialize carousel after modal is shown
    setTimeout(function() {
        console.log('Initializing carousel...');
        $('#galleryCarousel').carousel();
    }, 500);
}

// Lightbox functionality (optional - for individual photo viewing)
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(images, index) {
    currentLightboxImages = images;
    currentLightboxIndex = index;
    
    let modal = document.getElementById('lightboxModal');
    if (!modal) {
        createLightboxModal();
        modal = document.getElementById('lightboxModal');
    }
    
    updateLightboxImage();
    modal.classList.add('show');
}

function createLightboxModal() {
    const modal = document.createElement('div');
    modal.id = 'lightboxModal';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
        <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
        <div class="lightbox-content">
            <button class="lightbox-prev" onclick="prevLightboxImage()" title="Previous">
                <i class="fas fa-chevron-left"></i>
            </button>
            <img id="lightboxImage" src="" alt="" class="lightbox-image">
            <button class="lightbox-next" onclick="nextLightboxImage()" title="Next">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

function updateLightboxImage() {
    const img = document.getElementById('lightboxImage');
    if (img) {
        img.src = currentLightboxImages[currentLightboxIndex];
    }
}

function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
    updateLightboxImage();
}

function prevLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
    updateLightboxImage();
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightboxModal');
    if (modal && modal.classList.contains('show')) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextLightboxImage();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevLightboxImage();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            closeLightbox();
        }
    }
});

// Navigate to therapist details page
function goToTherapistDetails(staffId) {
    window.location.href = `${therapistDetailsPath}?id=${staffId}`;
}

// Load gallery when page is ready
$(document).ready(function() {
    loadStaffGallery();
});
