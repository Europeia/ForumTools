var treaties = [];

function fetchAndParseTreaties() {
  var url =
    'http://www.europeians.com/forum/index.php?forums/treaty-law.60031/index.rss';

  $.ajax(url, {
    accepts: {
      xml: 'application/rss+xml'
    },
    dataType: 'xml',
    success: function(data) {
      $(data)
        .find('item')
        .each(function() {
          var el = $(this);
          var item = '<li><span class="infoentry"><a href="';
          item += el.find('link').text();
          item += '">' + el.find('title').text() + '</a></span></li>';
          treaties.push(item);
        });
    }
  });
}
