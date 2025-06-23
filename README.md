# 🧺 Home Inventory Tracker

A minimalist inventory tracking web app for managing household consumables like food, cleaning products, and other essential supplies. Originally adapted from the Family Chore Tracker project, this version tracks item quantities, categories, and notes — with support for archiving and basic reporting.

## 🚀 Features

- Add, edit, or archive consumable items (e.g., rice, detergent, eggs)
- Categorize items as **Food**, **Cleaning**, **Medicine**, etc.
- Set quantities with appropriate units (grams, kg, mL, etc.)
- Toggle visibility of archived items
- View real-time updates via Firebase
- Export or print inventory summaries
- Anonymous sign-in via Firebase Auth

## 🗃️ Tech Stack

- HTML + CSS + Vanilla JavaScript
- Firebase Realtime Database
- Firebase Authentication (anonymous)

## 📂 Folder Structure

```

/
├── index.html           # Main HTML file with form and list view
├── script.js            # JS logic for Firebase interactions and UI
├── styles.css           # Basic styling
├── README.md            # You're reading it

````

## 🔧 Setup Instructions

1. **Clone or download this repository**

   ```bash
   git clone https://github.com/yourusername/home-inventory-tracker.git
   cd home-inventory-tracker
````

2. **Set up Firebase**

   * Go to [Firebase Console](https://console.firebase.google.com/)
   * Create a new project
   * Enable **Realtime Database**
   * Enable **Anonymous Authentication**

3. **Update Firebase config**

   In `script.js`, replace the `firebaseConfig` values with your project’s credentials:

   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DB_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Open the app**

   You can simply open `index.html` in your browser (with Live Server or any local dev tool).

## 📊 Reporting

To generate a summary report:

* View the bottom of the page for total item count per category.
* Use your browser’s **Print > Save as PDF** for printable/exportable versions.

## 🧠 Ideas for Future Enhancements

* Expiry date tracking
* Barcode scanner integration
* User authentication with login
* Shopping list generation

## 📄 License

MIT License. Feel free to adapt or fork.

---

Made with ❤️ by \[apelicano] for home organization sanity.