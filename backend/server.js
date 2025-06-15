const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const watchHistoryRoutes = require('./routes/watchHistoryRoutes');
const episodesRoutes = require('./routes/episodesRoutes');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));
app.use('/video', express.static('public/video'));

// Routes
app.use('/', authRoutes);
app.use('/', movieRoutes);
app.use('/', reviewRoutes);
app.use('/', userRoutes);
app.use('/', categoryRoutes);
app.use('/', favoritesRoutes);
app.use('/', watchHistoryRoutes);
app.use('/', episodesRoutes);

// Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});