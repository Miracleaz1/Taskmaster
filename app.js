document.addEventListener('DOMContentLoaded', function() {
    (function() {
        'use strict';

        var forms = document.querySelectorAll('form');
        Array.prototype.slice.call(forms)
            .forEach(function(form) {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
    })();

    const apiUrl = 'http://localhost:4000/api';

    // Register a new user
    const registerForm = document.getElementById('register');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!e.target.checkValidity()) return;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${apiUrl}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                if (!response.ok) throw new Error(await response.text());

                alert('Registration successful! Please login.');
                window.location.href = 'login.html'; // Redirect to login page
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    const loginForm = document.getElementById('login');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!e.target.checkValidity()) return;

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${apiUrl}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) throw new Error(await response.text());

                const data = await response.json();
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    // Create a new task
    const createTaskForm = document.getElementById('create-task');
    if (createTaskForm) {
        createTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!e.target.checkValidity()) return;

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const deadline = document.getElementById('deadline').value;
            const priority = document.getElementById('priority').value;

            console.log('Submitting task:', { title, description, deadline, priority });

            try {
                const token = localStorage.getItem('token');
                console.log('Token being used:', token); // Log the token for debugging
                if (!token) throw new Error('Token not found. Please log in.');

                const response = await fetch(`${apiUrl}/tasks`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ title, description, deadline, priority })
                });

                console.log('Response:', response);

                if (!response.ok) throw new Error(await response.text());

                alert('Task created successfully!');
                fetchTasks(); // Update the task list
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // Fetch tasks and display them
    async function fetchTasks() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found. Please log in.');

            const response = await fetch(`${apiUrl}/tasks`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) throw new Error(await response.text());

            const tasks = await response.json();
            displayTasks(tasks);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    // Update task
    window.editTask = function(taskId, title, description, deadline, priority) {
        // Your code to edit the task
        console.log('Edit task:', taskId, title, description, deadline, priority);
        // Add code to handle task editing, e.g., showing a form with the task details
        document.getElementById('title').value = title;
        document.getElementById('description').value = description;
        document.getElementById('deadline').value = deadline;
        document.getElementById('priority').value = priority;
        document.getElementById('taskId').value = taskId; // Hidden input for the task ID
    };

    // Update task function for submitting the edited task
    async function updateTask(taskId, title, description, deadline, priority) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ title, description, deadline, priority })
            });

            if (!response.ok) throw new Error(await response.text());

            alert('Task updated successfully!');
            fetchTasks(); // Refresh the task list
        } catch (error) {
            alert(`Error updating task: ${error.message}`);
        }
    }

    // Delete task
    window.deleteTask = async function(taskId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) throw new Error(await response.text());

            alert('Task deleted successfully!');
            fetchTasks(); // Refresh the task list
        } catch (error) {
            alert(`Error deleting task: ${error.message}`);
        }
    }

    // Display tasks and add search functionality
    function displayTasks(tasks) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task';
            taskItem.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
                <p>Priority: ${task.priority}</p>
                <button onclick="editTask('${task._id}', '${task.title}', '${task.description}', '${task.deadline}', '${task.priority}')">Edit</button>
                <button onclick="deleteTask('${task._id}')">Delete</button>
            `;
            taskList.appendChild(taskItem);
        });
    }

    // Filter tasks based on search input
    window.filterTasks = function() {
        const searchInput = document.getElementById('search').value.toLowerCase();
        const taskItems = document.querySelectorAll('#task-list .task');

        taskItems.forEach(taskItem => {
            const title = taskItem.querySelector('h3').textContent.toLowerCase();
            const description = taskItem.querySelector('p').textContent.toLowerCase();

            if (title.includes(searchInput) || description.includes(searchInput)) {
                taskItem.style.display = '';
            } else {
                taskItem.style.display = 'none';
            }
        });
    };

    // Initially fetch and display tasks if on the dashboard
    if (window.location.pathname.endsWith('dashboard.html') && localStorage.getItem('token')) {
        fetchTasks();
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
