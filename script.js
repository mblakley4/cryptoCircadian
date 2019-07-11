'use strict'

const coinGeckoURL = 'https://api.coingecko.com/api/v3/coins/markets'

const newsAPI_Key = "8cab291695294d6f831c8f1116bd0008"
const newsSearchURL = 'https://newsapi.org/v2/everything'

let searchCoin = ''; 
let top100Coins = [];

// function to assemble query parameters for the API URL
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

//function to round numbers to 2 digits
function roundToTwo(num) {
    return num = Math.round(num * 100) / 100;
    console.log('num = ' + num);
} 

//passes in a string containing a big number & returns a rounded & labeled display number
function bigNumberCrusher(bigNumStr) {
    let bigNumLength = bigNumStr.length;
    if (bigNumLength <= 3) {
        return bigNumStr;
    }
    else if (bigNumLength > 3 && bigNumLength <= 6) {
        return decimalAdder(bigNumStr, bigNumLength, 3) + ' K';
    }
    else if (bigNumLength > 6 && bigNumLength <= 9) {
        return decimalAdder(bigNumStr, bigNumLength, 6) + ' M';
    }
    else if (bigNumLength > 9 && bigNumLength <= 12) {
        return decimalAdder(bigNumStr, bigNumLength, 9) + ' B';
    }
    else if (bigNumLength > 12 && bigNumLength <= 15) {
        return decimalAdder(bigNumStr, bigNumLength, 12) + ' T';
    }
    else {
        console.log('myERROR - bigNumberCrusher function needs updated with Quadrillion')
    }
}

//adds a decimal into big number strings at the highest comma separater point
function decimalAdder(bigNumStr, length, sliceNum) {
    let firstStr = bigNumStr.slice(0, length - sliceNum);
    let secondStr = bigNumStr.slice(length - sliceNum);
    let decimalNumStr = firstStr + '.' + secondStr;
    return roundToTwo(decimalNumStr);
}

//get the homepage display of ranked coins from the CoinGecko API
function getCoinRanking() {
    const rankingDisplayID = 1;
    //coinGecko API parameters
    const params = {
        vs_currency: 'usd',
    }
    const queryString = formatQueryParams(params);
    const url = coinGeckoURL + '?' + queryString;
    dataComms(url, rankingDisplayID);
}

//displays the top 10 coins on the homepage
function displayCoinRanking(responseJson) {
    emptyContainers();
    $('#js-coinRankContainer').append(`<h2>Top 10 Coins by Market Capitalization</h2><ul id="results-list"></ul>`)
    for (let i = 0; i < 10; i++) {
        //variables to format responseJson values from coinGecko for display
        let coinName = `${responseJson[i].id}`.toUpperCase();
        let coinSymbol = `${responseJson[i].symbol}`.toUpperCase();
        let currentPrice = roundToTwo(`${responseJson[i].current_price}`);
        let percentChange = roundToTwo(`${responseJson[i].price_change_percentage_24h}`);
        let mktCap = bigNumberCrusher(`${responseJson[i].market_cap}`)
        let totalVol = bigNumberCrusher(`${responseJson[i].total_volume}`);
        $('#results-list').append(
            `<li>
                <div class="coinTile">
                    <img src="${responseJson[i].image}" class="coinLogo Row1">
                    <div class="top-row-container Row1">
                        <h3 onClick="coinLinkClicked('${coinName}')" class="coinLink" id="${coinName}">${responseJson[i].market_cap_rank} - ${coinName} (${coinSymbol})</h3>
                        <h4 class="coinPrice">${currentPrice} USD</h4>
                    </div>
                    <div class="bottom-row-container">
                        <div class="Column1 Row2">
                            <h5>24H%</h5>
                            <h5 class="priceChange coinData">${percentChange}</h5>
                        </div>
                        <div class="Column2 Row2">
                                <h5>MKT CAP</h5>
                                <h5 class="mktCap coinData">${mktCap}</h5>
                        </div>
                        <div class="Column3 Row2">
                                <h5>VOLUME</h5>
                                <h5 class="volume coinData">${totalVol}</h5>
                        </div>
                    </div>  
                </div>
            </li>`
        )
    }
}

//displays the coin trend chart above the current news articles
function displayCoinWidgetChart() {
    $('#js-coinGeckoWidget').append(
        `<script src="https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js"></script>
        <coingecko-coin-price-chart-widget currency="usd" coin-id="${searchCoin}" locale="en" height="300">
        </coingecko-coin-price-chart-widget>`) 
}

//get the most current articles from the NewsAPI
function getCoinNews() {
    const newsDisplayID = 2;
    //newsAPI parameters
    const params = {
        language: 'en',
        sortBy: 'publishedAt',
        q: searchCoin,
    };
    const queryString = formatQueryParams(params);
    const url = newsSearchURL + '?' + queryString;
    const options = {
        headers: new Headers({
            "X-Api-Key": newsAPI_Key})
        };
        dataComms(url, newsDisplayID, options);
}

//displays 15 most current articles from the NewsAPI
function displayCoinNews(responseJson) {
    $('#js-form').append('<a class="homeButton" href="#" onClick="location.reload()">Home</a>')    
    $('#js-coinNews').append(`<h2>${searchCoin} NEWS</h2><ul id="results-list"></ul>`)
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
    .then(responseJson => {
        if (displayID === 1) {
            displayCoinRanking(responseJson);
            //put the response data in a global so we can reference it for user error handling
            top100Coins = responseJson;
        }
        else {displayCoinNews(responseJson);
        }
    })
    .catch(err => {
        emptyContainers();
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//function to take user input and pass param(s) to API call functions
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        searchCoin = $('#js-search-coin').val().toUpperCase();
        emptyContainers();
        checkUserSubmission();
    });
}

//takes user input and checks if the coin exists in the top 100; spell checks too - inaccurate spelling won't
//get the news articles the user wants to see
function checkUserSubmission() {
    let coinMatch = false;
    for (let i = 0; i < 100; i++) {
        let coinID = `${top100Coins[i].id}`.toUpperCase();
        if (searchCoin == coinID) {
            coinMatch = true;
        }
    }
    if (coinMatch === true) {
        getCoinNews();
        displayCoinWidgetChart();
    }
    else {
        $('#js-form').append('<a class="homeButton" href="#" onClick="location.reload()">Home</a>')
        $('#js-coinGeckoWidget').append(`<div class="errorBlock">
        <h2>Typo?</h2>
        <p class="noCoinMessage">We couldn\'t find that coin to display it's trend chart and current news.</p>
        <p class="noCoinMessage">Check your spelling to get the chart and the most accurate news.</p>
        </div>`)
    }
}

//handles coin titles that are clicked and calls getCoinNews
function coinLinkClicked(id) {
    event.preventDefault();
    searchCoin = id;
    emptyContainers();
    getCoinNews();
    displayCoinWidgetChart();
}

//call the main page API default display
getCoinRanking();

// waiting...watching for user form submisions
$(watchForm);

//clear the DOM for new content
function emptyContainers() {
    $('.homeButton').remove()
    $('#js-coinGeckoWidget').empty()
    $('#js-coinNews').empty()
    $('#js-coinRankContainer').empty()
    $('#js-error-message').empty()
}


