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
    $.ajax(data.url,
        {
            dataType: "text",
            cache: true,
            success: function (response) {
                const csvData = CSVToArray(response);
                var userId = csvData[rowNum][3];
                var userName = csvData[rowNum][1];
                var nationName = csvData[rowNum][2];

                populatePersonData(person, userId, userName, nationName);
            }
        }
    );
}

function getFounder() {
    getPersonData(govtFetchData[3], 2, regionData.founder);
}

function getDelegate() {
    getPersonData(govtFetchData[4], 2, regionData.delegate);
}

function constructElectionUrl(sheetId) {
    return 'https://docs.google.com/spreadsheet/ccc?key=14EYEMWndRcZEjW1Mz83QjfzQ1cm9s-vDC6zbuGnmqXY&single=true&output=csv&gid=' + sheetId.toString();
}

function getElectionData() {
    $.ajax(constructElectionUrl(0), {
        dataType: "text",
        cache: true,
        success: function (response) {
            csvData = CSVToArray(response);
            console.log(csvData);

            for (var i = 1; i < csvData.length; i++) {
                var title = csvData[i][0];
                var date = csvData[i][1];

                var today = new Date();
                var electionDate = new Date();

                var dateParts = date.split("/");
                if (dateParts.length > 2) {
                    electionDate = new Date(dateParts[2], (dateParts[0] - 1), dateParts[1]);
                }

                var diffInDays = Math.ceil((electionDate - today) / (1000 * 60 * 60 * 24));
                var htmlOutput = title + " - <b>";
                if (diffInDays > 0) {
                    htmlOutput += diffInDays + " Days";
                } else {
                    htmlOutput += "TODAY";
                }
                htmlOutput += "</b>";

                regionData.elections.push([htmlOutput]);
            }
        }
    });
}

function getRegionNSData() {
    $.ajax({
        type: "GET",
        url: "https://www.nationstates.net/cgi-bin/api.cgi?region=europeia&q=delegatevotes+power+numnations",
        dataType: "xml",
        success: function (response) {

            var population = response.getElementsByTagName("NUMNATIONS")[0].childNodes[0].nodeValue;
            var votes = response.getElementsByTagName("DELEGATEVOTES")[0].childNodes[0].nodeValue;
            var power = response.getElementsByTagName("POWER")[0].childNodes[0].nodeValue;

            regionData.population = population;
            regionData.delegateVotes = votes;
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

    htmlOutput.push("Elections:");
    regionData.elections.forEach(election => htmlOutput.push(election));

    regionData.htmlOutput = htmlOutput;
}