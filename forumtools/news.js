newsFetchData = {
  name: "Europeia Broadcasting Corporation",
  url: constructForumUrl("4010143"),
  htmlOutput:
    '<ul><li><a href="/forum/index.php?forums/4010143"><img src="https://static.europeians.com/img_repo/EBC_letterhead.png"></a></li>'
};

function compareNewsItems(a, b) {
  if (a.date.getTime() === b.date.getTime()) {
    return 0;
  }

  if (a.date.getTime() < b.date.getTime()) {
    return 1;
  }

  return -1;
}

function fetchAndParseNewsIndex(data) {
  var feed = "";
  feed += data.url + "index.rss";

  $.ajax(feed, {
    accepts: {
      xml: "application/rss+xml"
    },
    dataType: "xml",
    success: function(response) {
      items = [];

      $(response)
        .find("item")
        .each(function() {
          var el = $(this);

          var item = {
            link: el.find("link").text(),
            title: el.find("title").text(),
            date: new Date(el.find("pubDate").text())
          };

          items.push(item);
        });

      items.sort(compareNewsItems);

      data.htmlOutput += "";
      for (i = 0; i < Math.min(items.length, 5); i++) {
        item = items[i];
        var output = '<li><span class="infoentry">';
        output +=
          item.date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          }) + ' <a href="';
        output += item.link;
        output += '">' + item.title + "</a></span></li>";
        data.htmlOutput += output;
      }
      data.htmlOutput += "</ul>";
    }
  });
}
