const express = require('express');
const fetch = require('node-fetch'); // Isso funcionará agora com a versão 2.x
const cors = require('cors');

const app = express();
const PORT = 3000; // Escolha a porta desejada

app.use(express.json());
app.use(cors()); // Habilita o CORS para que o React Native possa fazer requisições

// Desabilita a verificação de certificado autoassinado
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Desabilita a verificação de certificado

// Endpoint para login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Erro na autenticação' });
        }

        const data = await response.json();
        res.status(200).json(data); // Envia a resposta para o React Native
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});

// Endpoint para registro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await fetch('http://192.168.15.13:44347/api/Logar/register', { // ajuste o IP e porta aqui
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json(); // Obtem dados do erro para log
            console.error('Erro ao registrar o usuário:', errorData);
            return res.status(response.status).json({ message: 'Erro ao registrar o usuário', error: errorData });
        }

        const data = await response.json();
        res.status(201).json(data); // Envia a resposta para o React Native
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});


// Endpoint para atualizar senha
app.post('/update-password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, oldPassword, newPassword })
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Erro ao atualizar a senha' });
        }

        const data = await response.json();
        res.status(200).json(data); // Envia a resposta para o React Native
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});

// Inicia o servidor Node.js
app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
