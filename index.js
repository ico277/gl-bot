const discord = require("discord.js");
const client = new discord.Client();
const fs = require("fs");
const config = require("./.config.json");
const commands = require("./commands.js");


function getPrefix(guild) {
	let path = `./configs/${guild}.json`;
	if (fs.existsSync(path)) { 
		let prefix = JSON.parse(fs.readFileSync(path, {encoding: "UTF-8"}))["prefix"];
		if (prefix) {
			return prefix;
		} else {
			return config.prefix;
		}
	} else {
		return config.prefix;
	}
}

client.on("ready", () => {
	console.log(`Bot started as ${client.user.tag}`);
});

client.on("message", (msg) => {
	let content = msg.content;
	let prefix = getPrefix(msg.guild.id);
	if (content.startsWith(prefix)) {
		content = content.substr(prefix.length);
		let args = content.split(" ");
		let cmd = args.shift();
		let cmd_func = commands[cmd];
		if (cmd_func) {
			try {
				cmd_func(client, msg, args);
			}
			catch (err) {
				console.error("error while executing command:");
				console.error(err);
				msg.reply(`An unexpected error occured!\n=> ${err}`);
			}
		}
                else {
                        msg.reply(`Command '${cmd}' not found!`)
                        .then((message) => {
                                setTimeout(() => {
                                        message.delete();
                                }, 5000);
                        });
                }

	}
});

client.on("message", (msg) => {
	let content = msg.content;
        if (content.startsWith(`<@!${client.user.id}>`) || content.startsWith(`<@${client.user.id}>`)) {
		let args = content.split(" ");
		args.shift();
		let cmd = args.shift();
		let cmd_func = commands[cmd];
		if (cmd_func) {
			try {
                                cmd_func(client, msg, args);
                        }
                        catch (err) {
                                console.error("error while executing command:");
                                console.error(err);
                                msg.reply(`An unexpected error occured!\n=> ${err}`);
                        }
                }
	}
});

client.login(config.token);
