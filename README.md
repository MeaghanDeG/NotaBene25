
———NOTA-BENE————     from the latin  note well; take note

A full-stack notes application designed to simplify and organize your life. Whether it’s grocery lists, to-do tasks, or general notes, Nota Bene lets you keep everything in one place. Integrated with a calendar view, you can also schedule and manage important dates.



Features 🚀
——
Core Functionalities:

- User Authentication: Secure login and signup system, including email verification.

- Create Notes:
      - **Grocery Lists**: Add items dynamically.
      - **To-Do Lists**: Create and check off tasks.
        - **General Notes**: A freeform space for your thoughts.

- Calendar Integration: Assign notes to specific dates and view them on a calendar.
- Edit/Delete Notes: Modify or remove notes as needed.

—-

Highlights:
- Responsive and user-friendly UI.
- Secure password hashing with `bcrypt.js`.
- JWT-based authentication for session management.
- Modern, professional design using `Bootstrap` and `FullCalendar.js`.

---

 Installation 🛠️

 Prerequisites:
- Node.js and npm installed
- MongoDB Atlas or a local MongoDB instance
- A verified email address for testing email verification (optional)

****Steps:

1. Clone the repository:
         
	git clone <MeaghanDeG/NotaBene25>
  	 cd NotaBene

 2.Install dependencies:               	 npm install
  
3.Create a .env file in the root folder and add the following:  	PORT=5001 
	JWT_SECRET=_jwt_secret 	
	EMAIL_SECRET=your_email_secret 
	BASE_URL=http://127.0.0.1:5001 
	MONGO_URI=your_mongodb_connection_string 
	EMAIL_USER=your_email@example.com 
	EMAIL_PASS=your_email_password


4.Start the server:
         	node server.js   5. Open index.html in your browser or use a development server to test the frontend.  ————


File Structure 📂


NotaBene/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── calendar.js
│   │   ├── signup.js
│   │   └── login.js
├── models/
│   ├── Note.js
│   └── User.js
├── routes/
│   ├── auth.js
│   └── notes.js
├── .env
├── server.js
├── package.json
├── README.md


———-



How It Works ⚙️

1. User Authentication:
* Signup with a username, email, and password.
* Email verification ensures only verified users can log in.
* Passwords are hashed for security using bcrypt.js.
2. Notes Management:
* Create grocery lists, to-do lists, or general notes.
* Notes are saved in MongoDB, tied to the logged-in user.
* View or edit notes anytime, and delete when no longer needed.
3. Calendar Integration:
* Schedule notes by adding a calendar date during creation.
* View notes directly in the calendar interface.


————


Technologies Used 🛠️
* Backend:
    * Node.js
    * Express.js
    * MongoDB (via Mongoose)
    * bcrypt.js (password hashing)
    * JWT (authentication)
* Frontend:
    * HTML/CSS
    * Bootstrap
    * FullCalendar.js
* Email:
    * Nodemailer


—————

Future Improvements 🌱
* Impossible. Perfection achieved
* Implement user-specific settings (e.g., themes or preferences).
* Add search and filtering functionality for notes.
* Enable drag-and-drop notes in the calendar view.
* Improved UI/UX
* Sharing notes with other users
* Push notifications for reminder
* So, so many others it staggers the mind
* Ignore first and eighth ‘Future Improvements’ for no nonsense evaluation purposes 




