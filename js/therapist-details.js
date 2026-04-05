// Therapist Details Page Script

let selectedTherapist = null;
let allStaff = [];
let allServices = [];

// Get therapist ID from URL
function getTherapistIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 1;
    return id;
}

// Load therapist details
async function loadTherapistDetails() {
    try {
        // Load staff data
        const staffResponse = await fetch('../data/staff.json');
        allStaff = await staffResponse.json();
        
        // Load services data
        const servicesResponse = await fetch('../data/services.json');
        allServices = await servicesResponse.json();
        
        const therapistId = getTherapistIdFromUrl();
        selectedTherapist = allStaff.find(s => s.id === therapistId);
        
        if (!selectedTherapist) {
            console.error('Therapist not found');
            return;
        }
        
        // Update page title
        document.title = `${selectedTherapist.name} - Zahi Spa`;
        
        // Update header section
        document.getElementById('therapist-name').textContent = selectedTherapist.name;
        document.getElementById('breadcrumb-therapist').textContent = selectedTherapist.name;
        document.getElementById('therapist-specialization').textContent = selectedTherapist.specialization;
        
        // Update rating in header
        const headerStars = '★'.repeat(Math.round(selectedTherapist.rating)) + 
                          '☆'.repeat(5 - Math.round(selectedTherapist.rating));
        document.getElementById('therapist-stars').textContent = headerStars;
        document.getElementById('therapist-rating-text').textContent = 
            `${selectedTherapist.rating}/5.0 (${Math.floor(Math.random() * 50) + 10} reviews)`;
        
        // Update main photo
        document.getElementById('main-therapist-photo').src = selectedTherapist.image;
        document.getElementById('main-therapist-photo').alt = selectedTherapist.name;
        
        // Update description
        document.getElementById('therapist-description').textContent = 
            selectedTherapist.description || 'Professional therapist dedicated to providing exceptional wellness services.';
        
        // Update info
        document.getElementById('therapist-nationality').textContent = selectedTherapist.nationality;
        document.getElementById('therapist-experience').textContent = selectedTherapist.experience;
        
        // Update availability
        const availabilityText = selectedTherapist.available ? 'Available' : 'Unavailable';
        const availabilityClass = selectedTherapist.available ? 'available' : 'unavailable';
        document.getElementById('therapist-availability').classList.add(availabilityClass);
        document.getElementById('availability-text').textContent = availabilityText;
        document.getElementById('next-slot-text').textContent = selectedTherapist.nextSlot;
        
        // Update rating
        document.getElementById('rating-number').textContent = selectedTherapist.rating;
        const ratingStars = '★'.repeat(Math.round(selectedTherapist.rating)) + 
                          '☆'.repeat(5 - Math.round(selectedTherapist.rating));
        document.getElementById('rating-stars').textContent = ratingStars;
        
        // Load gallery
        loadPhotoGallery();
        
        // Load specializations
        loadSpecializations();
        
        // Load services
        loadServices();
        
        // Load reviews
        loadReviews();
        
        // Load related therapists
        loadRelatedTherapists();
        
    } catch (error) {
        console.error('Error loading therapist details:', error);
    }
}

