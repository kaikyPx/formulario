const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const { dados, pdfBase64, nomeArquivo } = JSON.parse(event.body);
        const nomePaciente = dados.nome || 'Paciente';

        // Preparar o conteúdo do email (texto simples)
        let emailContent = `Novo Prontuário Digital: ${nomePaciente}\n\n`;
        emailContent += `Data: ${new Date().toLocaleString('pt-BR')}\n\n`;
        emailContent += `Acesse os detalhes no PDF em anexo.\n\n`;
        emailContent += `E-mail do paciente: ${dados.email || 'Não informado'}\n`;
        emailContent += `Celular: ${dados.celular || 'Não informado'}\n`;

        const { data, error } = await resend.emails.send({
            from: 'UAO Digital <onboarding@resend.dev>', // Ou seu domínio verificado
            to: 'uaodocumentos@gmail.com',
            subject: `Novo Prontuário - ${nomePaciente}`,
            text: emailContent,
            attachments: [
                {
                    filename: nomeArquivo,
                    content: pdfBase64,
                }
            ]
        });

        if (error) {
            console.error('Erro Resend:', error);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, data })
        };
    } catch (err) {
        console.error('Erro Função:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};
