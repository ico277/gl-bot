const fs = require("fs");
const discord = require("discord.js");


module.exports = {
	"test": (client, msg, args) => {
		msg.channel.send("test!");
		msg.channel.send("args: " + args.join(", "));
	},
	//"error": (client, msg, args) => {
	//	throw new Error("Totally a real error");
	//}
	"setup": (client, msg, args) => {
		let server_config = `./configs/${msg.guild.id}.json`;
		if (!fs.existsSync(server_config) || args.includes("--reset")) {
			let embed = new discord.MessageEmbed()
				.setTitle("Setup command")
				.setDescription("This server is not set up yet, do you want to set it up now? [Y/n]")
				.setColor(0x69B4FA);
			msg.channel.send(embed);

			let config = {};
			let phase = 0;
			let collector = new discord.MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, {idle: 30000});
			collector.on("collect", (message) => {
				let content = message.content;
				if (phase == 0) {
					content = content.toLowerCase();
					if (content == "y" || content == "yes") {
						message.react("☑️");
						message.channel.send("What server prefix do you want? (type 'none' for none)");
						phase = 1;
					}
					else {
						msg.channel.send("Aborted.");
						collector.stop("aborted");
					}
				}
				else if (phase == 1) {
					if (content.toLowerCase() != "none") {
						message.react("☑️");
						config["prefix"] = content;
						message.channel.send(`Using '${config["prefix"]}' now as prefix.`);
						message.channel.send("What is the mute role? (type 'none' for none)");
						phase = 2;
					}
					else {
						message.channel.send("Using the standard prefix.");
						message.channel.send("What is the mute role? (type 'none' for none)");
						phase = 2;
					}
				}
				else if (phase == 2) {
					if (content.toLowerCase() != "none") {
						let role = message.mentions.roles.first() || message.guild.roles.cache.get(content);
						if (role != undefined) {
							message.react("☑️");
							config["mute_role"] = role.id;
							message.channel.send(`Using <@&${config["mute_role"]}> (${config["mute_role"]}) as the muted role.`);
							collector.stop("success");
						} else {
							message.react("❌");
							message.channel.send("Could not find that role... Please try again.");
						}
					}
					else {
						message.channel.send("Using no muted role.");
						collector.stop("success");
					}
				}
				else {
					collector.stop("success");
				}
			});
			collector.on("end", (msgs, reason) => {
				if (reason == "idle" || reason == "time") {
					collector.channel.send("You took too long to respond. Aborted.");
				}
				else if (reason == "success") {
					collector.channel.send("Saving config...")
					.then((msg) => {
						try {
							fs.writeFileSync(server_config, JSON.stringify(config, undefined, 4));
							msg.edit("Successfully saved config!");
						}
						catch (err) {
							msg.edit(`There was an error saving the config!\n=>${err}`);
						}
					});
				}
			});
		}
		else {
			msg.channel.send("This server is already set up. If you want to redo the config, use `doas setup --reset`");
		}
	},
	"kick": (client, msg, args) => {
		if (msg.member.hasPermission("KICK_MEMBERS")) {
			
		}
	}

}
