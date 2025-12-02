import "dotenv/config";
import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";

const commands = [];
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = (await import(`../commands/${file}`)).default;
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log("Refreshing application commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("Commands refreshed.");
  } catch (err) { console.error(err); }
})();
