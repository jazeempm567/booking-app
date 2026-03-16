// Booking Form — collects user details, validates, and proceeds to payment

$(document).ready(function () {
    // Populate summary from sessionStorage
    const serviceName = sessionStorage.getItem('serviceName') || '—';
    const staffName = sessionStorage.getItem('selectedStaffName') || '—';
    const servicePrice = sessionStorage.getItem('servicePrice') || '—';

    $('#sum-service').text(serviceName);
    $('#sum-staff').text(staffName);
    $('#sum-price').text(servicePrice !== '—' ? servicePrice + ' AED' : '—');

    // Set back button to preserve query params
    const serviceId = sessionStorage.getItem('serviceId') || '';
    const encodedName = encodeURIComponent(serviceName);
    $('#btn-back').attr('href', `staff-selection.html?serviceId=${serviceId}&serviceName=${encodedName}&price=${servicePrice}`);

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    $('#bookingDate').attr('min', today);

    // Form submission
    $('#bookingForm').on('submit', function (e) {
        e.preventDefault();

        // Reset validation
        $(this).find('.form-control').removeClass('is-invalid is-valid');
        $('.contact-error').hide();

        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const contact = $('#contact').val().trim();
        const bookingDate = $('#bookingDate').val();
        const bookingTime = $('#bookingTime').val();
        const notes = $('#notes').val().trim();

        let isValid = true;

        // Name validation
        if (name.length < 2) {
            $('#name').addClass('is-invalid');
            isValid = false;
        } else {
            $('#name').addClass('is-valid');
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            $('#email').addClass('is-invalid');
            isValid = false;
        } else {
            $('#email').addClass('is-valid');
        }

        // Contact validation (UAE: 5XXXXXXXX — 9 digits or with 0 prefix)
        const contactClean = contact.replace(/[\s\-]/g, '');
        const contactPattern = /^(0)?5[0-9]{8}$/;
        if (!contactPattern.test(contactClean)) {
            $('#contact').addClass('is-invalid');
            $('.contact-error').show();
            isValid = false;
        } else {
            $('#contact').addClass('is-valid');
        }

        // Date validation
        if (!bookingDate) {
            $('#bookingDate').addClass('is-invalid');
            isValid = false;
        } else {
            $('#bookingDate').addClass('is-valid');
        }

        // Time validation
        if (!bookingTime) {
            $('#bookingTime').addClass('is-invalid');
            isValid = false;
        } else {
            $('#bookingTime').addClass('is-valid');
        }

        if (!isValid) return;

        // Store booking data in sessionStorage
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userContact', '+971 ' + contactClean);
        sessionStorage.setItem('bookingDate', bookingDate);
        sessionStorage.setItem('bookingTime', bookingTime);
        sessionStorage.setItem('bookingNotes', notes);

        // Redirect to payment
        window.location.href = 'payment.html';
    });

    // Real-time validation feedback on input
    $('#name, #email, #contact, #bookingDate, #bookingTime').on('input change', function () {
        $(this).removeClass('is-invalid is-valid');
    });
});