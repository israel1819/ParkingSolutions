# Valet Parking System

A modern web application designed to streamline valet parking operations. This system provides a dedicated interface for valets to manage car parking and retrieval, and an administrative dashboard for overseeing operations and managing valet employees.

## 🚀 Features

* **User Authentication:** Secure Email/Password login and registration for both Valet and Admin roles.
* **Role-Based Access:** Distinct dashboards and functionalities based on user roles.
* **Valet Dashboard:**
    * **Car Parking:** Valets can log new cars into the system, generating unique parking IDs.
    * **Customer Communication (Simulated):**
        * Automatic message to customer 5 minutes after parking (simulated).
        * Valet can simulate customer requests for car retrieval (5, 10, 15 minutes options).
        * Automatic "Car Ready at Doorstep" message to customer when car is marked ready (simulated).
    * **Car Status Management:** Update car status (Parked, Requested, Ready, Delivered).
    * **Parking Spot Management:** Clear parking spots after car delivery.
* **Admin Dashboard:**
    * **Overview Metrics:** View total cars delivered and total valet employees.
    * **Valet Performance:** Monitor individual valet activity with daily and monthly parking charts.
    * **Employee Management:** Admins can securely add new valet employees to the system.

## 🏛️ Architecture Overview

The application follows a client-server architecture, leveraging modern web and backend technologies:

* **Frontend:** Built with **React.js** for a dynamic and responsive user interface, styled with **Tailwind CSS**. It interacts directly with Firebase for authentication and user profiles, and with the Java Spring Boot backend for all car-related operations.
* **Backend:** A **Java Spring Boot** application serving as the core business logic. It manages car data (currently in-memory, but designed for database integration) and orchestrates simulated messaging.
* **User Management (Firebase):**
    * **Firebase Authentication:** Handles user registration, login, and session management.
    * **Firebase Firestore:** Stores user profiles (roles, employee names) associated with Firebase UIDs.
* **Messaging Service:** A backend service responsible for sending notifications. Currently, it's a `ConsoleMessageService` (prints to backend console), designed for future integration with external services like **Twilio** for real WhatsApp messaging.

## ⚙️ Setup Instructions

Follow these steps to get the application running locally.

### Prerequisites

* Node.js (LTS version recommended) & npm (or Yarn)
* Java Development Kit (JDK 17 or higher)
* Apache Maven
* A Firebase Project (Google Cloud Project)

### 1. Firebase Project Setup

1.  **Create a Firebase Project:**
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Click "Add project" and follow the steps to create a new project.
2.  **Enable Authentication:**
    * In your Firebase project, navigate to **Build > Authentication**.
    * Go to the "Sign-in method" tab.
    * Enable the **"Email/Password"** provider. **Ensure "Anonymous" is DISABLED.**
3.  **Set up Firestore Database:**
    * In your Firebase project, navigate to **Build > Firestore Database**.
    * Click "Create database". Choose "Start in production mode" (you'll update rules shortly). Select a location.
    * **Update Firestore Security Rules:**
        * Go to the "Rules" tab in Firestore.
        * Replace the existing rules with the content from `firestore.rules` provided in the frontend code. This ensures proper read/write access for authenticated users and role-based access for valets/admins.
        * Click "Publish".
4.  **Get Firebase Web App Configuration:**
    * In your Firebase project settings (click the gear icon next to "Project overview"), go to "Project settings".
    * Under "Your apps", click the web icon (`</>`) to "Add app to get started".
    * Follow the steps, register your app, and **copy the Firebase configuration object**. You will need this for `src/FirebaseProvider.js`.

### 2. Frontend Setup (React)

1.  **Clone the Frontend Repository:**
    ```bash
    git clone <your-frontend-repo-url> valet-parking-frontend
    cd valet-parking-frontend
    ```
    *(If you don't have a separate repo, assume your current project directory is `valet-parking-frontend`.)*
2.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Configure Firebase:**
    * Open `src/FirebaseProvider.js`.
    * **Replace the placeholder `firebaseConfig` object** with the actual configuration you copied from your Firebase Console.
    * Ensure the `appId` in `FirebaseProvider.js` and other components (`App.js`, `AdminDashboard.js`, `ReceiveCarModule.js`, `Register.js`) is set to `1:1038485808891:web:94222225baddee049e725e`.
4.  **Run the Frontend Application:**
    ```bash
    npm start
    # or yarn start
    ```
    The frontend will open in your browser, typically at `http://localhost:3000`.

## 🧑‍💻 How to Use the Application

### Initial Access & Registration

1.  Open your browser to `http://localhost:3000`.
2.  You will be redirected to the **Login** page.
3.  Click on the "Register here" link to create a new account.
4.  **Register your first Admin user:** Fill in your name, email, a strong password, and select "Admin" for the role.
5.  After successful registration, you will be redirected to the Login page.

### Logging In

1.  Enter the email and password for your registered Admin or Valet account.
2.  Click "Login to Account".
3.  Upon successful login, you will be redirected to the appropriate dashboard based on your role.

### Admin Dashboard Features

1.  **Access:** Log in with an Admin account.
2.  **Overview:** View the "Total Cars Delivered" and "Total Valet Employees" counts.
3.  **Add New Employee:**
    * Click the "Add New Employee" card.
    * Fill in the new Valet's Employee Name, Email, and a temporary Password.
    * Click "Create Employee Account". This will create a new Firebase user and a Firestore profile with the 'valet' role.
    * The new valet will immediately appear in the "Valet Employee Performance" list.
4.  **Valet Performance:** Scroll down to see performance charts for each registered valet.

### Valet Dashboard Features

1.  **Access:** Log in with a Valet account.
2.  **Receive New Car:**
    * Click "Generate New Parking QR (for Customer)" to get a simulated parking ID.
    * Fill in the Car Make, Model, Number, and Customer Phone Number.
    * Click "Park Car". The car will appear in the "Current Parked Cars" list.
    * **Observe your Java backend terminal:** After 5 minutes, you should see a simulated message to the customer.
3.  **Simulate Customer Request:**
    * For a car with `PARKED` status, click one of the "Simulate Customer Request" buttons (5 min, 10 min, 15 min).
    * The car's status will change to `REQUESTED`.
    * **Observe your Java backend terminal:** You should see a simulated message to the valet about the customer's request.
4.  **Mark Ready:**
    * For a car with `REQUESTED` status, click "Mark Ready".
    * The car's status will change to `READY`.
    * **Observe your Java backend terminal:** You should see a simulated message to the customer ("Your car is ready at the doorstep!").
5.  **End Service / Car Delivered:**
    * For a car with `READY` status, click "End Service / Car Delivered".
    * The car record will be removed from the list, simulating delivery and parking spot clearance.
6.  **Clear Parking:**
    * You can use "Clear Parking" for any car to manually remove its record from the system.

## 🚧 Future Enhancements

* **Persistent Backend Database:** Integrate a real database (e.g., PostgreSQL, MySQL) with the Spring Boot backend to persist car data beyond application restarts.
* **Real-time Messaging:** Replace `ConsoleMessageService` with **Twilio WhatsApp Business API** integration for actual WhatsApp notifications.
* **Advanced Analytics:** Implement more detailed reporting and analytics for admin.
* **Customer Frontend:** Develop a simple customer-facing web page or mobile app for requesting cars and viewing status.
* **Payment Integration:** Add payment processing for valet services.
* **Parking Spot Availability:** Implement real-time tracking of parking spot availability.
