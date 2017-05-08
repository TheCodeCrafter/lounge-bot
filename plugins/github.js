const helper = require("./github_helpers");
var commands = function(bot, options, action) {
	let message = action.message.split(" ");
	let query;
	if (message.length < 1) return;
	if (action.message.startsWith(options.commandPrefix) || action.message.startsWith(options.botName)) {
		if (message[0] === "!github" || message[0] === "!gh") {
			message.shift(); // remove the command
			const arg = message[0];
			if (message.length === 1) {
				if (helper.stringIsPositiveInteger(arg)) {
					query = helper.getIssueInformation({
						user: options.githubUser,
						repo: options.githubRepo,
						issue: arg
					});
				} else {
					query = action.nick + ": invalid issue/PR ID.";
				}
			} else if (message.length === 2) { // should be !gh search <query>
				if (arg === "search") {
					message.shift(); // remove 'search'
					query = helper.searchGithub({
						repo: options.githubRepo,
						user: options.githubUser,
						terms: message
					});
				} else {
					query = action.nick + ": invalid command.";
				}
			}
			if (query) {
				// if it's returned as a Promise
				if (typeof query.then === 'function') {
					query.then(function(m) {
						return bot.say(action.target, m);
					});
				} else {
					bot.say(action.target, query);
				}
			} else {
				bot.say(action.target, "No result found for query");
			}
		}
	}
	if (action.message.indexOf("#") > -1 && options.ignore.indexOf(options.ignore) === -1) { // if the message contains # and isn't an ignored user
		let issues = action.message.match(/#([0-9]*)/g);
		if (issues) {
			issues.forEach(function(issue) {
				let issueNumber = issue.substr(1);
				query = helper.getIssueInformation({
					user: options.githubUser,
					repo: options.githubRepo,
					issue: issueNumber
				});
				query.then(function(m) {
					return bot.say(action.target, m);
				});
			});
			return;
		}
	}
}


module.exports = {
	commands
};
