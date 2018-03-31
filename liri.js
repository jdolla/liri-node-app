let commands = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"];

let command = "";
if (process.argv.length >= 3 && commands.includes(process.argv[2])){
    command = process.argv[2];
} else {
    console.log(`Invalid command. Valid Commands include:\n* ${commands.join('\n* ')}`);
    return;
}


let keys = require('./keys.js');

let Spotify = require('node-spotify-api');
let spotify = new Spotify(keys.spotify);

var Twitter = require('twitter');
let client = new Twitter(keys.twitter);


client.get('statuses/home_timeline', function(error, tweets, response) {
    if(error) throw error;
    for(let i = 0; i < tweets.length; i++){
        console.log(`Tweeted: "${tweets[i].text}" at ${tweets[i].created_at}`);
    }
  });
