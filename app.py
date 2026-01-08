from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Sample data for the interactive features
quotes = [
    {"quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
    {"quote": "Innovation distinguishes between a leader and a follower.", "author": "Steve Jobs"},
    {"quote": "Stay hungry, stay foolish.", "author": "Steve Jobs"},
    {"quote": "Life is what happens when you're busy making other plans.", "author": "John Lennon"},
    {"quote": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
    {"quote": "It is during our darkest moments that we must focus to see the light.", "author": "Aristotle"},
    {"quote": "The only impossible journey is the one you never begin.", "author": "Tony Robbins"},
    {"quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
]

tasks = []

@app.route('/')
def index():
    """Render the main interactive page"""
    return render_template('index.html')

@app.route('/api/quote', methods=['GET'])
def get_quote():
    """Return a random inspirational quote"""
    quote = random.choice(quotes)
    return jsonify(quote)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    data = request.get_json()
    if data and 'task' in data:
        task = {
            'id': len(tasks) + 1,
            'task': data['task'],
            'completed': False
        }
        tasks.append(task)
        return jsonify(task), 201
    return jsonify({'error': 'Task is required'}), 400

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({'message': 'Task deleted'}), 200

@app.route('/api/tasks/<int:task_id>/toggle', methods=['PUT'])
def toggle_task(task_id):
    """Toggle task completion status"""
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = not task['completed']
            return jsonify(task), 200
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/calculate', methods=['POST'])
def calculate():
    """Simple calculator endpoint"""
    data = request.get_json()
    try:
        num1 = float(data.get('num1', 0))
        num2 = float(data.get('num2', 0))
        operation = data.get('operation', '+')
        
        if operation == '+':
            result = num1 + num2
        elif operation == '-':
            result = num1 - num2
        elif operation == '*':
            result = num1 * num2
        elif operation == '/':
            if num2 == 0:
                return jsonify({'error': 'Cannot divide by zero'}), 400
            result = num1 / num2
        else:
            return jsonify({'error': 'Invalid operation'}), 400
            
        return jsonify({'result': result})
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid numbers'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
