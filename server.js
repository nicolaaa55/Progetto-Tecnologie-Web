require("dotenv").config();
const express = require("express");
const { User, Match } = require("./models");
const sequelize = require("./models/database");

const matchRoutes = require("./routes/matchRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const cors = require("cors");
const port = Number(process.env.PORT) || 3000;
app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:4200" }),
);
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/auth", authRoutes);

async function startServer() {
  try {
    await sequelize.sync({ force: false });

    const queryInterface = sequelize.getQueryInterface();
    const matchColumns = await queryInterface.describeTable("matches");
    const missingColumns = {
      userId: { type: "INTEGER", allowNull: true },
      guestId: { type: "VARCHAR(255)", allowNull: true },
      selectionMode: { type: "VARCHAR(255)", allowNull: true },
    };

    for (const [columnName, columnDefinition] of Object.entries(missingColumns)) {
      if (!matchColumns[columnName]) {
        await queryInterface.addColumn("matches", columnName, columnDefinition);
      }
    }

    const server = app.listen(port, () => {
      console.log(`Server avviato su http://localhost:${port}`);
    });

    server.on("error", (error) => {
      console.error("Errore avvio server:", error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Errore DB:", error);
    process.exitCode = 1;
  }
}

startServer();
