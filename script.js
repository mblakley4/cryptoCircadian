'use strict'

const coinGeckoURL = 'https://api.coingecko.com/api/v3/coins/markets'

// const stockNewsAPI_Key = 'tminp4dxa2nxmvimhd892g79czm3hwyhglwa0c0v'

const newsAPI_Key = "8cab291695294d6f831c8f1116bd0008"
const newsSearchURL = 'https://newsapi.org/v2/everything'

// function to assemble query parameters for the URL
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    //   .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

function getCoinRanking() {
    console.log('getCoinRanking ran');

    const params = {
        vs_currency: 'usd',
    }

    const queryString = formatQueryParams(params);
    const url = coinGeckoURL + '?' + queryString;

    console.log('Coin Gecko URL: ' + url);
    dataComms(url);
}

function getCoinNews(query) {
    console.log('getCoinNews ran');
    const params = {
        language: 'en',
        sortBy: 'publishedAt',
        q: query,
    };
    
    const queryString = formatQueryParams(params);
    const url = newsSearchURL + '?' + queryString;

    console.log('News URL: ' + url);

    const options = {
        headers: new Headers({
            "X-Api-Key": newsAPI_Key})
        };
    
        dataComms(url, options);
}

// API... go-fetch
function dataComms(url, options) {
fetch(url, options)
.then(response => {
    if (response.ok) {
    return response.json();
    }
    throw new Error(response.statusText);
})
.then(responseJson => console.log(JSON.stringify(responseJson)))
//.then(responseJson => displayResults(responseJson))
.catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
});
}

function watchForm() {
$('form').submit(event => {
    event.preventDefault();
    console.log('the form was submitted');
    const searchCoin = $('#js-search-coin').val();
    getCoinNews(searchCoin);
});
}

// waiting...watching for user form submisions
$(watchForm);

//call the main page API default display
getCoinRanking();
