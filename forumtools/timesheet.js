/*jshint esversion: 6 */

function getValue(entry) {
  if (entry && entry["$t"]) {
    return entry["$t"];
  }
  return "";
}

function constructSheetUrl(sheetId) {
  return (
    "https://spreadsheets.google.com/feeds/list/1BisuTAtwTCWP_rogUAUMQ7YA4vSvqHe-Hh0Se2btqOg/" +
    sheetId +
    "/public/values?alt=json"
  );
}

function compareData(a, b) {
  if (a.handle < b.handle) {
    return -1;
  }
  if (a.handle > b.handle) {
    return 1;
  }
  if (a.timestamp < b.timestamp) {
    return -1;
  }
  if (a.timestamp > b.timestamp) {
    return 1;
  }
  return 0;
}

let checkinData = [];
let checkoutData = [];

function fetchCheckin() {
  checkinData = [];
  var checkinSheets = [];
  for (var i = 0; i < 13; i++) {
    checkinSheets.push(7 + (i * 2));
  }

  checkinSheets.forEach(sh => {
    var url = constructSheetUrl(sh);
    $.getJSON(url, function (response) {
      var entry = response.feed.entry;
      if (entry) {
        for (var i = 0; i < entry.length; i++) {
          var handle = getValue(entry[i]["gsx$yourhandle"]);
          if (handle) {
            var timestamp = Date.parse(getValue(entry[i]["gsx$timestamp"]));
            // floor to the nearest quarter hour
            timestamp = timestamp - (timestamp % fifteenMinutes);

            checkinData.push({
              timestamp: timestamp,
              handle: handle
            });
          }
        }
      }
    });
  });
}

const fifteenMinutes = 1000 * 60 * 15;

function fetchCheckout() {
  checkoutData = [];
  var checkoutSheets = [];
  for (var i = 0; i < 13; i++) {
    checkoutSheets.push(8 + (i * 2));
  }

  checkoutSheets.forEach(sh => {
    $.getJSON(constructSheetUrl(sh), function (response) {
      var entry = response.feed.entry;
      if (entry) {
        for (var i = 0; i < entry.length; i++) {
          var handle = getValue(entry[i]["gsx$yourhandle"]);
          if (handle) {
            var timestamp = Date.parse(getValue(entry[i]["gsx$timestamp"]));
            // ceil to the nearest half hour
            timestamp = timestamp + fifteenMinutes - (timestamp % fifteenMinutes);

            checkoutData.push({
              timestamp: timestamp,
              handle: handle
            });
          }
        }
      }
    });
  });
}

function mergeData() {
  let dataTable = [];
  checkinData.sort();
  checkoutData.sort();

  const checkinHandles = [...new Set(checkinData.map(item => item.handle))];
  checkinHandles.sort();

  checkinHandles.forEach(handle => {
    const slots = [];
    const checkins = checkinData.filter(ch => ch.handle === handle);
    checkins.forEach(ch => slots.push({ checkin: ch.timestamp }));
    dataTable.push({
      handle: handle,
      slots: slots
    });
  });

  const checkoutHandles = [...new Set(checkoutData.map(item => item.handle))];
  checkoutHandles.sort();

  checkoutHandles.forEach(handle => {
    const checkouts = checkoutData.filter(ch => ch.handle === handle);
    const dataIndex = dataTable.findIndex(ch => ch.handle === handle);
    if (dataIndex < 0) {
      // No checkins for this user!
      slots = [];
      checkouts.forEach(ch => {
        slots.push({
          checkout: ch.timestamp
        });
      });
      dataIndex.push({
        handle: handle,
        slots: slots
      });
    } else {
      // Found 'em!
      const dict = dataTable[dataIndex];
      checkouts.forEach(ch => {
        const slotIndex = dict.slots.findIndex(
          sl => sl.checkin && sl.checkin >= ch.timestamp
        );
        if (slotIndex === 0) {
          // First one!
          dict.slots = [{ checkout: ch.timestamp }, ...dict.slots];
        } else if (slotIndex === -1) {
          // last one... maybe!
          const lastSlot = dict.slots[dict.slots.length - 1];
          if (lastSlot.checkout) {
            // last one has a checkout, need a new one.
            dict.slots.push({ checkout: ch.timestamp });
          } else {
            // last one is good!
            lastSlot.checkout = ch.timestamp;
          }
        } else {
          // it's in the mix somewhere.
          const expectedSlot = dict.slots[slotIndex - 1];
          if (expectedSlot.checkout) {
            // our expected slot has a checkout!  This can happen like so:
            // 1: [checkin: 05, checkout: 08]
            // 2: [checkin: 12]
            // We're looking for a checkout of '10' (someone forgot to check-in)

            // Wedge it into the middle.
            dict.slots = [
              ...dict.slots.slice(0, slotIndex),
              { checkout: ch.timestamp },
              ...dict.slots.slice(slotIndex)
            ];
          } else {
            expectedSlot.checkout = ch.timestamp;
          }
        }
      });
    }
  });
  return dataTable;
}
