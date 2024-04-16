const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.mongodb);
const { z } = require('zod');
const port = process.env.PORT || 3000;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true }
});

const User = mongoose.model('User', userSchema);

const validationSchema = z.object({
    name: z.string(),
    email: z.string().email()
}).strict();

function validateEmail(data) {
    let result = validationSchema.safeParse(data);
    return result.success ? true : false;
}




app.get('/', (req, res) => {
    res.send("Welcome to Mailsender");
});
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

app.post('/local/mailer', async (req, res) => {
    let { name, email } = req.body;
    if (!validateEmail({ name, email })) {
        return res.status(422).send({ error: 'Invalid input' });
    }
    else {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.email,
                pass: process.env.emailPass
            }
        });

        let mailOptions = {
            from: process.env.email,
            to: `${email}`,
            subject: 'Test mail',
            text: `Hello ${name}, this is a test email!`
        };

        transporter.sendMail(mailOptions,  async function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);

                const user = new User({ name, email });
                user.save()
                    .then(() => console.log('User saved to database'))
                    .catch(err => console.log('Error saving user to database: ', err));
                return res.json({ message: 'Email has been sent!' });
            }
        });
    }
});

app.post('/deploy/mailer', (req, res) => {
    let data = req.body;
});