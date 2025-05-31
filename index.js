// backend/index.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Remember this is for allowing your React app to talk to this server

const app = express();
const port = 3001; // This is where your backend server will "listen"

// --- Important Setup for Express ---
app.use(cors()); // Allow cross-origin requests from your frontend
app.use(express.json()); // This helps Express understand incoming JSON data (like your form data)

// --- Email Sending Setup (Nodemailer) ---
// This is like setting up your mail service provider (e.g., Gmail, Outlook, SendGrid)
// IMPORTANT: For production, you should use environment variables (e.g., process.env.EMAIL_USER)
// instead of hardcoding credentials directly here for security.
let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail', 'outlook', or provide custom SMTP details
    auth: {
        user: process.env.EMAIL_USER, // Will be set on Render dashboard
        pass: process.env.EMAIL_PASS   // Will be set on Render dashboard
    }
    // If using another service like SendGrid, Mailgun etc., you'd configure it like:
    /*
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false, // Use 'true' for 465, 'false' for 587 (TLS)
    auth: {
        user: "apikey", // For SendGrid, user is 'apikey'
        pass: "YOUR_SENDGRID_API_KEY", // Your SendGrid API Key
    }
    */
});

// --- Create a "Route" for your Contact Form ---
// This is like creating a specific "door" (endpoint) on your server
// that your React app will send the form data to.
app.post('/api/contact', async (req, res) => {
    // req.body contains the data sent from your React form
    const { name, email, subject, message } = req.body;

    // Basic check to make sure all fields have some data
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    try {
        // What email should be sent:
        let mailOptions = {
            // CORRECTED: This line must use backticks (`) for the template literal
            // and be free of any extra HTML/Markdown characters like <span>
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: process.env.EMAIL_RECEIVER, // Will be set on Render dashboard
            subject: `New Client Query ${subject} from ${name}`, // Subject line for the email you receive
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong><br/> ${message}</p>
            `, // The content of the email (HTML format)
        };

        // Actually send the email!
        await transporter.sendMail(mailOptions);
        console.log(`Email sent from ${email} to ${mailOptions.to}`);
        res.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        // Send an error response back to your React app
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});