'use strict'

const coinGeckoURL = 'https://api.coingecko.com/api/v3/coins/markets'

// const stockNewsAPI_Key = 'tminp4dxa2nxmvimhd892g79czm3hwyhglwa0c0v'

const newsAPI_Key = "8cab291695294d6f831c8f1116bd0008"
const newsSearchURL = 'https://newsapi.org/v2/everything'

let searchCoin = ''; 

// function to assemble query parameters for the URL
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    //   .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

//get the homepage display of ranked coins from the CoinGecko API
function getCoinRanking() {
    console.log('getCoinRanking ran');
    const rankingDisplayID = 1;
   
    //API parameters
    const params = {
        vs_currency: 'usd',
    }
    const queryString = formatQueryParams(params);
    const url = coinGeckoURL + '?' + queryString;
    
    console.log('Coin Gecko URL: ' + url);

    dataComms(url, rankingDisplayID);
}

//function to round numbers to 2 digits
function roundToTwo(num) {
    return num = Math.round(num * 100) / 100;
    console.log('num = ' + num);
} 

function displayCoinRanking(responseJson) {
    console.log('displayCoinRanking ran');
    console.log(responseJson);
    emptyContainers();
    $('#js-coinRankContainer').append(`<h2>Top 10 Coins</h2><ul id="results-list"></ul>`)
    for (let i = 0; i < 10; i++) {
        //variables to format responseJson values
        let coinName = `${responseJson[i].id}`.toUpperCase();
        let coinSymbol = `${responseJson[i].symbol}`.toUpperCase();
        let currentPrice = roundToTwo(`${responseJson[i].current_price}`);
        let percentChange = roundToTwo(`${responseJson[i].price_change_percentage_24h}`);
        // add function to evaluate mktCap & totalVol and return 4 digit numbers with appropriate label
        // let mktCap = 
        // let totalVol = 
        
        $('#results-list').append(
            `<li>
                <div class="rankNumber">#${responseJson[i].market_cap_rank}</div>
                <div class="coinTile">
                    <img src="${responseJson[i].image}" class="coinLogo Row1">
                    <div class="Row1">
                        <h3 onClick="coinLinkClicked('${coinName}')" class="coinLink" id="${coinName}">${coinName} (${coinSymbol})</h3>
                        <h4 class="coinPrice">${currentPrice} USD</h4>
                    </div>
                    <div class="bottom-row-container">
                        <div class="Column1 Row2">
                            <h5>24H%</h5>
                            <h5 class="priceChange">${percentChange}</h5>
                        </div>
                        <div class="Column2 Row2">
                                <h5>MKT CAP</h5>
                                <h5 class="mktCap">${responseJson[i].market_cap}</h5>
                        </div>
                        <div class="Column3 Row2">
                                <h5>VOLUME</h5>
                                <h5 class="volume">${responseJson[i].total_volume}</h5>
                        </div>
                    </div>  
                </div>
            </li>`
        )
    }
}

//get DOM display data from the NewsAPI
function getCoinNews() {
    console.log('getCoinNews ran');
    const newsDisplayID = 2;

    //newsAPI parameters
    const params = {
        language: 'en',
        sortBy: 'publishedAt',
        q: searchCoin,
    };
    
    const queryString = formatQueryParams(params);
    const url = newsSearchURL + '?' + queryString;

    console.log('News URL: ' + url);

    const options = {
        headers: new Headers({
            "X-Api-Key": newsAPI_Key})
        };
    
        dataComms(url, newsDisplayID, options);
}

//display the coinGecko widget with top articles from newsAPI based on user entered coin
function displayCoinNews(responseJson) {
    console.log('displayCoinNews ran');
    console.log(responseJson);
    $('#js-form').append('<input class="homeButton" type="button" value="  Home  " onClick="location.reload()"></input>')
    $('#js-coinGeckoWidget').append(
            `<script src="https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js"></script>
            <coingecko-coin-price-chart-widget currency="usd" coin-id="${searchCoin}" locale="en" height="300">
            </coingecko-coin-price-chart-widget>`)     
    $('#js-coinNews').append(`<h2>${searchCoin} News Articles</h2><ul id="results-list"></ul>`)
    for (let i = 0; i < 15; i++) {
        $('#results-list').append(
            `<li>
                <div class="newsTile">
                    <a target="_blank" href="${responseJson.articles[i].url}">
                        <img src="${responseJson.articles[i].urlToImage}" class="articleImage row">
                    </a>
                    <div class="row">
                        <div class="newsTitle">
                            <a target="_blank" href="${responseJson.articles[i].url}">${responseJson.articles[i].title}</a>
                        </div>
                        <div class="articleDescription">${responseJson.articles[i].description}
                        </div>
                    </div>
                </div>
                <hr />
            </li>`
        )
    }
}

// API... go-fetch
function dataComms(url, displayID, options) {
fetch(url, options)
.then(response => {
    if (response.ok) {
    return response.json();
    }
    throw new Error(response.statusText);
})
// .then(responseJson => console.log(JSON.stringify(responseJson)))
.then(responseJson => {
    if (displayID === 1) {
        displayCoinRanking(responseJson);
    }
    else {displayCoinNews(responseJson);
    }
})
.catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
});
}

//function to take user input and pass param(s) to API call functions
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        console.log('the form was submitted');
        searchCoin = $('#js-search-coin').val();
        emptyContainers();
        getCoinNews();
    });
}

//handles coin titles that are clicked and calls getCoinNews
function coinLinkClicked(id) {
    event.preventDefault();
    console.log('the user clicked a coin link & ID = ' + id);
    searchCoin = id;
    console.log('searchCoin = ' + searchCoin);
    emptyContainers();
    getCoinNews();
}

// waiting...watching for user form submisions
$(watchForm);


//call the main page API default display
getCoinRanking();

//clear or empty out the DOM for new content
function emptyContainers() {
    $('.homeButton').remove()
    $('#js-coinGeckoWidget').empty()
    $('#js-coinNews').empty()
    $('#js-coinRankContainer').empty()
}
