const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Trail = require('../models/trail');

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/rate-my-run';
const AUTHOR_ID =
    process.env.SEED_AUTHOR_ID || '5f5c330c2cd79d538f2c66d9';
const COUNT = Number(process.env.SEED_COUNT || 200);

mongoose
    .connect(DB_URL)
    .then(() => console.log('[seed] DB connected:', DB_URL))
    .catch((e) => {
        console.error('[seed] DB connection error:', e);
        process.exit(1);
    });

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const surfaces = ['road', 'trail', 'mixed'];
const difficulties = ['easy', 'moderate', 'hard'];

const randomDistanceKm = () => +(Math.random() * (30 - 2) + 2).toFixed(1); // 2–30 km
const randomElevationGain = () => Math.floor(Math.random() * 1200); // 0–1200 m

const descriptions = [
    'Perfect for an early morning run with amazing views.',
    'Great shaded climb — good for hill repeats.',
    'Nice flat path, ideal for tempo runs.',
    'Challenging route with rocky terrain, but rewarding views.',
    'Peaceful trail along the river, lots of birds in the morning.',
    'Wide open path, great for intervals and speed workouts.',
    'Beautiful sunset views, though can get crowded on weekends.',
    'Great beginner trail — easy terrain with gradual climbs.',
    'A hidden gem — quiet and rarely busy.',
    'Perfect loop for a quick 5k training run.',
];

async function seedDB() {
    console.log('[seed] Clearing Trail collection...');
    await Trail.deleteMany({});

    const ops = [];
    for (let i = 0; i < COUNT; i++) {
        const idx = Math.floor(Math.random() * Math.min(1000, cities.length));
        const city = cities[idx];

        const name = `${sample(descriptors)} ${sample(places)}`;
        const distanceKm = randomDistanceKm();
        const elevationGain = randomElevationGain();

        const doc = new Trail({
            author: AUTHOR_ID,
            name,
            location: `${city.city}, ${city.state}`,
            description: sample(descriptions),
            distanceKm,
            elevationGain,
            surface: sample(surfaces),
            difficulty: sample(difficulties),
            geometry: {
                type: 'Point',
                coordinates: [city.longitude, city.latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dll6vua8p/image/upload/v1756494289/chander-r-z4WH11FMfIQ-unsplash_avdscl.jpg',
                    filename: 'RateMyRun/chander-r-z4WH11FMfIQ-unsplash_avdscl'
                },
                {
                    url: 'https://res.cloudinary.com/dll6vua8p/image/upload/v1756494285/venti-views-I1EWTM5mFEM-unsplash_bvq1kf.jpg',
                    filename: 'RateMyRun/venti-views-I1EWTM5mFEM-unsplash_bvq1kf',
                },
            ],
        });

        ops.push(doc.save());
    }

    await Promise.all(ops);
    console.log(`[seed] Seeded ${COUNT} trails ✅`);
}

seedDB()
    .catch((e) => {
        console.error('[seed] Error:', e);
    })
    .finally(() => {
        mongoose.connection.close(() => {
            console.log('[seed] DB connection closed');
            process.exit(0);
        });
    });