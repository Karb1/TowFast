const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Ignorar certificado inválido
});

// Endpoint para verificar se o usuário existe
app.post('/user', async (req, res) => {
    const { username } = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            agent: httpsAgent, // Configura o agente HTTPS
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Usuário não encontrado' });
        }

        const data = await response.json();
        res.status(200).json(data); // Envia a resposta para o React Native
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});

// Endpoint para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            agent: httpsAgent, // Configura o agente HTTPS
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Erro na autenticação' });
        }

        const data = await response.json();

        // Verifica se o campo tipo está presente e o adiciona à resposta
        const responseData = {
            id: data.id,
            id_endereco: data.id_Endereco,
            id_veiculo: data.id_Veiculo,
            email: data.email,
            message: data.message,
            tipo: data.tipo // Adiciona o campo tipo aqui
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});

// Endpoint para registro
app.post('/register', async (req, res) => {
    const {
        username = '', // Define como vazio se não estiver preenchido
        password = '',
        email = '',
        phone = '',
        cpfCnpj = '',
        licensePlate = '',
        modelVehicle = '',
        birthDate = '',
        cnh = '', // Define como vazio se não estiver preenchido
        tipo = ''
    } = req.body;

    try {
        // Define os dados que serão enviados para a API
        const bodyData = {
            username,
            password,
            email,
            phone,
            cpF_CNPJ: cpfCnpj, // Mapeando cpfCnpj para cpF_CNPJ
            licensePlate,
            modelVehicle,
            birthDate,
            cnh: tipo === 'Motorista' ? '' : cnh, // cnh será vazio se tipo for "Motorista"
            tipo
        };

        const response = await fetch('https://localhost:44347/api/Logar/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
            agent: httpsAgent, // Configura o agente HTTPS
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao registrar o usuário:', errorData);
            return res.status(response.status).json({ message: 'Erro ao registrar o usuário', error: errorData });
        }

        const data = await response.json();
        res.status(201).json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});

// Endpoint para atualizar senha
app.put('/updatepassword', async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/updatePassword', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, newPassword }),
            agent: httpsAgent, // Configura o agente HTTPS
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            return res.status(response.status).json({ message: 'Erro ao atualizar a senha', errorMessage});
        }

        const responseText = await response.text();
        res.status(200).json({ message: responseText });

    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});


app.put('/updatelocal', async (req, res) => {
    const {id_Endereco, local_real_time, lat_long} = req.body;

    try{
        const response = await fetch('https://localhost:44347/api/Logar/atualizarlocalrealtime', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_Endereco, local_real_time, lat_long}),
            agent: httpsAgent, // Configura o agente HTTPS
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Erro para atualizar status'});
        }

        const responseText = await response.text();
        res.status(200).json({ message: responseText });       
    } catch (error){
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message})
    }

}
)
app.put('/updatestatus', async (req, res) => {
    const {id_cliente, status, ultimoStatus} = req.body;

    try {
        const response = await fetch('https://localhost:44347/api/Logar/AtualizaStatusGuincho', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cliente, status, ultimoStatus }),
            agent: httpsAgent, // Configura o agente HTTPS
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            return res.status(response.status).json({ message: 'Erro ao atualizar a senha', errorMessage});
        }

        const responseText = await response.text();
        res.status(200).json({ message: responseText });

    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        res.status(500).json({ message: 'Erro ao conectar com o servidor', error: error.message });
    }
});


// Inicia o servidor Node.js
app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
