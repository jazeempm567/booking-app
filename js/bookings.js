// My Bookings Page — loads from localStorage, filters, detail modal, delete

$(document).ready(function () {
    let currentFilter = 'all';
    let currentDeleteId = null;

    loadBookings();

    // Tab filter
    $(document).on('click', '.booking-tab', function () {
        $('.booking-tab').removeClass('active');
        $(this).addClass('active');
        currentFilter = $(this).data('filter');
        loadBookings();
    });

    // View details
    $(document).on('click', '.booking-card', function () {
        const id = $(this).data('id');
        const bookings = getBookings();
        const b = bookings.find(x => x.id === id);
        if (!b) return;

        currentDeleteId = id;

        const statusClass = b.status === 'upcoming' ? 'status-upcoming' : 'status-completed';
        const statusLabel = b.status === 'upcoming' ? 'Upcoming' : 'Completed';

        $('#modal-body').html(`
            <div class="modal-status ${statusClass}">${statusLabel}</div>
            <div class="modal-detail-grid">
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-concierge-bell"></i> Service</span>
                    <span class="detail-value">${b.serviceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-user-tie"></i> Specialist</span>
                    <span class="detail-value">${b.staffName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-calendar"></i> Date</span>
                    <span class="detail-value">${formatDate(b.bookingDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-clock"></i> Time</span>
                    <span class="detail-value">${formatTime(b.bookingTime)}</span>
                </div>
                <hr>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-user"></i> Name</span>
                    <span class="detail-value">${b.userName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-envelope"></i> Email</span>
                    <span class="detail-value">${b.userEmail}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-phone"></i> Phone</span>
                    <span class="detail-value">${b.userContact}</span>
                </div>
                <hr>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-credit-card"></i> Payment</span>
                    <span class="detail-value">${b.paymentMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-hashtag"></i> Transaction</span>
                    <span class="detail-value detail-txn">${b.transactionId}</span>
                </div>
                <div class="detail-row detail-total">
                    <span class="detail-label">Total Paid</span>
                    <span class="detail-value">${b.totalAmount} AED</span>
                </div>
            </div>
        `);

        $('#bookingModal').modal('show');
    });

    // Delete booking
    $('#btn-delete-booking').on('click', function () {
        if (currentDeleteId) {
            let bookings = getBookings();
            bookings = bookings.filter(b => b.id !== currentDeleteId);
            localStorage.setItem('glamourBookings', JSON.stringify(bookings));
            currentDeleteId = null;
            $('#bookingModal').modal('hide');
            loadBookings();
        }
    });

    function loadBookings() {
        const bookings = getBookings();
        const container = $('#bookings-list');
        container.empty();

        // Auto-update status: if date is past → completed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookings.forEach(b => {
            const bDate = new Date(b.bookingDate);
            if (bDate < today && b.status === 'upcoming') {
                b.status = 'completed';
            }
        });
        localStorage.setItem('glamourBookings', JSON.stringify(bookings));

        // Count
        const upcoming = bookings.filter(b => b.status === 'upcoming');
        const completed = bookings.filter(b => b.status === 'completed');
        $('#count-all').text(bookings.length);
        $('#count-upcoming').text(upcoming.length);
        $('#count-completed').text(completed.length);

        // Filter
        let filtered = bookings;
        if (currentFilter === 'upcoming') filtered = upcoming;
        if (currentFilter === 'completed') filtered = completed;

        if (filtered.length === 0) {
            $('#no-bookings').removeClass('d-none');
            return;
        }
        $('#no-bookings').addClass('d-none');

        // Sort: newest first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        filtered.forEach((b, index) => {
            const statusClass = b.status === 'upcoming' ? 'card-upcoming' : 'card-completed';
            const statusBadge = b.status === 'upcoming'
                ? '<span class="badge-upcoming"><i class="fas fa-clock"></i> Upcoming</span>'
                : '<span class="badge-completed"><i class="fas fa-check-circle"></i> Completed</span>';

            const card = `
                <div class="booking-card ${statusClass}" data-id="${b.id}" style="animation-delay: ${index * 0.06}s">
                    <div class="booking-card-left">
                        <div class="booking-date-box">
                            <span class="date-day">${new Date(b.bookingDate).getDate()}</span>
                            <span class="date-month">${new Date(b.bookingDate).toLocaleString('en', { month: 'short' })}</span>
                        </div>
                    </div>
                    <div class="booking-card-center">
                        <h5 class="booking-service-name">${b.serviceName}</h5>
                        <p class="booking-staff"><i class="fas fa-user-tie"></i> ${b.staffName}</p>
                        <p class="booking-time-info">
                            <i class="far fa-clock"></i> ${formatTime(b.bookingTime)}
                            &nbsp;&middot;&nbsp;
                            <i class="fas fa-money-bill-wave"></i> ${b.totalAmount} AED
                        </p>
                    </div>
                    <div class="booking-card-right">
                        ${statusBadge}
                        <span class="view-details"><i class="fas fa-chevron-right"></i></span>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    function getBookings() {
        return JSON.parse(localStorage.getItem('glamourBookings') || '[]');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-AE', {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function formatTime(t) {
        if (!t || t === '—') return '—';
        const parts = t.split(':');
        let h = parseInt(parts[0]);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + m + ' ' + ampm;
    }
});