// Load photo gallery
function loadPhotoGallery() {
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const totalPhotos = selectedTherapist.gallery ? selectedTherapist.gallery.length : 0;
    
    if (totalPhotos === 0) return;
    
    // Update photo counter
    document.getElementById('photo-counter').textContent = `1 / ${totalPhotos}`;
    
    // Create thumbnails
    selectedTherapist.gallery.forEach((photo, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${photo}" alt="Photo ${index + 1}">`;
        thumbnail.addEventListener('click', () => {
            selectPhoto(index);
        });
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Set first photo as main
    selectPhoto(0);
}

// Select and display a photo
function selectPhoto(index) {
    const gallery = selectedTherapist.gallery;
    const totalPhotos = gallery.length;
    
    // Update main image
    document.getElementById('main-therapist-photo').src = gallery[index];
    document.getElementById('photo-counter').textContent = `${index + 1} / ${totalPhotos}`;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Load specializations
function loadSpecializations() {
    const container = document.getElementById('specializations-list');
    container.innerHTML = '';
    
    // Get specializations from the therapist's data
    const specializations = [
        selectedTherapist.specialization,
        'Swedish Massage',
        'Hot Stone Therapy',
        'Aromatherapy'
    ];
    
    specializations.forEach(spec => {
        const tag = document.createElement('div');
        tag.className = 'specialization-tag';
        tag.innerHTML = `<i class="fas fa-check-circle"></i> ${spec}`;
        container.appendChild(tag);
    });
}

// Load services offered by therapist
function loadServices() {
    const container = document.getElementById('therapist-services-container');
    container.innerHTML = '';
    
    // Get first 3 services
    const services = allServices.slice(0, 3);
    
    services.forEach(service => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        const minPrice = Math.min(...service.durations.map(d => d.price));
        col.innerHTML = `
            <div class="service-card-small">
                <i class="service-icon fas fa-hands"></i>
                <div class="service-name">${service.name}</div>
                <div class="service-price">From AED ${minPrice}</div>
            </div>
        `;
        container.appendChild(col);
    });
}

// Load reviews
function loadReviews() {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';
    
    // Sample reviews
    const reviews = [
        {
            author: 'Sarah M.',
            date: '2 weeks ago',
            rating: 5,
            text: 'Absolutely amazing experience! ' + selectedTherapist.name + ' is incredibly professional and attentive. The session was perfectly tailored to my needs. Highly recommended!'
        },
        {
            author: 'Ahmed K.',
            date: '1 month ago',
            rating: 5,
            text: 'Best massage I\'ve ever had. The ambiance, the therapist, everything was perfect! I\'ll definitely be booking again soon.'
        },
        {
            author: 'Emma L.',
            date: '3 weeks ago',
            rating: 4,
            text: 'Great service and very professional. ' + selectedTherapist.name + ' is knowledgeable and skilled. Will book again for sure!'
        },
        {
            author: 'Fatima Al.',
            date: '1 week ago',
            rating: 5,
            text: 'Excellent therapist! Very relaxing and therapeutic. Highly skilled and friendly. Definitely my go-to therapist now.'
        }
    ];
    
    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-author">${review.author}</div>
                    <div class="review-stars">${stars}</div>
                </div>
                <div class="review-date">${review.date}</div>
            </div>
            <p class="review-text">${review.text}</p>
        `;
        container.appendChild(reviewCard);
    });
}

// Load related therapists
function loadRelatedTherapists() {
    const container = document.getElementById('related-therapists-container');
    container.innerHTML = '';
    
    // Get up to 3 related therapists (excluding current)
    const related = allStaff
        .filter(s => s.id !== selectedTherapist.id)
        .slice(0, 3);
    
    related.forEach(therapist => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        const stars = '★'.repeat(Math.round(therapist.rating)) + 
                     '☆'.repeat(5 - Math.round(therapist.rating));
        
        col.innerHTML = `
            <a href="therapist-details.html?id=${therapist.id}" class="therapist-card-small">
                <div class="therapist-card-image">
                    <img src="${therapist.image}" alt="${therapist.name}">
                </div>
                <div class="therapist-card-info">
                    <div class="therapist-card-name">${therapist.name}</div>
                    <div class="therapist-card-specialty">${therapist.specialization}</div>
                    <div class="therapist-card-rating">
                        <i class="fas fa-star"></i> ${therapist.rating}/5.0
                    </div>
                </div>
            </a>
        `;
        container.appendChild(col);
    });
}

// Book appointment with therapist
function bookWithTherapist() {
    const params = new URLSearchParams({
        therapistName: selectedTherapist.name,
        therapistId: selectedTherapist.id
    });
    window.location.href = `services.html?${params.toString()}`;
}

// Initialize page when DOM is ready
$(document).ready(function() {
    loadTherapistDetails();
    
    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: target.offset().top - 70 }, 800);
        }
    });
});
