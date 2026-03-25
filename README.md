# Zahi Spa — Premium Massage & Wellness Center

## Overview
Zahi Spa is a premium booking application for massage therapy and wellness services. Users can browse our selection of therapeutic massage treatments, book appointments with expert therapists, and make secure payments. We offer studio treatments and specialized massage services at our Dubai location.

## Features
- Browse 15 premium massage and wellness services
- Filter services including dedicated home service options
- Select expert therapists for appointments
- Input user information (name, email, contact number)
- Process payments through secure Stripe payment gateway (AED currency)
- Generate and display booking receipts after successful payment
- Responsive design for mobile, tablet, and desktop

## Services Offered
- Swedish Massage
- Deep Tissue Massage (available for home services)
- Thai Massage (available for home services)
- Hot Stone Massage
- Aromatherapy Massage (available for home services)
- Sports Massage (available for home services)
- Reflexology (available for home services)
- Couples Massage
- Back, Neck & Shoulder Massage (available for home services)
- Facial Spa
- Prenatal Massage (available for home services)
- Lomi Lomi Massage

## Project Structure
```
zahi-spa
├── css
│   ├── style.css
│   ├── services.css
│   ├── booking.css
│   ├── payment.css
│   └── receipt.css
├── js
│   ├── app.js
│   ├── services.js
│   ├── booking.js
│   ├── staff-selection.js
│   ├── user-info.js
│   ├── payment.js
│   └── receipt.js
├── pages
│   ├── services.html
│   ├── staff-selection.html
│   ├── booking-form.html
│   ├── payment.html
│   └── receipt.html
├── data
│   ├── services.json
│   └── staff.json
├── vendor
│   └── README.md
├── index.html
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in your web browser to access the application.
3. Ensure you have an internet connection to load external libraries and payment gateway services.

## Usage Guidelines
- Navigate to the services page to view available services.
- Select a staff member and fill out the booking form with your information.
- Proceed to the payment page to complete your booking.
- After payment, a receipt will be generated for your records.

## Technologies Used
- HTML
- CSS
- JavaScript
- jQuery
- Bootstrap

## 🚀 Production Deployment

**Deploy for FREE on Railway** (recommended)

### Quick Start
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Connect GitHub repository
4. Add Stripe API keys as environment variables
5. Deploy with one click

**For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Free Hosting Options
- **Railway** ⭐ (Best - $5/month credit, no cold starts)
- **Vercel** (Good for frontend, has cold starts)
- **Render** (Alternative to Railway)

### Requirements for Production
- Stripe account (free) with API keys
- GitHub repository for auto-deployment
- Railway/Vercel account (free)

---

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.