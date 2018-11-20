function constructLawUrl(forum) {
  return 'http://www.europeians.com/forum/index.php?forums/' + forum + '/';
}

lawFetchData = [
  {
    name: 'Law Index',
    url: constructLawUrl(
      'alphabetical-list-of-acts-and-executive-orders.60032'
    ),
    htmlOutput: ''
  },
  {
    name: 'Treaty Index',
    url: constructLawUrl('treaty-law.60031'),
    htmlOutput: ''
  }
];

function fetchAndParseLawIndex(data) {
  var feed = data.url + 'index.rss';

  $.ajax(feed, {
    accepts: {
      xml: 'application/rss+xml'
    },
    dataType: 'xml',
    success: function(response) {
      $(response)
        .find('item')
        .each(function() {
          var el = $(this);
          var item = '<li><span class="infoentry"><a href="';
          item += el.find('link').text();
          item += '">' + el.find('title').text() + '</a></span></li>';

          data.htmlOutput += item;
        });
    }
  });
}
