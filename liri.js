let keys = require('./keys.js');
var moment = require('moment');

function logMessage(message) {
    console.log(message);
    //later, add file loggin
};

function myTweets(){
    var Twitter = require('twitter');
    let client = new Twitter(keys.twitter);
    client.get('statuses/home_timeline', function (error, tweets, response) {
        if (error) throw error;
        for (let i = 0; i < tweets.length; i++) {
            let tweetDate = moment(tweets[i].created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
            let tweetText = tweets[i].text;
            logMessage(`On ${tweetDate.format('M-D-YY')}, at ${tweetDate.format('hh:mm A')} JDolla said "${tweetText}."`);
        }
    });
}

function spotifyThisSong(songQuery) {
    let Spotify = require('node-spotify-api');
    let spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track,artist', query: songQuery, limit: 1 }, function(err, data) {
        if (err) {
          return logMessage('Error occurred: ' + err);
        }
      
        let track = data.tracks.items[0];      
        let artist = track.artists[0].name;
        let title = track.name;
        let preview = track.preview_url;
        let album = track.album.name;

        let message = `Maybe this is what you're looking for...\n` +
            `Track Title:\t${artist}\n` +
            `Artist Name:\t${title}\n` +
            `Album Name:\t${album}\n` +
            `Preview:\t${(preview || "Preview not available.")}\n`
        logMessage(message);
    });
}

function movieThis(movieQuery){
    let omdb = keys.omdb;
    movieQuery = encodeURIComponent(movieQuery);
    let url = `http://www.omdbapi.com/?apikey=${omdb.api_key}&t=${movieQuery}`

    let request = require('request');
    request(url, function(error, response, body){
        console.log(body);
    })
}


/********************************************************************************
 *  Parse Args:  Get Command and additional params
 ********************************************************************************/
let commands = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"];

let command = "";
if (process.argv.length >= 3 && commands.includes(process.argv[2].toLowerCase())) {
    command = process.argv[2].toLowerCase();
} else {
    logMessage(`Invalid command. Valid Commands include:\n* ${commands.join('\n* ')}`);
    return;
}



switch (command.toLowerCase()) {
    case 'my-tweets':
        myTweets();
        break;
    case 'spotify-this-song':
        if(process.argv.length <= 3){
            logMessage('You must provide a search value.  For example:  Banditios - The Refreshments');
            return;
        }
        let songQuery = process.argv.slice(3).join(' ');
        spotifyThisSong(songQuery);
        break;
    case 'movie-this':
        if(process.argv.length <=3){
            logMessage('You must provide a search value.  For example:  The Matrix');
            return;
        }
        let movieQuery = process.argv.slice(3).join(' ');
        movieThis();
        break;
    default:
        break;
}
