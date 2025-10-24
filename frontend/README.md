# RailConnect — Frontend UI

This is a Vite + React + Tailwind CSS frontend scaffold for a Railway Ticket Reservation System UI.

Features implemented:
- Home page with hero search
- Search results with sample trains and "Book Now" modal
- Booking modal with passenger details and PNR generation (stored in localStorage)
- My Bookings page listing bookings with cancel action
- Login and Signup pages with placeholders for AWS Cognito
- React Router and Toast notifications

How to run:

1. Open a terminal and cd into the frontend folder:

```powershell
cd "C:/Users/rayyan mukadam/OneDrive/Desktop/RAZIQ/cc_project/railway-reservation-system/frontend"
```

2. Install dependencies and run dev server:

```powershell
npm install
npm run dev
```

Notes:
- This is frontend-only mock UI. No backend or authentication is connected yet.
- Bookings are stored in browser localStorage for demo purposes.

Using your own hero image
- To use your provided train image instead of the random Unsplash image, place the image file named `train.jpg` into the `frontend/public/` folder. The app will load it from `/train.jpg` automatically.
