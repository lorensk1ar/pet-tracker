from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)
db = 'pets.db'


# INDEX
@app.route('/')
def hello():
    return 'Hello, Pet Lover!'


# CREATE
@app.route('/api/pets', methods=['POST'])
def create_pet():
    try:
        data = request.json
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO pets (name, picture, species, friendly) VALUES (?, ?, ?, ?)", 
                       (data['name'], data['picture'], data['species'], data['friendly']))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Hello, ' + data.name + '!', 'data': data}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# READ ALL
@app.route('/api/pets', methods=['GET'])
def get_all_pets():
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM pets')
        result = [{'id': row[0], 'name': row[1], 'picture': row[2], 'species': row[3], 'friendly': row[4]} for row in cursor.fetchall()]
        conn.close()
        return jsonify(result), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# DELETE
@app.route('/api/pets/<int:id>', methods=['DELETE'])
def remove_pet(id):
    sid = str(id)
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM pets WHERE id = ?', (sid))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Bye bye, #' + sid}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)

