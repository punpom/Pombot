import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TMDB_TOKEN = process.env.TMDB_TOKEN;
const prefix = "$";

client.on("ready", () => {
  console.log("Logged in.");
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.content.startsWith(prefix + "s")) {
    const args = message.content
      .slice(prefix.length)
      .trim()
      .replace(/\([^)]*\)/g, "")
      .split(/ +/);

    console.log(args);
    const search = args.slice(1).join(" ");
    fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_TOKEN}&query=${search}&language=fr-FR`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results);
        const match = message.content.match(/\(([^)]+)\)/);
        if (match && data.results.length > 1) {
          const content = match[1];
          for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].first_air_date.split("-")[0] === content) {
              const name = data.results[i]?.name;
              const id = data.results[i]?.id;
              const overview = data.results[i]?.overview;
              const date = data.results[i]?.first_air_date;
              const image = data.results[i]?.poster_path;
              const average = data.results[i]?.vote_average
                .toFixed(1)
                .toString();
              const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(name)
                .setURL(`https://www.themoviedb.org/tv/${id}`)
                .addFields({ name: "Résumé:", value: overview })
                .addFields({ name: "Sortie:", value: date })
                .addFields({ name: "Moyenne:", value: "⭐ " + average })
                .setImage(`https://image.tmdb.org/t/p/original/${image}`);
              message.channel.send({ embeds: [embed] });
            }
          }
        } else {
          const name = data.results[0]?.name;
          const id = data.results[0]?.id;
          const overview = data.results[0]?.overview;
          const date = data.results[0]?.first_air_date;
          const image = data.results[0]?.poster_path;
          if (name == undefined) {
            message.channel.send("Cette série n'existe pas");
          } else {
            const embed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(name)
              .setURL(`https://www.themoviedb.org/tv/${id}`)
              .addFields({ name: "Résumé:", value: overview })
              .addFields({ name: "Sortie:", value: date })
              .addFields({ name: "Moyenne:", value: "⭐ " + average })
              .setImage(`https://image.tmdb.org/t/p/original/${image}`);
            message.channel.send({ embeds: [embed] });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});

client.login(DISCORD_TOKEN);
