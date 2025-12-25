import Event from "./Event.js";
import mongoose from 'mongoose';

function convertDate(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const dateObject = new Date(year, month, day);
    return dateObject;
}

function dayRange(dateObj) {
    const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

export async function addEvent(args) {
    try {
        const date = convertDate(args.date);
        const newEvent = new Event({
            name: args.name,
            date
        });
        const saved = await newEvent.save();
        return saved;
    } catch (err) {
        console.error('addEvent error:', err);
        throw err;
    }
};

export async function getEvents() {
    try {
        // Fetch all events sorted by date ascending
        const events = await Event.find({}).sort({ date: 1 }).exec();
        console.log('getEvents: fetched', Array.isArray(events) ? events.length : 0, 'events');
        return events || [];
    } catch (err) {
        console.error('Error fetching events:', err);
        return [];
    }
}

export async function getEventByDate(dateString) {
    try {
        const date = convertDate(dateString);
        const { start, end } = dayRange(date);
        const events = await Event.find({ date: { $gte: start, $lt: end } }).sort({ date: 1 }).exec();
        return events || [];
    } catch (err) {
        console.error('getEventByDate error:', err);
        return [];
    }
}

export async function updateEvent(args) {
    try {
        const date = convertDate(args.date);
        const { start, end } = dayRange(date);
        const update = {};
        if (args.name) update.name = args.name;
        if (args.newDate) update.date = convertDate(args.newDate);

        const updated = await Event.findOneAndUpdate(
            { date: { $gte: start, $lt: end } },
            { $set: update },
            { new: true }
        ).exec();

        return updated;
    } catch (err) {
        console.error('updateEvent error:', err);
        throw err;
    }
}

export async function deleteEvent(args) {
    try {
        // If args.beforeToday === true -> delete all before today
        if (args && args.beforeToday) {
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const res = await Event.deleteMany({ date: { $lt: startOfToday } }).exec();
            return { deletedCount: res.deletedCount || 0 };
        }

        // If args.date provided -> delete events on that date
        if (args && args.date) {
            const date = convertDate(args.date);
            const { start, end } = dayRange(date);
            const res = await Event.deleteMany({ date: { $gte: start, $lt: end } }).exec();
            return { deletedCount: res.deletedCount || 0 };
        }

        // no criteria
        return { deletedCount: 0, message: 'no deletion criteria provided' };
    } catch (err) {
        console.error('deleteEvent error:', err);
        throw err;
    }
}
