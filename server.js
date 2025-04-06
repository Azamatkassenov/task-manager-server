const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'tasks.json');

let tasks = [];
if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE);
    try {
        tasks = JSON.parse(fileData);
    } catch (err) {
        console.error('Ошибка при чтении tasks.json:', err);
    }
}

const saveTasks = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/tasks', (req, res) => {
    const task = req.body;
    const maxId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0;
    task.id = maxId + 1;
    task.creationTime = new Date().toISOString();
    task.completionTime = null;
    task.status = task.status || 'pending';
    task.comments = task.comments || [];
    tasks.push(task);
    saveTasks();
    res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedFields = req.body;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    Object.assign(task, updatedFields);
    saveTasks();
    res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});
