// Staff Selection Page

$(document).ready(function () {
    // Read service info from URL params
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('serviceId');
    const serviceName = params.get('serviceName') || 'Selected Service';
    const servicePrice = params.get('price') || '—';

    // Show selected service banner
    $('#service-info').html(`
        <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div>
                <i class="fas fa-concierge-bell mr-2"></i>
                <strong>${decodeURIComponent(serviceName)}</strong>
            </div>
            <div class="service-price-tag">${servicePrice} AED</div>
        </div>
    `);

    // Store service data in session
    sessionStorage.setItem('serviceId', serviceId);
    sessionStorage.setItem('serviceName', decodeURIComponent(serviceName));
    sessionStorage.setItem('servicePrice', servicePrice);

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