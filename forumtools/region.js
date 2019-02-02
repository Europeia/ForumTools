var regionData = {
    population: "",
    delegate: {
        name: "",
        userId: "",
        nation: "",
        htmlOutput: ""
    },
    delegateVotes: "",
    founder: {
        name: "",
        userId: "",
        nation: "",
        htmlOutput: "",
    },
    power: "",
    elections: [],
    htmlOutput: []
};

function populatePersonData(person, userId, userName, nationName) {
    person.userId = userId;
    person.userName = userName;
    person.nationName = nationName;

    var html = "";
    if (userName.length > 0) {
        if (userId.length > 0) {
            html += '<a href=http://europeians.com/forum/index.php?members/' + userId + '>' +
                userName + '</a>';
            if (nationName.length > 0) {
                html += '<sup><a href=http://nationstates.net/nation=' + nationName +
                    '>NS</a></sup>';
            }
        } else {
            html += userName;
        }
    }

    person.htmlOutput = html;
}

function getPersonData(data, rowNum, person) {
    $.getJSON(data.url, function (response) {
        var entry = response.feed.entry;
        var userId = getValue(entry[rowNum][data.userIdCellName]);
        var userName = getValue(entry[rowNum][data.userNameCellName]);
        var nationName = getValue(entry[rowNum][data.nationCellName]);

        populatePersonData(person, userId, userName, nationName);
    });
}

function getFounder() {
    getPersonData(govtFetchData[3], 1, regionData.founder);
}

function getDelegate() {
    getPersonData(govtFetchData[4], 1, regionData.delegate);
}

function constructElectionUrl(sheetId) {
    return 'https://spreadsheets.google.com/feeds/list/14EYEMWndRcZEjW1Mz83QjfzQ1cm9s-vDC6zbuGnmqXY/' + sheetId +
        '/public/values?alt=json';
}

function getElectionData() {
    $.getJSON(constructElectionUrl(1), function (response) {
        var entry = response.feed.entry;

        for (var i = 0; i < entry.length; i++) {
            var title = getValue(entry[i]["gsx$election"]);
            var date = getValue(entry[i]["gsx$date"]);

            var today = new Date();
            var electionDate = new Date();

            var dateParts = date.split("/");
            if (dateParts.length > 2) {
                electionDate = new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
            }

            var diffInDays = Math.floor((electionDate - today) / (1000 * 60 * 60 * 24));
            var htmlOutput = title + " - ";
            if (diffInDays > 0) {
                htmlOutput += diffInDays + " Days";
            } else {
                htmlOutput += "TODAY";
            }

            regionData.elections.push([htmlOutput]);
        }
    })
}

function getRegionNSData() {
    $.ajax({
        type: "GET",
        url: "https://www.nationstates.net/cgi-bin/api.cgi?region=europeia&q=delegatevotes+power+numnations",
        dataType: "xml",
        success: function(response) {
            
            var population = response.getElementsByTagName("NUMNATIONS")[0].childNodes[0].nodeValue;
            var votes = response.getElementsByTagName("DELEGATEVOTES")[0].childNodes[0].nodeValue;
            var power = response.getElementsByTagName("POWER")[0].childNodes[0].nodeValue;

            regionData.population = population;
            regionData.votes = votes;
            regionData.power = power;
        }
    })
}

function getRegionData() {
    getFounder();
    getDelegate();
    getRegionNSData();
    getElectionData();
}

function generateRegionHtmlOutput() {
    var htmlOutput = [];

    var regionLinkLine = '<span class="bbcode-ministers">NationStates link:</span> ';
    regionLinkLine += '<a href=https://www.nationstates.net/region=europeia">Europeia</a>';
    htmlOutput.push(regionLinkLine);

    var populationLine = '<span class="bbcode-ministers">Population:</span> ' + regionData.population;
    htmlOutput.push(populationLine);

    var delegateLine = '<span class="bbcode-wa_delegate">WA Delegate:</span> ';
    delegateLine += regionData.delegate.htmlOutput;
    htmlOutput.push(delegateLine);

    var votesLine = '<span class="bbcode-wa_delegate">Delegate votes:</span> ' + regionData.delegateVotes;
    htmlOutput.push(votesLine);

    var founderLine = '<span class="bbcode-senators">Founder:</span> ';
    founderLine += regionData.founder.htmlOutput;
    htmlOutput.push(founderLine);

    var regionalPowerLine = '<span class="bbcode-senators">Regional Power:</span> ' + regionData.power;
    regionalPowerLine += '<br /><hr />';
    htmlOutput.push(regionalPowerLine);

    regionData.elections.forEach(election => htmlOutput.push(election));

    regionData.htmlOutput = htmlOutput;
}