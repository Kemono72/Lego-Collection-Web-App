# 🧱 Lego Collection Web App – Fullstack Node.js + Tailwind

An interactive and responsive website for LEGO® enthusiasts to browse, manage, and organize their LEGO set collections. Built with Node.js, Express, PostgreSQL, and styled using TailwindCSS. Includes authentication, search filters, CRUD operations, and user history.

> Created for WEB322 – Web Programming Tools and Frameworks @ Seneca Polytechnic

---

## 🌐 Live Preview

*Website is currently hosted locally / offline.*

---

## 🚀 Key Features

- 🔐 User Authentication (Register/Login with session support)  
- ➕ Add new LEGO sets with image, name, theme & details  
- 🔄 Edit or delete sets in your collection  
- 🔍 Search/filter by LEGO theme or ID  
- 🕓 View user history of previously accessed sets  
- 🎨 Beautiful, mobile-friendly UI with TailwindCSS  
- 📦 PostgreSQL-powered backend with Sequelize ORM

---

## 📸 Screenshots

### 🏠 Website Homepage + Set List  
![Home View](./media/home_view.png)

### ➕ Add/Edit Set Interface  
![Add/Edit View](./media/add_edit_view.png)

---

## 🛠️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | EJS Templates + Tailwind CSS   |
| Backend     | Node.js + Express              |
| Database    | PostgreSQL + Sequelize         |
| Auth        | bcryptjs + express-session     |
| Hosting     | (Optional) Vercel / Railway    |

---

## 📂 Project Structure

lego-collection-app/
├── views/                 # EJS templates for dynamic web pages  
│   ├── home.ejs           # Home page with set listings  
│   ├── login.ejs          # Login form  
│   ├── register.ejs       # Register form  
│   ├── addSet.ejs         # Form to add new Lego sets  
│   ├── editSet.ejs        # Form to edit existing sets  
│   ├── set.ejs            # Individual set display  
│   ├── sets.ejs           # List all sets  
│   ├── userHistory.ejs    # Recently viewed sets  
│   ├── about.ejs          # About page  
│   └── 500.ejs            # Error page  
│
├── modules/               # Custom service modules  
│   ├── legoSets.js        # Handles DB operations for sets  
│   └── auth-service.js    # Authentication and session logic  
│
├── public/                # Static assets  
│   ├── css/               # Tailwind CSS and custom styles  
│   └── images/            # Public media/images  
│
├── media/                 # Screenshots for portfolio/README  
│   ├── home_view.png  
│   └── add_edit_view.png  
│
├── data/sets.csv          # Lego sets import/export data  
├── .env                   # Environment variables (not committed)  
├── server.js              # Express app entry point  
├── package.json           # Dependencies & scripts  
└── README.md              # You're reading it!
