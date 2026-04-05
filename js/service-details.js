// Service Details Page Script

let selectedService = null;
let allServices = [];

// Get service ID from URL
function getServiceIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id')) || 1;
}

// Load service details
async function loadServiceDetails() {
    try {
        const response = await fetch('../data/services.json');
        allServices = await response.json();
        
        const serviceId = getServiceIdFromUrl();
        selectedService = allServices.find(s => s.id === serviceId);
        
        if (!selectedService) {
            console.error('Service not found');
            return;
        }
        
        // Update page title
        document.title = `${selectedService.name} - Zahi Spa`;
        
        // Update header section
        document.getElementById('service-title').textContent = selectedService.name;
        document.getElementById('breadcrumb-service').textContent = selectedService.name;
        document.getElementById('service-category-badge').textContent = selectedService.category;
        
        // Update service image
        document.getElementById('main-service-image').src = selectedService.image;
        document.getElementById('main-service-image').alt = selectedService.name;
        
        // Update description
        document.getElementById('service-description').textContent = selectedService.description;
        
        // Update location
        document.getElementById('location-text').textContent = selectedService.location;
        
        // Show home service info if available
        if (selectedService.isHomeService) {
            document.getElementById('home-service-info').style.display = 'inline-block';
            document.getElementById('book-home-service-btn').style.display = 'block';
            document.getElementById('home-service-pricing-section').style.display = 'block';
        }
        
        // Load studio pricing
        loadStudioPricing();
        
        // Load home service pricing if available
        if (selectedService.isHomeService) {
            loadHomeServicePricing();
        }
        
        // Load related services
        loadRelatedServices();
        
        // Update benefits list based on service type
        updateBenefitsList();
        
    } catch (error) {
        console.error('Error loading service details:', error);
    }
}

// Load studio pricing options
function loadStudioPricing() {
    const pricingContainer = document.getElementById('studio-pricing');
    pricingContainer.innerHTML = '';
    
    if (selectedService.durations && selectedService.durations.length > 0) {
        selectedService.durations.forEach(option => {
            const priceCard = document.createElement('div');
            priceCard.className = 'pricing-option';
            priceCard.innerHTML = `
                <div>
                    <div class="pricing-option-name">${option.duration} Minutes</div>
                    <div class="pricing-option-duration">Studio Service</div>
                </div>
                <div class="pricing-option-price">AED ${option.price}</div>
            `;
            pricingContainer.appendChild(priceCard);
        });
    }
}

// Load home service pricing options
function loadHomeServicePricing() {
    const pricingContainer = document.getElementById('home-service-pricing');
    pricingContainer.innerHTML = '';
    
    if (selectedService.homeServiceDurations && selectedService.homeServiceDurations.length > 0) {
        selectedService.homeServiceDurations.forEach(option => {
            const priceCard = document.createElement('div');
            priceCard.className = 'pricing-option';
            priceCard.innerHTML = `
                <div>
                    <div class="pricing-option-name">${option.duration} Minutes</div>
                    <div class="pricing-option-duration">Home Service</div>
                </div>
                <div class="pricing-option-price">AED ${option.price}</div>
            `;
            pricingContainer.appendChild(priceCard);
        });
    }
}

// Update benefits list based on service type
function updateBenefitsList() {
    const benefitsList = document.getElementById('benefits-list');
    const serviceType = selectedService.category.toLowerCase();
    
    let benefits = [];
    
    if (serviceType.includes('massage')) {
        benefits = [
            'Deep relaxation and stress relief',
            'Improved blood circulation',
            'Muscle tension reduction',
            'Enhanced flexibility and mobility',
            'Promotion of overall wellness'
        ];
    } else if (serviceType.includes('spa')) {
        benefits = [
            'Complete body rejuvenation',
            'Skin hydration and nourishment',
            'Stress relief and relaxation',
            'Improved skin texture and tone',
            'Mental and physical wellness'
        ];
    } else {
        benefits = [
            'Professional wellness treatment',
            'Personalized care experience',
            'Expert therapist attention',
            'Enhanced relaxation',
            'Health and wellness benefits'
        ];
    }
    
    benefitsList.innerHTML = '';
    benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check"></i> ${benefit}`;
        benefitsList.appendChild(li);
    });
}

// Load related services
function loadRelatedServices() {
    const relatedContainer = document.getElementById('related-services-container');
    relatedContainer.innerHTML = '';
    
    // Get up to 3 related services (excluding current service)
    const related = allServices
        .filter(s => s.category === selectedService.category && s.id !== selectedService.id)
        .slice(0, 3);
    
    // If not enough services in same category, add from other categories
    if (related.length < 3) {
        const additional = allServices
            .filter(s => s.id !== selectedService.id && !related.find(r => r.id === s.id))
            .slice(0, 3 - related.length);
        related.push(...additional);
    }
    
    if (related.length === 0) {
        relatedContainer.innerHTML = '<div class="col-12 text-center"><p>No related services available</p></div>';
        return;
    }
    
    related.forEach(service => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="related-service-card" onclick="goToServiceDetails(${service.id})">
                <div class="related-service-image">
                    <img src="${service.image}" alt="${service.name}">
                </div>
                <div class="related-service-info">
                    <div class="related-service-name">${service.name}</div>
                    <div class="related-service-price">From AED ${service.durations[0].price}</div>
                </div>
            </div>
        `;
        relatedContainer.appendChild(col);
    });
}

// Navigate to booking page
function goToBooking(type) {
    const params = new URLSearchParams({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceType: type
    });
    window.location.href = `booking-form.html?${params.toString()}`;
}

// Navigate to another service details page
function goToServiceDetails(serviceId) {
    window.location.href = `service-details.html?id=${serviceId}`;
}

// Navigate back to services page
function goBackToServices() {
    window.location.href = 'services.html';
}

// Initialize page when DOM is ready
$(document).ready(function() {
    loadServiceDetails();
    
    // Setup FAQ accordion
    $('.faq-question').on('click', function() {
        $(this).toggleClass('active');
        $(this).next('.faq-answer').slideToggle(300);
    });
});
