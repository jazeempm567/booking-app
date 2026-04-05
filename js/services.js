// Services / Home page — carousel, services, stats counter, smooth scroll

let allServices = [];

$(document).ready(function () {
    // ── Check for therapist from therapist details page ──
    const params = new URLSearchParams(window.location.search);
    const therapistName = params.get('therapistName');
    const therapistId = params.get('therapistId');
    
    if (therapistName && therapistId) {
        sessionStorage.setItem('selectedTherapistName', therapistName);
        sessionStorage.setItem('selectedTherapistId', therapistId);
        // Scroll to services section
        setTimeout(() => {
            const servicesSection = document.getElementById('services-section');
            if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }

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
    let currentService = null; // Store current service for location changes
    
    $(document).on('click', '.btn-book', function () {
        const serviceId = $(this).data('service-id');
        const serviceName = $(this).data('service-name');
        const durations = $(this).data('durations');
        
        // Find the service to get full details
        const service = allServices.find(s => s.id === serviceId);
        if (!service) return;

        // Store current service
        currentService = service;

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

    // ── Function to update duration options based on location ──
    function updateDurationOptions(service, location) {
        let durationsToShow = service.durations;
        
        // Use homeServiceDurations if available and location is home
        if (location === 'home' && service.homeServiceDurations) {
            durationsToShow = service.homeServiceDurations;
        }

        // Build duration options HTML
        let durationHTML = '<div class="duration-options">';
        durationsToShow.forEach((dur, index) => {
            const selected = index === 0 ? 'selected' : '';
            const isHomeService = location === 'home' && service.homeServiceDurations;
            // Only show add-on for 90-min durations
            const showAddOn = isHomeService && parseInt(dur.duration) === 90;
            durationHTML += `
                <div class="duration-option-wrapper ${selected}">
                    <label class="duration-option">
                        <input type="radio" name="duration" value="${dur.duration}" data-price="${dur.price}" class="duration-input" data-base-duration="${dur.duration}" data-base-price="${dur.price}" ${index === 0 ? 'checked' : ''}>
                        <span class="duration-value">${dur.duration} min</span>
                        <span class="duration-price">${dur.price} AED</span>
                    </label>
                    ${showAddOn ? `
                        <button type="button" class="btn-add-time" data-duration="${dur.duration}">
                            <i class="fas fa-plus"></i> 30 min
                        </button>
                    ` : ''}
                </div>
            `;
        });
        durationHTML += '</div>';

        $('#durationOptionsContainer').html(durationHTML);
        
        // Set the default price (minimum duration)
        const minPrice = Math.min(...durationsToShow.map(d => d.price));
        $('#selectedPrice').text(minPrice);
        $('#selectedDuration').text(durationsToShow[0].duration);
        
        // Reset extra time display
        $('#extraTimeDisplay').html('');
    }

    // ── Handle location option selection ──
    $(document).on('click', '.location-option', function () {
        const location = $(this).data('location');
        $('.location-option').removeClass('selected');
        $(this).addClass('selected');
        $(this).find('input[type="radio"]').prop('checked', true);
        sessionStorage.setItem('selectedLocation', location);
        
        // Update duration options based on new location
        if (currentService) {
            updateDurationOptions(currentService, location);
        }
    });

    // ── Handle duration option selection ──
    $(document).on('change', '.duration-input', function () {
        const price = $(this).data('price');
        const duration = $(this).val();
        
        // Update active label styling
        $('.duration-option-wrapper').removeClass('selected');
        $(this).closest('.duration-option-wrapper').addClass('selected');
        
        // Update displayed price and duration
        $('#selectedPrice').text(price);
        $('#selectedDuration').text(duration);
        
        // Reset extra time display
        $('#extraTimeDisplay').html('');
    });

    // ── Handle add 30 minutes button ──
    $(document).on('click', '.btn-add-time', function (e) {
        e.preventDefault();
        const baseDuration = parseInt($(this).data('duration'));
        const $durationInput = $(this).closest('.duration-option-wrapper').find('.duration-input');
        const basePrice = parseInt($durationInput.data('base-price'));
        const baseDurationAttr = parseInt($durationInput.data('base-duration'));
        
        // Get current extra time (if any)
        let extraTimeMinutes = parseInt($('#extraTimeDisplay').data('extra-time') || 0);
        
        // Add 30 minutes
        extraTimeMinutes += 30;
        
        // Calculate new duration and price
        const newDuration = baseDuration + extraTimeMinutes;
        const newPrice = basePrice + (extraTimeMinutes / 30) * 100; // 100 AED per 30 minutes
        
        // Update display with extra time info
        const extraSteps = extraTimeMinutes / 30;
        let extraDisplay = `
            <div id="extraTimeDisplay" class="extra-time-info" data-extra-time="${extraTimeMinutes}">
                <div class="extra-time-header">
                    <i class="fas fa-plus-circle"></i> Additional Time
                </div>
                <div class="extra-time-details">
                    <span class="extra-time-value">+${extraTimeMinutes} min</span>
                    <span class="extra-time-cost">+${(extraSteps * 100)} AED</span>
                </div>
                <button type="button" class="btn-remove-time">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;
        
        // Update hidden duration input with new total
        $durationInput.val(newDuration);
        $durationInput.data('price', newPrice);
        
        // Insert extra time display after the selected duration option
        const $parent = $(this).closest('.duration-option-wrapper');
        $parent.find('#extraTimeDisplay').remove();
        $parent.after(extraDisplay);
        
        // Update displayed price and duration
        $('#selectedPrice').text(newPrice);
        $('#selectedDuration').text(newDuration);
    });

    // ── Handle remove extra time ──
    $(document).on('click', '.btn-remove-time', function (e) {
        e.preventDefault();
        
        // Find the associated duration option
        const $extraDisplay = $(this).closest('.extra-time-info');
        const $durationWrapper = $extraDisplay.prev('.duration-option-wrapper');
        const $durationInput = $durationWrapper.find('.duration-input');
        
        // Reset to base values
        const baseDuration = parseInt($durationInput.data('base-duration'));
        const basePrice = parseInt($durationInput.data('base-price'));
        
        $durationInput.val(baseDuration);
        $durationInput.data('price', basePrice);
        
        // Remove extra time display
        $extraDisplay.remove();
        
        // Update displayed price and duration
        $('#selectedPrice').text(basePrice);
        $('#selectedDuration').text(baseDuration);
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
            // Build URL with therapist info if available
            let staffUrl = `staff-selection.html?serviceId=${serviceId}&serviceName=${encodeURIComponent(serviceName)}&price=${selectedPrice}&duration=${selectedDuration}&location=${selectedLocation}`;
            
            const therapistId = sessionStorage.getItem('selectedTherapistId');
            const therapistName = sessionStorage.getItem('selectedTherapistName');
            if (therapistId && therapistName) {
                staffUrl += `&therapistId=${therapistId}&therapistName=${encodeURIComponent(therapistName)}`;
            }
            
            window.location.href = staffUrl;
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
        // Calculate price range for studio
        const prices = service.durations.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;
        
        // Get durations for display - show only for studio by default
        const durations = service.durations.map(d => d.duration).join(', ');
        
        // Build home service info if available
        let homeServiceInfo = '';
        if (service.isHomeService && service.homeServiceDurations) {
            const homePrices = service.homeServiceDurations.map(d => d.price);
            const homeMinPrice = Math.min(...homePrices);
            const homeMaxPrice = Math.max(...homePrices);
            const homepriceRange = homeMinPrice === homeMaxPrice ? `${homeMinPrice}` : `${homeMinPrice} - ${homeMaxPrice}`;
            const homeDurations = service.homeServiceDurations.map(d => d.duration).join(', ');
            
            homeServiceInfo = `
                <div class="home-service-info">
                    <small style="color: #ffd700; font-weight: bold;">🏠 HOME SERVICE</small>
                    <div>${homeDurations} min • ${homepriceRange} AED</div>
                </div>
            `;
        }

        const card = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4 service-col" style="animation-delay: ${index * 0.07}s">
                <div class="service-card h-100">
                    <div class="service-image-wrap">
                        <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
                        <span class="service-category-badge">${service.category}</span>
                        ${service.isHomeService ? '<span class="home-service-badge"><i class="fas fa-home"></i> HOME AVAILABLE</span>' : ''}
                        <div class="service-price-tag">${priceRange} AED</div>
                        <a href="service-details.html?id=${service.id}" class="service-view-details" title="View Details">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                    <div class="service-card-body">
                        <h5 class="service-title">${service.name}</h5>
                        <p class="service-description">${service.description}</p>
                        <div class="service-meta">
                            <span class="service-duration"><i class="far fa-clock"></i> 🏢 Studio: ${durations} min</span>
                        </div>
                        ${homeServiceInfo}
                        <div class="service-button-group">
                            <button class="btn-book" data-toggle="modal" data-target="#durationModal" data-service-id="${service.id}" data-service-name="${service.name}" data-durations='${JSON.stringify(service.durations)}'>
                                Book Now <i class="fas fa-arrow-right"></i>
                            </button>
                            <a href="service-details.html?id=${service.id}" class="btn-view-details">
                                <i class="fas fa-info-circle"></i> Details
                            </a>
                        </div>
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