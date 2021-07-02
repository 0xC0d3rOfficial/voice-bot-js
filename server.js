// Подгрузка модулей
const { error } = require("console");
const Discord = require("discord.js");
const fs = require("fs");
global.mongoose = require("mongoose");
const bot = new Discord.Client(); // Создаем нового клиента Discord
// Подгружаем конфиг настроек
let config = require("./config.json"),
    token = config.bot.token;
global.prefix = config.bot.prefix;
// Окончание подгрузки
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
global.voice = require("./schemas/voicestats"); // подключение схем для монго
mongoose.connect("mongodb+srv://bot:botforzakaz@cluster0.tys5p.mongodb.net/ds?retryWrites=true&w=majority", { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true }); // создаем новое подключение к базе данных
mongoose.connection.on("connected", () => {
    console.log(`[DB] Connected!`);
});
fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err)
    let jsfiles = files.filter(file => file.endsWith(".js"))
    for(let file of jsfiles){
        let pull = require(`./commands/${file}`);
        if(pull.name){
            bot.commands.set(pull.name, pull);
        } else {
            continue;
        }
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => bot.aliases.set(alias, pull.name));
    }

});
// Создаем новый эвент при запуске бота
bot.on("ready", async => {
    console.log(`Bot ${bot.user.username}, started!`);
    bot.generateInvite("ADMINISTRATOR").then(ln => {
        console.log(ln);
    });
    
});
// Оконачние эвента
//Анологично первому эвенту только здесь с сообщением
bot.on("message", async (message) => {
    if(message.author.bot) return;
    if(message.channel.type == 'dm') return;
    if(!message.content.startsWith(prefix)) {
        
        let db = await voice.findOne({ userID: message.author.id, guildID: message.guild.id });
        if(!db){
            await voice.create({ userID: message.author.id, guildID:message.guild.id });
        } else {

        };

        }else {
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            let command = bot.commands.get(cmd);
            if (!command) command = bot.commands.get(bot.aliases.get(cmd));
            if (command){
                let command1 = bot.commands.get(cmd);
                if (!command1) command1 = bot.commands.get(bot.aliases.get(cmd));
            }
            if (command) {
                command.run(bot, message, args);
            }
    }

})
//окончание эвента
let voiceStates = {}

bot.on('voiceStateUpdate', async (oldState, newState) => {
      let { id } = oldState 
  if (!oldState.channel) {
    voiceStates[id] = new Date()
  } else if (!newState.channel) {
    let now = new Date()
    let joined = voiceStates[id] || new Date()
    let dateDiff = now.getTime() - joined.getTime()
    if (dateDiff > 6 * 1000) {
        let db = await voice.findOne({ guildID: oldState.guild.id, userID: id });
        if(!db){
            let a =bot.guilds.cache.get(oldState.guild.id).members.cache.get(id);
            a.send(`Вас не было в базе данных, перезайдите`);
            await voice.create({ userID: id, guildID: oldState.guild.id });
        };
        db.voiceStats += dateDiff;
        db.save().catch(err => console.error(err));
    }

  }
})

bot.login(token) // Логиним бота