// Payment Page — Stripe Integration (Card + Apple Pay / Google Pay)

let stripe, elements, cardElement;

$(document).ready(async function () {
    // ── Populate summary from sessionStorage ──
    const serviceName = sessionStorage.getItem('serviceName') || '—';
    const staffName = sessionStorage.getItem('selectedStaffName') || '—';
    const serviceLocation = sessionStorage.getItem('serviceLocation') || 'studio';
    const locationDisplay = serviceLocation === 'home' ? '🏠 Your Home' : '🏢 Our Studio';
    const price = parseFloat(sessionStorage.getItem('servicePrice')) || 0;
    const bookingDate = sessionStorage.getItem('bookingDate') || '—';
    const bookingTime = sessionStorage.getItem('bookingTime') || '—';
    const userName = sessionStorage.getItem('userName') || '—';
    const userEmail = sessionStorage.getItem('userEmail') || '';

    const vat = +(price * 0.05).toFixed(2);
    const total = +(price + vat).toFixed(2);

    $('#sum-service').text(serviceName);
    $('#sum-staff').text(staffName);
    $('#sum-location').text(locationDisplay);
    $('#location-row').show();
    $('#sum-date').text(bookingDate);
    $('#sum-time').text(formatTime(bookingTime));
    $('#sum-name').text(userName);
    $('#sum-subtotal').text(price + ' AED');
    $('#sum-vat').text(vat + ' AED');
    $('#sum-total').text(total + ' AED');
    $('#btn-amount').text(total);

    sessionStorage.setItem('totalAmount', total);
    sessionStorage.setItem('vatAmount', vat);

    // ── Initialize Stripe ──
    try {
        const configRes = await fetch('/api/config');
        const config = await configRes.json();
        stripe = Stripe(config.publishableKey);
    } catch (err) {
        console.error('Failed to load Stripe config:', err);
        $('#card-errors').text('Unable to connect to payment server. Please try again.').show();
        return;
    }

    // ── Create Stripe Elements ──
    elements = stripe.elements({
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap' }]
    });

    // Style the card element to match our design
    const elementStyle = {
        base: {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '15px',
            color: '#f0ece2',
            '::placeholder': { color: '#b2bec3' },
            fontSmoothing: 'antialiased'
        },
        invalid: {
            color: '#e17055',
            iconColor: '#e17055'
        }
    };

    cardElement = elements.create('card', {
        style: elementStyle,
        hidePostalCode: true  // not needed for UAE
    });

    cardElement.mount('#stripe-card-element');

    // Show card errors in real-time
    cardElement.on('change', function (event) {
        const errorEl = $('#card-errors');
        if (event.error) {
            errorEl.text(event.error.message).show();
        } else {
            errorEl.text('').hide();
        }
    });

    // ── Setup Apple Pay / Google Pay (Payment Request Button) ──
    const paymentRequest = stripe.paymentRequest({
        country: 'AE',
        currency: 'aed',
        total: {
            label: serviceName + ' — Glamour Studio',
            amount: Math.round(total * 100) // in fils
        },
        requestPayerName: true,
        requestPayerEmail: true
    });

    const prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
        style: {
            paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: '48px'
            }
        }
    });

    // Check if Apple Pay / Google Pay is available
    const prResult = await paymentRequest.canMakePayment();
    if (prResult) {
        prButton.mount('#payment-request-button');
    } else {
        $('#payment-request-unavailable').removeClass('d-none');
    }

    // Handle Payment Request (Apple Pay / Google Pay) payment
    paymentRequest.on('paymentmethod', async function (ev) {
        try {
            // Create PaymentIntent on server
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: 'aed',
                    customerName: ev.payerName || userName,
                    customerEmail: ev.payerEmail || userEmail,
                    serviceName: serviceName,
                    staffName: staffName,
                    serviceDuration: sessionStorage.getItem('serviceDuration') || '',
                    bookingDate: bookingDate,
                    bookingTime: bookingTime,
                    price: price,
                    vat: vat
                })
            });
            const { clientSecret } = await res.json();

            // Confirm the payment
            const { paymentIntent, error } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
            );

            if (error) {
                ev.complete('fail');
                return;
            }

            ev.complete('success');

            if (paymentIntent.status === 'requires_action') {
                const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
                if (actionError) {
                    $('#card-errors').text('Payment authentication failed.').show();
                    return;
                }
            }

            completePayment(paymentIntent.id, 'Apple Pay / Google Pay');

        } catch (err) {
            ev.complete('fail');
            console.error('Payment Request error:', err);
        }
    });

    // ── Payment method tabs ──
    $('.pay-tab').on('click', function () {
        $('.pay-tab').removeClass('active');
        $(this).addClass('active');
        const method = $(this).data('method');
        if (method === 'card') {
            $('#card-form').removeClass('d-none');
            $('#apple-pay-form').addClass('d-none');
        } else {
            $('#card-form').addClass('d-none');
            $('#apple-pay-form').removeClass('d-none');
        }
    });

    // ── Card form submission ──
    $('#payment-form').on('submit', async function (e) {
        e.preventDefault();

        const cardName = $('#card-name').val().trim();
        if (cardName.length < 2) {
            $('#card-name').addClass('is-invalid');
            return;
        }
        $('#card-name').removeClass('is-invalid').addClass('is-valid');

        // Show loading
        $('.btn-pay-text').addClass('d-none');
        $('.btn-pay-loader').removeClass('d-none');
        $('#btn-pay').prop('disabled', true);
        $('#card-errors').text('').hide();

        try {
            // 1. Create PaymentIntent on the server
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: 'aed',
                    customerName: cardName,
                    customerEmail: userEmail,
                    serviceName: serviceName,
                    staffName: staffName,
                    serviceDuration: sessionStorage.getItem('serviceDuration') || '',
                    bookingDate: bookingDate,
                    bookingTime: bookingTime,
                    price: price,
                    vat: vat
                })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // 2. Confirm payment with Stripe.js
            const { paymentIntent, error } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardName,
                        email: userEmail
                    }
                }
            });

            if (error) {
                // Show error in the card-errors div
                $('#card-errors').text(error.message).show();
                resetPayButton();
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                completePayment(paymentIntent.id, 'Credit/Debit Card');
            }

        } catch (err) {
            console.error('Payment error:', err);
            $('#card-errors').text(err.message || 'Payment failed. Please try again.').show();
            resetPayButton();
        }
    });

    // ── Clear name validation on input ──
    $('#card-name').on('input', function () {
        $(this).removeClass('is-invalid is-valid');
    });

    // ── View receipt button ──
    $('#btn-view-receipt').on('click', function () {
        window.location.href = 'receipt.html';
    });
});

