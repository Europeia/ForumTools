function constructForumUrl(forum) {
  return (!window.location.hostname.includes("europeians.com") ? "https://forums.europeians.com/":"") + 
  'index.php?forums/' + forum + '/';
}

lawFetchData = [{
  name: 'Law Index',
  url: constructForumUrl('6000833'),
  htmlOutput: ''
},
{
  name: 'Treaty Index',
  url: constructForumUrl('60031'),
  htmlOutput: ''
}
];

function compareItems(a, b) {
  return a.title.toUpperCase().localeCompare(b.title.toUpperCase());
}

function fetchAndParseLawIndex(data) {
  var feed = '';
  feed += data.url + 'index.rss';

  $.ajax(feed, {
    accepts: {
      xml: 'application/rss+xml'
    },
    dataType: 'xml',
    success: function (response) {
      items = [];

      $(response)
        .find('item')
        .each(function () {
          var el = $(this);

          var item = {
            "link": el.find('link').text(),
            "title": el.find('title').text()
          };

          items.push(item);
        });

      items.sort(compareItems);

      for (i = 0; i < items.length; i++) {
        item = items[i];
        var output = '<li><span class="infoentry"><a href="';
        output += item.link;
        output += '">' + item.title + '</a></span></li>';
        data.htmlOutput += output;
      }

    }
  });
}