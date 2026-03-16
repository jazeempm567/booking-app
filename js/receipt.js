// Receipt Page — displays booking confirmation and saves to localStorage

$(document).ready(function () {
    const serviceName = sessionStorage.getItem('serviceName') || '—';
    const staffName = sessionStorage.getItem('selectedStaffName') || '—';
    const price = parseFloat(sessionStorage.getItem('servicePrice')) || 0;
    const bookingDate = sessionStorage.getItem('bookingDate') || '—';
    const bookingTime = sessionStorage.getItem('bookingTime') || '—';
    const userName = sessionStorage.getItem('userName') || '—';
    const userEmail = sessionStorage.getItem('userEmail') || '—';
    const userContact = sessionStorage.getItem('userContact') || '—';
    const paymentMethod = sessionStorage.getItem('paymentMethod') || '—';
    const transactionId = sessionStorage.getItem('transactionId') || '—';
    const paymentDate = sessionStorage.getItem('paymentDate') || '—';
    const vat = parseFloat(sessionStorage.getItem('vatAmount')) || 0;
    const total = parseFloat(sessionStorage.getItem('totalAmount')) || 0;

    // Format the date nicely
    let displayDate = bookingDate;
    if (bookingDate !== '—') {
        const d = new Date(bookingDate);
        displayDate = d.toLocaleDateString('en-AE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Format time to 12h
    let displayTime = bookingTime;
    if (bookingTime !== '—') {
        const parts = bookingTime.split(':');
        let h = parseInt(parts[0]);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        displayTime = h + ':' + m + ' ' + ampm;
    }

    // Populate receipt
    $('#r-service').text(serviceName);
    $('#r-staff').text(staffName);
    $('#r-date').text(displayDate);
    $('#r-time').text(displayTime);
    $('#r-name').text(userName);
    $('#r-email').text(userEmail);
    $('#r-email-top').text(userEmail);
    $('#r-phone').text(userContact);
    $('#r-method').text(paymentMethod);
    $('#r-pay-date').text(paymentDate);
    $('#r-txn-id').text(transactionId);
    $('#r-subtotal').text(price.toFixed(2) + ' AED');
    $('#r-vat').text(vat.toFixed(2) + ' AED');
    $('#r-total').text(total.toFixed(2) + ' AED');

    // ── Save booking to localStorage ──
    saveBookingLocally({
        serviceName, staffName, bookingDate, bookingTime,
        userName, userEmail, userContact,
        paymentMethod, transactionId, paymentDate,
        servicePrice: price, vatAmount: vat, totalAmount: total
    });
});

function saveBookingLocally(data) {
    // Don't save if no transaction ID (page opened without completing flow)
    if (!data.transactionId || data.transactionId === '—') return;

    const bookings = JSON.parse(localStorage.getItem('glamourBookings') || '[]');

    // Prevent duplicate saves (same transaction ID)
    if (bookings.some(b => b.transactionId === data.transactionId)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(data.bookingDate);
    const status = bDate >= today ? 'upcoming' : 'completed';

    const booking = {
        id: 'BK-' + Date.now(),
        serviceName: data.serviceName,
        staffName: data.staffName,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        userName: data.userName,
        userEmail: data.userEmail,
        userContact: data.userContact,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        paymentDate: data.paymentDate,
        servicePrice: data.servicePrice,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount,
        status: status,
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    localStorage.setItem('glamourBookings', JSON.stringify(bookings));
}