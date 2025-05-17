const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_CREDENTIALS)),
});

app.post("/send", async (req, res) => {
  const { titulo, texto, tokens } = req.body;

  if (!titulo || !texto || !tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ error: "Dados inválidos. Requer titulo, texto e tokens." });
  }

  const message = {
    notification: {
      title: titulo,
      body: texto,
    },
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});