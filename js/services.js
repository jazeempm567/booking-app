// Services / Home page — carousel, services, stats counter, smooth scroll

let allServices = [];

$(document).ready(function () {
    // ── Navbar scroll effect ──
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 50) {
            $('#mainNav').addClass('nav-scrolled');
        } else {
            $('#mainNav').removeClass('nav-scrolled');
        }
    });

    // ── Smooth scroll for anchor links ──
    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: target.offset().top - 70 }, 800);
        }
    });

    // ── Counter animation for stats ──
    let statsCounted = false;
    $(window).on('scroll', function () {
        const statsSection = $('.stats-section');
        if (statsSection.length && !statsCounted) {
            const sectionTop = statsSection.offset().top - $(window).height() + 100;
            if ($(window).scrollTop() > sectionTop) {
                statsCounted = true;
                $('.stat-number').each(function () {
                    const $el = $(this);
                    const target = parseInt($el.data('target'));
                    $({ count: 0 }).animate({ count: target }, {
                        duration: 2000,
                        easing: 'swing',
                        step: function () { $el.text(Math.floor(this.count)); },
                        complete: function () { $el.text(target.toLocaleString() + '+'); }
                    });
                });
            }
        }
    });

    // ── Fetch services ──
    $.getJSON('../data/services.json', function (data) {
        allServices = data;
        buildFilterButtons(data);
        displayServices(data);
        updateBannerVisibility(data);
    }).fail(function () {
        $('#services-container').html(
            '<div class="col-12 text-center py-5"><i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i><h4>Failed to load services</h4></div>'
        );
    });

    // ── Category filter ──
    $(document).on('click', '.filter-btn', function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        const category = $(this).data('category');
        if (category === 'all') {
            displayServices(allServices);
            updateBannerVisibility(allServices);
        } else if (category === 'home') {
            const homeServices = allServices.filter(s => s.isHomeService === true);
            displayServices(homeServices);
            updateBannerVisibility(homeServices);
        } else {
            const filteredServices = allServices.filter(s => s.category === category);
            displayServices(filteredServices);
            updateBannerVisibility(filteredServices);
        }
    });

    // ── Duration selection modal ──
    $(document).on('click', '.btn-book', function () {
        const serviceId = $(this).data('service-id');
        const serviceName = $(this).data('service-name');
        const durations = $(this).data('durations');
        
        // Find the service to get full details
        const service = allServices.find(s => s.id === serviceId);
        if (!service) return;

        // Show/hide location selection based on service type
        const locationContainer = $('#locationSelectionContainer');
        if (service.isHomeService) {
            locationContainer.removeClass('d-none');
            // Reset to studio default
            $('.location-option').removeClass('selected');
            $('.location-option[data-location="studio"]').addClass('selected');
            $('.location-option input[value="studio"]').prop('checked', true);
            sessionStorage.setItem('selectedLocation', 'studio');
        } else {
            locationContainer.addClass('d-none');
            sessionStorage.setItem('selectedLocation', 'studio');
        }

        // Build duration options HTML
        let durationHTML = '<div class="duration-options">';
        service.durations.forEach((dur, index) => {
            const selected = index === 0 ? 'selected' : ''; // Default to first (minimum)
            durationHTML += `
                <label class="duration-option ${selected}">
                    <input type="radio" name="duration" value="${dur.duration}" data-price="${dur.price}" class="duration-input" ${index === 0 ? 'checked' : ''}>
                    <span class="duration-value">${dur.duration} min</span>
                    <span class="duration-price">${dur.price} AED</span>
                </label>
            `;
        });
        durationHTML += '</div>';

        // Set modal content
        $('#modalServiceName').text(serviceName);
        $('#durationOptionsContainer').html(durationHTML);
        
        // Set the default price (minimum duration)
        const minPrice = Math.min(...service.durations.map(d => d.price));
        $('#selectedPrice').text(minPrice);
        $('#selectedDuration').text(service.durations[0].duration);
        
        // Store current service ID for later use
        $('#durationModal').data('service-id', serviceId);
    });

    // ── Handle location option selection ──
    $(document).on('click', '.location-option', function () {
        const location = $(this).data('location');
        $('.location-option').removeClass('selected');
        $(this).addClass('selected');
        $(this).find('input[type="radio"]').prop('checked', true);
        sessionStorage.setItem('selectedLocation', location);
    });

    // ── Handle duration option selection ──
    $(document).on('change', '.duration-input', function () {
        const price = $(this).data('price');
        const duration = $(this).val();
        
        // Update active label styling
        $('.duration-option').removeClass('selected');
        $(this).closest('.duration-option').addClass('selected');
        
        // Update displayed price and duration
        $('#selectedPrice').text(price);
        $('#selectedDuration').text(duration);
    });

    // ── Confirm duration and proceed ──
    $('#confirmDurationBtn').on('click', function () {
        const serviceId = $('#durationModal').data('service-id');
        const serviceName = $('#modalServiceName').text();
        const selectedDuration = $('#selectedDuration').text();
        const selectedPrice = $('#selectedPrice').text();
        const selectedLocation = sessionStorage.getItem('selectedLocation') || 'studio';

        // Store in sessionStorage for next page
        sessionStorage.setItem('selectedServiceId', serviceId);
        sessionStorage.setItem('selectedServiceName', serviceName);
        sessionStorage.setItem('selectedDuration', selectedDuration);
        sessionStorage.setItem('selectedPrice', selectedPrice);
        sessionStorage.setItem('selectedLocation', selectedLocation);

        // Close modal and navigate
        $('#durationModal').modal('hide');
        setTimeout(() => {
            window.location.href = `staff-selection.html?serviceId=${serviceId}&serviceName=${encodeURIComponent(serviceName)}&price=${selectedPrice}&duration=${selectedDuration}&location=${selectedLocation}`;
        }, 300);
    });
});

