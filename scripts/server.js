const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Configuração do agente HTTPS
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Ignorar certificados SSL inválidos
});

// URL base da API C#
const BASE_API_URL = 'https://localhost:44347/api/Logar';

// Função utilitária para chamadas à API C#
const callApi = async (endpoint, method, body) => {
    const url = `${BASE_API_URL}/${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        agent: httpsAgent,
    };

    const response = await fetch(url, options);
    const responseText = await response.text();

    try {
        return { status: response.status, data: JSON.parse(responseText) };
    } catch {
        return { status: response.status, data: responseText }; // Caso não seja JSON
    }
};

// Endpoint: Verificar se o usuário existe
app.post('/user', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'O campo "username" é obrigatório.' });
    }

    try {
        const { status, data } = await callApi('user', 'POST', { username });

        if (status === 404) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Os campos "email" e "password" são obrigatórios.' });
    }

    try {
        const { status, data } = await callApi('login', 'POST', { email, password });

        if (status === 401) {
            return res.status(401).json({ message: 'Erro na autenticação.' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Registro de usuário
app.post('/register', async (req, res) => {
    const {
        username,
        password,
        email,
        phone,
        CPF_CNPJ,
        licensePlate,
        modelo,
        birthDate,
        cnh,
        tipo,
    } = req.body;

    if (!username || !password || !email || !tipo) {
        return res.status(400).json({ message: 'Os campos obrigatórios: username, password, email e tipo.' });
    }

    try {
        const { status, data } = await callApi('register', 'POST', {
            username,
            password,
            email,
            phone,
            CPF_CNPJ,
            licensePlate,
            modelo,
            birthDate,
            cnh: tipo === 'Motorista' ? '' : cnh,
            tipo,
        });

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao registrar o usuário.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Atualizar senha
app.put('/updatepassword', async (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(400).json({ message: 'Os campos "username" e "newPassword" são obrigatórios.' });
    }

    try {
        const { status, data } = await callApi('updatePassword', 'PUT', { username, newPassword });

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao atualizar a senha.', error: data });
        }

        res.status(200).json({ message: 'Senha atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Atualizar localização
app.put('/updatelocal', async (req, res) => {
    const { id_Endereco, local_real_time, lat_long } = req.body;

    if (!id_Endereco || !local_real_time || !lat_long) {
        return res.status(400).json({ message: 'Os campos id_Endereco, local_real_time e lat_long são obrigatórios.' });
    }

    try {
        const { status, data } = await callApi('atualizarlocalrealtime', 'PUT', { id_Endereco, local_real_time, lat_long });

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao atualizar localização.', error: data });
        }

        res.status(200).json({ message: 'Localização atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Atualizar status do guincho
app.put('/updatestatus', async (req, res) => {
    const { id_cliente, status, ultimoStatus } = req.body;

    if (!id_cliente || status === undefined || !ultimoStatus) {
        return res.status(400).json({ message: 'Os campos id_cliente, status e ultimoStatus são obrigatórios.' });
    }

    try {
        const { status: responseStatus, data } = await callApi('AtualizaStatusGuincho', 'PUT', { id_cliente, status, ultimoStatus });

        if (responseStatus >= 400) {
            return res.status(responseStatus).json({ message: 'Erro ao atualizar o status.', error: data });
        }

        res.status(200).json({ message: 'Status atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint para obter guinchos ativos
app.get('/guinchosativos', async (req, res) => {
    try {
        // Faz a chamada para a API externa
        const { status, data } = await callApi('GetGuinchosAtivos', 'GET');

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao buscar guinchos ativos.', error: data });
        }

        // Retorna a lista de guinchos ativos para o cliente
        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Registrar pré-solicitação
app.put('/preSolicitacao', async (req, res) => {
    const { 
        id_Motorista, 
        id_Guincho, 
        distancia, 
        preco, 
        latLongCliente, 
        latLongGuincho, 
        status 
    } = req.body;

    // Validação dos campos obrigatórios
    if (!id_Motorista || !id_Guincho || !distancia || !preco || !latLongCliente || !latLongGuincho || !status) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Corpo da solicitação a ser enviada para a API C#
    const requestPayload = {
        id_Motorista,
        id_Guincho,
        distancia,
        preco,
        latLongCliente,
        latLongGuincho,
        status
    };

    try {
        // Chama a API C# para registrar a pré-solicitação
        const { status, data } = await callApi('preSolicitacao', 'PUT', requestPayload);

        // Verifica se a resposta da API C# foi bem-sucedida
        if (status === 200) {
            res.status(200).json({ message: 'Pré-solicitação registrada com sucesso.' });
        } else {
            // Caso a API C# retorne um erro, passa a mensagem para o cliente
            res.status(status).json({ message: 'Erro ao registrar a pré-solicitação.', error: data });
        }
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Inicia o servidor Node.js
app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
