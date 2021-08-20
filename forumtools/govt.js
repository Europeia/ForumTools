function constructGovtUrl(sheetId) {
    return 'https://docs.google.com/spreadsheet/ccc?key=1I89Y3G51BbWY0cweQ5sM8AZhMn0fi9YwJHbtr5MfEuU&single=true&output=csv&gid=' + sheetId;
}

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    var arrData = [[]];

    var arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            arrData.push([]);
        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}

function fetchAndParsePositionList(data) {
    $.ajax(data.url,
        {
            datatype: "text",
            cache: true,
            success: function (response) {
                csvData = CSVToArray(response);
                var html = "";

                for (var i = 2; i < csvData.length; i++) {
                    if (data.showInBanner) {
                        var position = csvData[i][0];
                        var userId = csvData[i][3];
                        var userName = csvData[i][1];
                        var nationName = csvData[i][2];

                        html += '<li class="menuItem">' + position;

                        if (userName.length > 0) {
                            html += ' - ';
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
                        html += '</li>';
                    }
                }
                data.htmlOutput = html;
            }
        });
}

govtFetchData = [{
    "name": "Executive",
    "url": constructGovtUrl('0'),
    "htmlOutput": "",
    "showInBanner": true
}, {
    "name": "Legislative",
    "url": constructGovtUrl('796792756'),
    "htmlOutput": "",
    "showInBanner": true
}, {
    "name": "Judiciary",
    "url": constructGovtUrl('25811558'),
    "htmlOutput": "",
    "showInBanner": true
}, {
    "name": "Chancellery",
    "url": constructGovtUrl('1970855203'),
    "htmlOutput": "",
    "showInBanner": true
}, {
    "name": "WA Delegate",
    "url": constructGovtUrl('497862193'),
    "htmlOutput": "",
    "showInBanner": false
}];