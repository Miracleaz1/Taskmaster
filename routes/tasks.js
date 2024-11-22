const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Create a task
router.post('/', auth, async (req, res) => {
    const { title, description, deadline, priority } = req.body;

    if (!title) return res.status(400).send({ errors: { title: { kind: 'required' } } });

    const task = new Task({ title, description, deadline, priority, user: req.user._id });

    try {
        await task.save();
        res.send(task);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send('Server error');
    }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
    const { title, description, deadline, priority } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, deadline, priority },
            { new: true, runValidators: true }
        );

        if (!task) return res.status(404).send('Task not found');
        res.send(task);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Server error');
    }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).send('Task not found');
        res.send('Task deleted');
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Server error');
    }
});

// Get tasks with optional filters
router.get('/', auth, async (req, res) => {
    const { priority, dueDate, search } = req.query;
    let filter = { user: req.user._id };

    if (priority) filter.priority = priority;
    if (dueDate) filter.deadline = { $lte: new Date(dueDate) };
    if (search) filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
    ];

    try {
        const tasks = await Task.find(filter);
        res.send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
