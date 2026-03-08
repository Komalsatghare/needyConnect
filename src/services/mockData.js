export const mockCategories = [
    'Food',
    'Clothes',
    'Books',
    'Education',
    'Medical',
    'Other'
];

export const mockRequests = [
    {
        id: 'req-1',
        title: 'Winter clothes for children',
        description: 'Looking for winter jackets and sweaters for 3 children aged 5-10 years. We recently moved and are struggling with the cold weather.',
        category: 'Clothes',
        location: 'Downtown Community Center',
        status: 'pending',
        createdAt: '2026-03-01T10:00:00Z',
        contactPreference: 'email',
        user: { name: 'Sarah Jenkins', id: 'usr-1' }
    },
    {
        id: 'req-2',
        title: 'Textbooks for 10th grade',
        description: 'Need math and science textbooks for the current curriculum. Any used copies in readable condition would be greatly appreciated.',
        category: 'Books',
        location: 'Westside High Area',
        status: 'accepted',
        createdAt: '2026-03-02T14:30:00Z',
        contactPreference: 'phone',
        user: { name: 'Marcus Cole', id: 'usr-2' }
    },
    {
        id: 'req-3',
        title: 'Non-perishable food items',
        description: 'Our local shelter is running very low on canned goods and unexpired non-perishable food items.',
        category: 'Food',
        location: 'Hope Lane Shelter',
        status: 'completed',
        createdAt: '2026-02-28T09:15:00Z',
        contactPreference: 'platform',
        user: { name: 'Community Center', id: 'usr-3' }
    },
    {
        id: 'req-4',
        title: 'Need a wheelchair for elderly parent',
        description: 'Looking to borrow or receive a donated wheelchair for my mother who recently injured her knee and cannot walk long distances.',
        category: 'Medical',
        location: 'North Suburbs',
        status: 'pending',
        createdAt: '2026-03-05T11:20:00Z',
        contactPreference: 'platform',
        user: { name: 'David Lee', id: 'usr-4' }
    }
];

export const mockDonations = [
    {
        id: 'don-1',
        title: 'Assorted Childrens Books',
        description: 'A box of about 20 gently used storybooks suitable for ages 3-8.',
        category: 'Books',
        location: 'Eastside Library Entrance',
        quantity: 1,
        status: 'available',
        createdAt: '2026-03-04T16:45:00Z',
        user: { name: 'Emily Chen', id: 'usr-5' }
    },
    {
        id: 'don-2',
        title: 'Unused Winter Coats (Adult M/L)',
        description: 'I have 3 adult winter coats in good condition that I no longer need.',
        category: 'Clothes',
        location: 'City Center Mall Parking',
        quantity: 3,
        status: 'available',
        createdAt: '2026-03-05T08:30:00Z',
        user: { name: 'Robert Johnson', id: 'usr-6' }
    },
    {
        id: 'don-3',
        title: 'Canned Vegetables and Pasta',
        description: 'Surplus food from a recent community event. Unopened, well within expiration dates.',
        category: 'Food',
        location: 'Northside Community Hall',
        quantity: 50,
        status: 'claimed',
        createdAt: '2026-03-01T12:00:00Z',
        user: { name: 'Event Organizers', id: 'usr-7' }
    }
];

export const mockUser = {
    id: 'usr-me',
    name: 'Alex Volunteer',
    email: 'alex.v@example.com',
    phone: '555-0199',
    stats: {
        requestsPosted: 2,
        donationsOffered: 5,
        activeRequests: 1
    },
    history: [
        { type: 'donation', action: 'Offered Winter Coats', date: '2026-03-05T08:30:00Z' },
        { type: 'request', action: 'Accepted Request for Textbooks', date: '2026-03-03T10:15:00Z' },
        { type: 'donation', action: 'Donated Canned Foods', date: '2026-02-25T14:00:00Z' }
    ]
};
