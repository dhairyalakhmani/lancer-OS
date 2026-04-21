# LancerOS – Professional Freelance Management Suite

**LancerOS** is a comprehensive, SaaS application designed specifically for independent contractors and freelancers to manage the entire lifecycle of their business. From client onboarding and project tracking via a Kanban-style interface to dynamic financial invoicing and real-time business analytics, LancerOS serves as a centralized "Operating System" for professional productivity.

---

## 🚀 Project Overview

The primary objective of LancerOS is to solve the fragmented nature of freelance management. Instead of switching between disparate tools for communication, task management, and billing, LancerOS integrates these workflows into a high-performance, reactive dashboard. Built with a focus on low-latency updates and modular architecture, the platform ensures that data remains consistent across all business verticals.

## ✨ Core Features & Functionality

### 1. Unified Business Dashboard
The command center of the application provides an immediate overview of business health.
* **Real-time Metrics:** Dynamic calculation of Total Revenue, Active Projects, and Pending Tasks derived from live Firestore data.
* **Revenue Analytics:** An interactive Pie Chart (powered by Recharts) that provides a visual breakdown of revenue distribution across various corporations/clients.
* **Global Activity Stream:** A chronological, multi-collection feed that monitors every action taken across the app (new clients, task updates, generated invoices).

### 2. CRM (Client Relationship Management)
A dedicated module to manage professional contacts and historical data.
* **Secure Storage:** Detailed client profiles stored with strict User-ID isolation.
* **Fast Search/Filter:** Optimized client list rendering for quick access to contact information.

### 3. Smart Task Board (Kanban Workflow)
A logic-heavy task management system designed for agile project execution.
* **Drag-and-Drop Interface:** Seamless movement of tasks between 'To-Do', 'In-Progress', and 'Done' states.
* **Optimistic UI Updates:** Changes are reflected instantly on the frontend while syncing asynchronously with the Firebase backend to ensure a zero-lag user experience.

### 4. Dynamic Financial Engine (Invoicing)
The most complex module of the application, handling real-time arithmetic and document generation.
* **Live Math Processing:** Real-time calculation of subtotals, tax rates, and final totals as the user adds or modifies line items.
* **Document Generation:** Integrated "Blob" API functionality allowing users to generate and download professional text-based receipts directly from the browser.
* **Status Lifecycle:** Ability to toggle invoice states between 'Pending' and 'Paid', which immediately updates the global financial metrics on the Dashboard.

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | High-performance UI rendering and component architecture. |
| **Styling** | Tailwind CSS | Utility-first responsive design and Dark Mode support. |
| **Database** | Firebase Firestore | NoSQL Real-time database for live data synchronization. |
| **Auth** | Firebase Auth | Secure Google OAuth integration for user session management. |
| **Icons** | Lucide React | Consistent, professional iconography. |
| **Charts** | Recharts | SVG-based responsive data visualization. |

---

## 🏗️ Architectural Highlights

* **Custom Context API:** Centralized Authentication state management using React Context, providing a secure "Gatekeeper" for protected routes.
* **Firestore Security Rules:** Implemented server-side rules to ensure that users can only read/write data associated with their unique `uid`.
* **Multi-Collection Listeners:** The Dashboard utilizes concurrent `onSnapshot` listeners to merge data from three separate collections into a single sorted stream.
* **Optimized Performance:** Extensive use of `useMemo` and `useCallback` hooks to prevent unnecessary re-renders during complex mathematical calculations.

---

## 🚀 Installation and Setup

To run LancerOS locally, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/LancerOS.git](https://github.com/your-username/LancerOS.git)
cd LancerOS
2. Install Dependencies
Bash
npm install
3. Environment Configuration
Create a .env.local file in the root directory and add your Firebase credentials:

Code snippet
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
4. Run Development Server
Bash
npm run dev
The application will be available at http://localhost:5173.
```

### 5. Build for Production
``` bash
npm run build
firebase deploy
```
### 📖 Usage Guide
1) Authentication: Sign in using your Google account. Your data is isolated and visible only to you.

2) Onboarding: Navigate to the Clients page to add your first corporation or client.

3) Task Management: Go to the Tasks board. Create a task and drag it across columns as your work progresses.

4) Billing: Open the Invoices page. Create a new invoice, add multiple line items with rates/quantities, and save.

5) Analytics: Check the Dashboard to see your revenue pie chart and activity feed update automatically once an invoice is marked as "Paid".

Author: Dhairya Lakhmani
Version: 1.0.0
Institute: Scaler School of Technology

