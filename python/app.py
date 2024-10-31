from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Aqui você pode implementar a lógica de verificação do login
    if username == "admin" and password == "senha123":
        return jsonify({"message": "Login bem-sucedido!"}), 200
    else:
        return jsonify({"message": "Usuário ou senha incorretos."}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Lógica de registro do usuário
    # Certifique-se de que o nome de usuário não exista
    if username == "admin":
        return jsonify({"message": "Username already exists."}), 400
    
    return jsonify({"message": "Usuário registrado com sucesso!"}), 201

if __name__ == '__main__':
    app.run()  # Removido ssl_context
