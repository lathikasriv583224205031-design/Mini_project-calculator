from flask import Flask, render_template

# Initialize Flask Application
app = Flask(__name__)
application = app

@app.route('/')
def index():
    """
    Render the main scientific calculator web interface.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Run the application locally on http://127.0.0.1:5000
    print("Starting Scientific Calculator Web App...")
    print("Open http://127.0.0.1:5000 in your web browser.")
    app.run(debug=True, host='127.0.0.1', port=5000)
