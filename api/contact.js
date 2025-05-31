// sspl-be/api/contact.js
const nodemailer = require('nodemailer');
const cors = require('cors'); // You might still need this if you don't configure Vercel CORS explicitly

// Initialize CORS middleware (apply to every request this function handles)
const corsMiddleware = cors();

// This is the Vercel Serverless Function handler
// It's similar to an Express route handler: (req, res) => { ... }
module.exports = async (req, res) => {
    // Apply CORS middleware
    // This allows your React frontend (on Netlify/Vercel) to send requests to this backend function
    corsMiddleware(req, res, async () => {
        // Ensure it's a POST request, as your form uses POST
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        // Your existing Nodemailer setup
        // It uses environment variables, which you'll set on Vercel
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Get data from the request body (Vercel automatically parses JSON for POST requests)
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }

        try {
            // Email content and recipient
            let mailOptions = {
                // 'from' field uses environment variables for display name and sender email
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                // 'to' field uses an environment variable for the recipient email
                to: process.env.EMAIL_RECEIVER,
                subject: `New Client Query ${subject} from ${name}`,
                html: `
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong><br/> ${message}</p>
                `,
            };

            // Send the email
            await transporter.sendMail(mailOptions);
            console.log(`Email sent from ${email} to ${mailOptions.to}`);
            res.status(200).json({ message: 'Message sent successfully!' });

        } catch (error) {
            console.error('Error sending email:', error);
            // Send an error response back to your React app
            res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
    });
};