import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Client, GatewayIntentBits, Collection } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.data.name, command);
}

client.once("ready", () => console.log(`Logged in as ${client.user.tag}`));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      try { await interaction.editReply({ content: "❌ Error executing command." }); } catch {}
    } else {
      try { await interaction.reply({ content: "❌ Error executing command.", ephemeral: true }); } catch {}
    }
  }
});

client.login(process.env.TOKEN);
