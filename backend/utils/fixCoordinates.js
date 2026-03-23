/**
 * One-time migration script: unsets invalid `coordinates` fields
 * from Request and Donation documents that have `{ type: "Point" }`
 * but are missing the `coordinates` array.
 *
 * Run with: node utils/fixCoordinates.js
 */
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Request from '../models/Request.js';
import Donation from '../models/Donation.js';

dotenv.config();
await connectDB();

// Fix Requests with invalid coordinates
const badRequests = await Request.updateMany(
    {
        'coordinates.type': 'Point',
        'coordinates.coordinates': { $exists: false },
    },
    { $unset: { coordinates: '' } }
);
console.log(`Fixed ${badRequests.modifiedCount} Request document(s) with invalid coordinates.`);

// Fix Donations with invalid coordinates
const badDonations = await Donation.updateMany(
    {
        'coordinates.type': 'Point',
        'coordinates.coordinates': { $exists: false },
    },
    { $unset: { coordinates: '' } }
);
console.log(`Fixed ${badDonations.modifiedCount} Donation document(s) with invalid coordinates.`);

console.log('Migration complete.');
process.exit(0);
