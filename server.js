const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to test project' });
});

const contactRoutes = require('./routes/contactRoutes');
const segmentRoutes = require('./routes/segmentRoutes');
const jobsRoutes = require('./routes/jobsRoutes');

app.use('/v1/contacts', contactRoutes);
app.use('/v1/segments', segmentRoutes);
app.use('/v1/jobs', jobsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});