// ── Complete payment → show success modal ──
function completePayment(paymentIntentId, method) {
    sessionStorage.setItem('paymentMethod', method);
    sessionStorage.setItem('transactionId', paymentIntentId);
    sessionStorage.setItem('paymentDate', new Date().toLocaleDateString('en-AE', {
        year: 'numeric', month: 'long', day: 'numeric'
    }));

    // Save booking to admin dashboard
    saveBookingToServer(paymentIntentId);

    $('#txn-id').text(paymentIntentId);
    $('#successModal').modal('show');
}

// ── Reset pay button ──
function resetPayButton() {
    $('.btn-pay-text').removeClass('d-none');
    $('.btn-pay-loader').addClass('d-none');
    $('#btn-pay').prop('disabled', false);
}

// ── Helper: format 24h time to 12h ──
function formatTime(t) {
    if (!t || t === '—') return '—';
    const parts = t.split(':');
    let h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m + ' ' + ampm;
}

// ── Save booking to server ──
async function saveBookingToServer(paymentIntentId) {
    try {
        const bookingData = {
            paymentIntentId: paymentIntentId,
            customerName: sessionStorage.getItem('userName') || '',
            customerEmail: sessionStorage.getItem('userEmail') || '',
            serviceName: sessionStorage.getItem('serviceName') || '',
            staffName: sessionStorage.getItem('selectedStaffName') || '',
            serviceDuration: sessionStorage.getItem('serviceDuration') || '',
            bookingDate: sessionStorage.getItem('bookingDate') || '',
            bookingTime: sessionStorage.getItem('bookingTime') || '',
            serviceLocation: sessionStorage.getItem('serviceLocation') || 'studio',
            price: parseFloat(sessionStorage.getItem('servicePrice')) || 0,
            vat: parseFloat(sessionStorage.getItem('vatAmount')) || 0,
            amount: parseFloat(sessionStorage.getItem('totalAmount')) || 0,
            status: 'confirmed'
        };

        console.log('💾 Saving booking:', bookingData);

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            const savedBooking = await response.json();
            console.log('✅ Booking saved successfully:', savedBooking);
        } else {
            console.error('❌ Failed to save booking');
        }
    } catch (error) {
        console.error('❌ Error saving booking:', error);
    }
}