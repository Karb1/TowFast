const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3003;

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

    // Log do JSON recebido na requisição
    console.log('JSON recebido:', JSON.stringify(req.body, null, 2));

    if (!username || !password || !email || !tipo) {
        return res.status(400).json({ message: 'Os campos obrigatórios: username, password, email e tipo.' });
    }

    try {
        const requestBody = {
            username: username,
            password: password,
            email: email,
            phone: phone,
            CPF_CNPJ: CPF_CNPJ,
            licensePlate: licensePlate,
            modelo: modelo,
            birthDate: birthDate,
            cnh: tipo === 'Motorista' ? '' : cnh,
            tipo: tipo,
        };

        // Log do JSON que será enviado para a API externa
        console.log('JSON enviado para API:', JSON.stringify(requestBody, null, 2));

        const { status, data } = await callApi('register', 'POST', requestBody);

        if (status >= 400) {
            console.error('Erro ao registrar o usuário:', data);
            console.error('JSON da requisição:', JSON.stringify(req.body, null, 2));
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

// Endpoint: Obter dados da solicitação para o popup
app.get('/popupsolicitacao', async (req, res) => {
    const { id_guincho } = req.query;

    if (!id_guincho) {
        return res.status(400).json({ message: 'O ID do guincho é obrigatório.' });
    }

    try {
        const { status, data } = await callApi(`GetPopUpSolicitacao?id_guincho=${id_guincho}`, 'GET');

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao buscar dados da solicitação.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Registrar pré-solicitação
app.post('/preSolicitacao', async (req, res) => {
    const { 
        id_Motorista, 
        id_Guincho, 
        distancia, 
        preco, 
        latLongCliente, 
        latLongGuincho, 
        status,
        destino
    } = req.body;

    // Validação dos campos obrigatórios
    if (!id_Motorista || !id_Guincho || !distancia || !preco || !latLongCliente || !latLongGuincho || !status) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Corpo da solicitação a ser enviada para a API C#
    const requestBody = {
        id_Motorista: id_Motorista,
        id_Guincho: id_Guincho,
        distancia: distancia,
        preco: preco,
        latLongCliente: latLongCliente,
        latLongGuincho: latLongGuincho,
        status: status,
        destino: destino,
    };

    // Log do JSON que será enviado para a API externa
    console.log('JSON enviado para API:', JSON.stringify(requestBody, null, 2));
    try {
        // Chama a API C# para registrar a pré-solicitação
        const { status, data } = await callApi('preSolicitacao', 'POST', requestBody);

        // Verifica se a resposta da API C# foi bem-sucedida
        if (status === 200) {
            res.status(200).json(data);
        } else {
            // Caso a API C# retorne um erro, passa a mensagem para o cliente
            res.status(status).json({ message: 'Erro ao registrar a pré-solicitação.', error: data });
        }
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Atualizar status da pré-solicitação
app.put('/updatePreSolicitacao', async (req, res) => {
    const { id_Solicitacao, status } = req.body;

    if (!id_Solicitacao || status === undefined) {
        return res.status(400).json({ message: 'Os campos id_Solicitacao e status são obrigatórios.' });
    }

    try {
        const { status: responseStatus, data } = await callApi('AtualizaStatusPreSolicitacao', 'PUT', { id_Solicitacao, status });

        if (responseStatus >= 400) {
            return res.status(responseStatus).json({ message: 'Erro ao atualizar o status da pré-solicitação.', error: data });
        }

        res.status(200).json({ message: 'Status da pré-solicitação atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Buscar pré-solicitação por ID
app.post('/solicitacao', async (req, res) => {
    const { id_Solicitacao } = req.body;

    if (!id_Solicitacao) {
        return res.status(400).json({ message: 'O ID da solicitação é obrigatório.' });
    }

    try {
        const { status, data } = await callApi('GetSolicitacaoById', 'POST', { id_Solicitacao });

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao buscar a solicitação.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

app.get('/GuinchopreSolicitacao', async (req, res) => {
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

app.get('/corrida', async (req, res) => {
    const { idSolicitacao } = req.query;

    if (!idSolicitacao) {
        return res.status(400).json({ message: 'O ID da solicitação é obrigatório.' });
    }

    try {
        const { status, data } = await callApi(`corrida?idSolicitacao=${idSolicitacao}`, 'GET');

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro ao buscar dados da solicitação.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

app.put('/AtualizaCorrida', async (req, res) => {
    const { id_Solicitacao, status } = req.body;

    if (!id_Solicitacao || status === undefined) {
        return res.status(400).json({ message: 'Os campos id_Solicitacao e status são obrigatórios.' });
    }

    try {
        const { status: responseStatus, data } = await callApi('AtualizaCorrida', 'PUT', { id_Solicitacao, status });

        if (responseStatus >= 400) {
            return res.status(responseStatus).json({ message: 'Erro ao atualizar o status da pré-solicitação.', error: data });
        }

        res.status(200).json({ message: 'Status da pré-solicitação atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint: Buscar corridas finalizadas por idGuincho ou idMotorista
app.post('/corridasfinalizadas', async (req, res) => {
    const { idGuincho, idMotorista } = req.body;

    if (!idGuincho && !idMotorista) {
        return res.status(400).json({ message: 'Informe idGuincho ou idMotorista' });
    }

    try {
        const { status, data } = await callApi('Finalizadas', 'POST', { idGuincho, idMotorista });

        if (status >= 400) {
            return res.status(status).json({ message: 'Erro na API.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});

// Endpoint para obter info do usuário por idCliente
app.get('/userinfo/:idCliente', async (req, res) => {
    const { idCliente } = req.params;

    if (!idCliente) {
        return res.status(400).json({ message: 'O parâmetro idCliente é obrigatório.' });
    }

    try {
        // Chama o endpoint GET da API C# que você passou
        // Note que o endpoint espera GET com o idCliente na URL: user/{idCliente}
        const url = `user/${idCliente}`;

        // Faz a chamada manual, pois callApi está preparado para JSON no body,
        // e aqui é GET sem body, então faremos fetch direto:
        const fullUrl = `${BASE_API_URL}/${url}`;
        const response = await fetch(fullUrl, { method: 'GET', agent: httpsAgent });
        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }

        if (response.status === 404) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        if (response.status >= 400) {
            return res.status(response.status).json({ message: 'Erro na API.', error: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor.', error: error.message });
    }
});


// Inicia o servidor Node.js
app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
