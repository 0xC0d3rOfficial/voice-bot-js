const Discord = require("discord.js")

module.exports = {
    name: "voice",
    aliases: ["voice"],
    run: async(bot, message, args) => {
    let db = await voice.findOne({guildID: message.guild.id, userID: message.author.id});
    if(!db) await voice.create({ guildID: message.guild.id, userID:message.author.id });
    switch(args[0]){
        case 'online':
            let embeds = new Discord.MessageEmbed()
                .setTitle(`Статистика войса`)
                .setDescription(`${message.author}, Вы пробыли в войсе ${Math.floor((db.voiceStats)/60000)} минут(-ы)`)
                .setColor(`2f3136`);
            message.channel.send(embeds);
        break;
        case 'top':
                voice.find({guildID: message.guild.id}).sort([
                    ['voiceStats']
                ]).exec(async(err, res) => {
                if(err) throw err;
                if(res.length === 0){
                    let embedad = new Discord.MessageEmbed()
                    .setTitle(`Ошибка`)
                    .setColor('RED')
                    .setDescription(`${message.author}, Вы еще не заходили в войс`)
                  await message.channel.send(embedad);
                  return;
                }
                if(res.length < 10){
                    let embedds = new Discord.MessageEmbed()
                    .setTitle(`Ошибка`)
                    .setColor('RED')
                    .setDescription(`${message.author}, На сервере отсутствует статистика войса`)
                  await message.channel.send(embedds);
                  return;
                }
                var embeda = new Discord.MessageEmbed()
                embeda.setTitle(`Лидеры войса`)
                embeda.setColor("DARK_GREEN")
                for(i = 0; i < 10; i++){
                    let user = bot.guilds.cache.get(message.guild.id).members.cache.get(res[i].userID);
                    if(user){
                        embeda.addField(`${i + 1}. ${user.user.tag}`, `${Math.floor((res[i].voiceStats)/60000)} минут`, true)
                    }
                }
                await message.channel.send(embeda);
                })
        break;
        default:
            let embed = new Discord.MessageEmbed()  
                .setTitle(`Ошибка`)
                .setDescription(`**${message.author}, вы не указали аргумент\n\n${prefix}voice online - показывает сколько вы просидели в голосом канале\n${prefix}voice top - показывает топ 10 пользователей**`)
                .setColor(`RED`)
            message.channel.send(embed)
    }
}
}
