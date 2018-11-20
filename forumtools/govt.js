function getValue(entry) {
    if (entry && entry['$t']) {
        return entry['$t'];
    }
    return '';
}

function constructUrl(sheetId) {
    return 'https://spreadsheets.google.com/feeds/list/1I89Y3G51BbWY0cweQ5sM8AZhMn0fi9YwJHbtr5MfEuU/' + sheetId +
        '/public/values?alt=json';
}

function fetchAndParsePositionList(data) {
    $.getJSON(data.url, function (response) {
        var html = "";
        var entry = response.feed.entry;
        for (var i = 1; i < entry.length; i++) {
            var position = getValue(entry[i][data.positionCellName]);
            var userId = getValue(entry[i][data.userIdCellName]);
            var userName = getValue(entry[i][data.userNameCellName]);
            var nationName = getValue(entry[i][data.nationCellName]);

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
        data.htmlOutput = html;
    });
}

govtFetchData = [{
    "name": "Executive",
    "url": constructUrl('2'),
    "positionCellName": "gsx$_cn6ca",
    "userIdCellName": "gsx$_cre1l",
    "userNameCellName": "gsx$executivegovernmentofeuropeia",
    "nationCellName": "gsx$_cpzh4",
    "htmlOutput": ""
}, {
    "name": "Legislative",
    "url": constructUrl('4'),
    "positionCellName": "gsx$_cn6ca",
    "userIdCellName": "gsx$_cre1l",
    "userNameCellName": "gsx$legislativegovernmentofeuropeia",
    "nationCellName": "gsx$_cpzh4",
    "htmlOutput": ""
}, {
    "name": "Judiciary",
    "url": constructUrl('3'),
    "positionCellName": "gsx$_cn6ca",
    "userIdCellName": "gsx$_cre1l",
    "userNameCellName": "gsx$highcourtofeuropeia",
    "nationCellName": "gsx$_cpzh4",
    "htmlOutput": ""
}, {
    "name": "Chancellery",
    "url": constructUrl('1'),
    "positionCellName": "gsx$_cn6ca",
    "userIdCellName": "gsx$_cre1l",
    "userNameCellName": "gsx$founderandsupremechancelleryofeuropeia",
    "nationCellName": "gsx$_cpzh4",
    "htmlOutput": ""
}];