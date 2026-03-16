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
        } else {
            displayServices(allServices.filter(s => s.category === category));
        }
    });
});

function buildFilterButtons(services) {
    const categories = [...new Set(services.map(s => s.category))];
    const filterBar = $('#filter-bar');
    const icons = {
        'Hair': 'fa-cut', 'Skin Care': 'fa-spa', 'Massage': 'fa-hand-holding-heart',
        'Nails': 'fa-hand-sparkles', 'Grooming': 'fa-user-tie',
        'Makeup': 'fa-crown', 'Hair Removal': 'fa-pump-soap'
    };
    categories.forEach(cat => {
        const icon = icons[cat] || 'fa-concierge-bell';
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
        const card = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4 service-col" style="animation-delay: ${index * 0.07}s">
                <div class="service-card h-100">
                    <div class="service-image-wrap">
                        <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
                        <span class="service-category-badge">${service.category}</span>
                        <div class="service-price-tag">${service.price} AED</div>
                    </div>
                    <div class="service-card-body">
                        <h5 class="service-title">${service.name}</h5>
                        <p class="service-description">${service.description}</p>
                        <div class="service-meta">
                            <span class="service-duration"><i class="far fa-clock"></i> ${service.duration} min</span>
                        </div>
                        <a href="staff-selection.html?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&price=${service.price}" class="btn-book">
                            Book Now <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.append(card);
    });
}