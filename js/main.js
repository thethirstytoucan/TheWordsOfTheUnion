/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches

// load data using promises
let promises = [
    d3.csv("Data/cleaned_data/csv_format_d3/abortion_sentiment.csv"), //0
    d3.csv("Data/cleaned_data/csv_format_d3/alliances.csv"), //1
    d3.csv("Data/cleaned_data/csv_format_d3/china_sentiment.csv"), //2
    d3.csv("Data/cleaned_data/csv_format_d3/climate_sentiment.csv"), //3
    d3.csv("Data/cleaned_data/csv_format_d3/country_state_mentions.csv"), //4
    d3.csv("Data/cleaned_data/csv_format_d3/economy.csv"), //5
    d3.csv("Data/cleaned_data/csv_format_d3/nafta_sentiment.csv"), //6
    d3.csv("Data/cleaned_data/csv_format_d3/nato_sentiment.csv"), //7
    d3.csv("Data/cleaned_data/csv_format_d3/oil_sentiment.csv"), //8
    d3.csv("Data/cleaned_data/csv_format_d3/policy.csv"), //9
    d3.csv("Data/cleaned_data/csv_format_d3/policy_agg.csv"), //10
    d3.csv("Data/cleaned_data/csv_format_d3/speech_length.csv"), //11
    d3.csv("Data/cleaned_data/csv_format_d3/speech_length_agg.csv"), //12

    d3.json('Data/tagged_full_text/combined_data.json'), //13

    // add more files here
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    // init visualizations
    myBarVis = new BarVis('racing-bar-chart', dataArray[12]);

    myStackedBarVis = new StackedBarVis('stacked-bars-themes', dataArray[10]);

    themeBeeswarm = new ThemeBeeswarm('theme-beeswarm', dataArray[13]);

}