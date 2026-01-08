/**
 * Interactive Python Flask Web Application
 * JavaScript functionality for all interactive features
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive features
    initQuoteGenerator();
    initCalculator();
    initTaskManager();
    initSmoothScroll();
    initFeatureCards();
});

/* ========================================
   Quote Generator
   ======================================== */
function initQuoteGenerator() {
    const quoteBtn = document.getElementById('get-quote-btn');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');

    quoteBtn.addEventListener('click', async () => {
        quoteBtn.disabled = true;
        quoteBtn.innerHTML = '<span class="btn-icon">⏳</span> Loading...';

        try {
            const response = await fetch('/api/quote');
            const data = await response.json();

            // Animate the quote change
            quoteText.style.opacity = '0';
            quoteAuthor.style.opacity = '0';

            setTimeout(() => {
                quoteText.textContent = data.quote;
                quoteAuthor.textContent = `— ${data.author}`;
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
            }, 300);

        } catch (error) {
            console.error('Error fetching quote:', error);
            quoteText.textContent = 'Failed to fetch quote. Please try again!';
            quoteAuthor.textContent = '';
        }

        quoteBtn.disabled = false;
        quoteBtn.innerHTML = '<span class="btn-icon">✨</span> Get New Quote';
    });
}

/* ========================================
   Calculator
   ======================================== */
function initCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const operationSelect = document.getElementById('operation');
    const resultDiv = document.getElementById('calc-result');

    calculateBtn.addEventListener('click', async () => {
        const num1 = num1Input.value;
        const num2 = num2Input.value;
        const operation = operationSelect.value;

        if (!num1 || !num2) {
            resultDiv.textContent = 'Please enter both numbers';
            resultDiv.style.color = '#f59e0b';
            return;
        }

        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ num1, num2, operation }),
            });

            const data = await response.json();

            if (data.error) {
                resultDiv.textContent = data.error;
                resultDiv.style.color = '#ef4444';
            } else {
                // Format the result nicely
                const formattedResult = Number.isInteger(data.result)
                    ? data.result
                    : data.result.toFixed(4);
                resultDiv.textContent = `Result: ${formattedResult}`;
                resultDiv.style.color = '#4facfe';

                // Add a little animation
                resultDiv.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    resultDiv.style.transform = 'scale(1)';
                }, 200);
            }

        } catch (error) {
            console.error('Error calculating:', error);
            resultDiv.textContent = 'Calculation failed. Please try again!';
            resultDiv.style.color = '#ef4444';
        }

        calculateBtn.disabled = false;
        calculateBtn.textContent = 'Calculate';
    });

    // Allow Enter key to trigger calculation
    [num1Input, num2Input].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculateBtn.click();
            }
        });
    });
}

/* ========================================
   Task Manager
   ======================================== */
function initTaskManager() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');

    // Load existing tasks
    loadTasks();

    // Add task on button click
    addTaskBtn.addEventListener('click', addTask);

    // Add task on Enter key
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    async function addTask() {
        const taskText = taskInput.value.trim();

        if (!taskText) {
            taskInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                taskInput.style.borderColor = '';
            }, 1000);
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: taskText }),
            });

            const task = await response.json();
            addTaskToDOM(task);
            taskInput.value = '';
            updateEmptyState();

        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();

            tasks.forEach(task => addTaskToDOM(task));
            updateEmptyState();

        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.task)}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">×</button>
        `;

        taskList.appendChild(li);
    }

    function updateEmptyState() {
        const hasItems = taskList.children.length > 0;
        emptyState.classList.toggle('hidden', hasItems);
    }

    // Expose functions globally for onclick handlers
    window.toggleTask = async (taskId) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PUT',
            });

            const task = await response.json();
            const li = document.querySelector(`.task-item[data-id="${taskId}"]`);
            const checkbox = li.querySelector('.task-checkbox');
            const text = li.querySelector('.task-text');

            checkbox.classList.toggle('completed', task.completed);
            text.classList.toggle('completed', task.completed);

        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    window.deleteTask = async (taskId) => {
        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            const li = document.querySelector(`.task-item[data-id="${taskId}"]`);
            li.style.animation = 'slideOut 0.3s ease forwards';

            setTimeout(() => {
                li.remove();
                updateEmptyState();
            }, 300);

        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ========================================
   Feature Cards Animation
   ======================================== */
function initFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const feature = card.dataset.feature;
            let target;

            switch (feature) {
                case 'quotes':
                    target = '#quote';
                    break;
                case 'calculator':
                    target = '#calculator';
                    break;
                case 'todo':
                case 'api':
                    target = '#todo';
                    break;
            }

            if (target) {
                document.querySelector(target).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
hii
// Add slide out animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }


    
`;
document.head.appendChild(style);
