let keys = require('./keys.js');
var moment = require('moment');

let fs = require('fs');

function logMessage(message) {
    fs.appendFile("./log.txt", `Command:\n${process.argv.slice(2).join(' ')}\n\nOutput:${message}`, function(){
        console.log(message);
    });
};

function myTweets() {
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

    spotify.search({ type: 'track,artist', query: songQuery, limit: 1 }, function (err, data) {
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

function movieThis(movieQuery) {
    let omdb = keys.omdb;
    movieQuery = encodeURIComponent(movieQuery);
    let url = `http://www.omdbapi.com/?apikey=${omdb.api_key}&t=${movieQuery}`

    let request = require('request');
    request(url, function (error, response, body) {

        let movie = JSON.parse(body);
        let title = movie.Title;
        let year = movie.Year;

        let imdb = movie.Ratings.find(site => site.Source === 'Internet Movie Database');
        imdb = (imdb) ? imdb.Value : 'n/a';

        let rotten = movie.Ratings.find(site => site.Source === 'Rotten Tomatoes');
        rotten = (rotten) ? rotten.Value : 'n/a';

        let country = movie.Country;
        let language = movie.Language;


        let message = `\n${title} (${year})\n\n` +
            `${language} (${country})\n` +
            `Ratings:\n` +
            `  Tomatoes: ${rotten}\n` +
            `     IMDB: ${imdb}\n\n` +
            `Plot:\n${movie.Plot}\n\n` +
            `Cast:\n${movie.Actors}`

        logMessage(message);
    })
}

function doCommand() {

    switch (command.toLowerCase()) {
        case 'my-tweets':
            myTweets();
            break;
        case 'spotify-this-song':
            spotifyThisSong(parameter);
            break;
        case 'movie-this':
            movieThis(parameter);
            break;
        default:
            break;
    }

}

/********************************************************************************
 *  Parse Args:  Get Command and additional params
 ********************************************************************************/
let commands = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"];

var command = "";
var parameter = "";
if (process.argv.length >= 3 && commands.includes(process.argv[2].toLowerCase())) {
    command = process.argv[2].toLowerCase();
} else {
    logMessage(`Invalid command. Valid Commands include:\n* ${commands.join('\n* ')}`);
    return;
}


if (command === 'do-what-it-says') {
    fs.readFile("./random.txt", "utf8", function (error, data) {
        if (error) {
            logMessage(error);
            throw error;
        }
        let random = data.split(',');
        command = random[0].trim();
        parameter = random[1].trim()
        doCommand();
    });
} else {
    if (command != 'my-tweets' && process.argv.length <= 3) {
        logMessage(`The command ${command} requires an additional parameter.`);
        return;
    }
    parameter = process.argv.slice(3).join(' ');
    doCommand();
}