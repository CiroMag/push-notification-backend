const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Inicialização do Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_CREDENTIALS)),
});

// Rota para envio de notificações
app.post("/send", async (req, res) => {
  const { titulo, texto, tokens } = req.body;

  if (!titulo || !texto || !tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ error: "Dados inválidos. Requer titulo, texto e tokens." });
  }

  // Payload único com notification + data (notificação exibida automaticamente no iOS, e no Android suprimida via SW)
  const message = {
    notification: {
      title: titulo,
      body: texto,
      // imageUrl: "https://app.healthup.com.br/logo-sem-fundo-app-2"
    },
    data: {
      title: titulo,
      body: texto,
      image: "https://app.healthup.com.br/logo-sem-fundo-app-2.png",
      link: "https://app.healthup.com.br/"
    },
    tokens: tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("📤 Firebase response:", JSON.stringify(response, null, 2));
    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("❌ Erro ao enviar notificação:", err);
    res.status(500).json({ error: err.message });
  }
});

// Verificação e escuta da porta
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT não definida. Render requer que PORT seja definida automaticamente.");
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