function buildFilterButtons(services) {
    const categories = [...new Set(services.map(s => s.category))];
    const filterBar = $('#filter-bar');
    const icons = {
        'Massage': 'fa-hand-holding-heart',
        'Wellness': 'fa-leaf',
        'Premium': 'fa-crown'
    };
    categories.forEach(cat => {
        const icon = icons[cat] || 'fa-spa';
        filterBar.append(
            `<button class="filter-btn" data-category="${cat}"><i class="fas ${icon}"></i> ${cat}</button>`
        );
    });
}

function displayServices(services) {
    const container = $('#services-container');
    container.empty();

    if (services.length === 0) {
        $('#no-services').removeClass('d-none');
        return;
    }
    $('#no-services').addClass('d-none');

    services.forEach((service, index) => {
        // Calculate price range
        const prices = service.durations.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;
        
        // Get durations for display
        const durations = service.durations.map(d => d.duration).join(', ');

        const card = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4 service-col" style="animation-delay: ${index * 0.07}s">
                <div class="service-card h-100">
                    <div class="service-image-wrap">
                        <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
                        <span class="service-category-badge">${service.category}</span>
                        ${service.isHomeService ? '<span class="home-service-badge"><i class="fas fa-home"></i> HOME AVAILABLE</span>' : ''}
                        <div class="service-price-tag">${priceRange} AED</div>
                    </div>
                    <div class="service-card-body">
                        <h5 class="service-title">${service.name}</h5>
                        <p class="service-description">${service.description}</p>
                        <div class="service-meta">
                            <span class="service-duration"><i class="far fa-clock"></i> ${durations} min</span>
                        </div>
                        <button class="btn-book" data-toggle="modal" data-target="#durationModal" data-service-id="${service.id}" data-service-name="${service.name}" data-durations='${JSON.stringify(service.durations)}'>
                            Book Now <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.append(card);
    });
}

function updateBannerVisibility(services) {
    const banner = $('#homeServicesBanner');
    const hasHomeServices = services.some(s => s.isHomeService === true);
    
    if (hasHomeServices) {
        banner.removeClass('d-none');
        // Count home services in the filtered view
        const homeServiceCount = services.filter(s => s.isHomeService === true).length;
        banner.find('.badge-text').text(homeServiceCount + ' Service' + (homeServiceCount !== 1 ? 's' : ''));
    } else {
        banner.addClass('d-none');
    }
}