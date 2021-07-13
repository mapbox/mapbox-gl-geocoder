var GOLDEN_GATE_BRIDGE = {
  geometry: {
    type: "Point",
    coordinates: [-122.47846999999996, 37.81914000000006],
  },
  place_name:
    "Golden Gate Bridge, Golden Gate Brg, San Francisco, CA, 94129, USA",
  properties: {
    Country: "USA",
    Label: "Golden Gate Bridge, Golden Gate Brg, San Francisco, CA, 94129, USA",
    Municipality: "San Francisco",
    PostalCode: "94129",
    Region: "California",
    Street: "Golden Gate Brg",
    SubRegion: "City and County of San Francisco",
  },
  type: "Feature",
  text: "Golden Gate Bridge, Golden Gate Brg, San Francisco, CA, 94129, USA",
  place_type: ["place"],
  center: [-122.47846999999996, 37.81914000000006],
};

var CANADA = {
  geometry: {
    type: "Point",
    coordinates: [-113.64257999999995, 60.108670000000075],
  },
  place_name: "Canada",
  properties: {
    Country: "CAN",
    Label: "Canada",
  },
  type: "Feature",
  text: "Canada",
  place_type: ["place"],
  center: [-113.64257999999995, 60.108670000000075],
  bbox: [-140.99778, 41.6751050889, -52.6480987209, 83.23324],
};

var QUEEN_STREET = {
  geometry: {
    type: "Point",
    coordinates: [0.41218404200003533, 51.18466021800003],
  },
  place_name: "Queen Street, Maidstone, Kent, England, GBR",
  properties: {
    foo: "bar",
    Country: "GBR",
    Label: "Queen Street, Maidstone, Kent, England, GBR",
    Municipality: "Maidstone",
    Region: "England",
    SubReion: "Kent",
  },
  type: "Feature",
  text: "Queen Street",
  place_type: ["place"],
  center: [0.41218404200003533, 51.18466021800003],
};

var PARIS = {
  geometry: {
    type: "Point",
    coordinates: [2.3414000000000215, 48.85717000000005],
  },
  place_name: "Paris, France",
  properties: {
    Country: "FRA",
    Label: "Paris, Île-de-France, FRA",
    Municipality: "Paris",
    Region: "Île-de-France",
    SubRegion: "Paris",
  },
  type: "Feature",
  text: "Paris, Île-de-France, FRA",
  place_type: ["place"],
  center: [2.3414000000000215, 48.85717000000005],
};

var LONDON = {
  geometry: {
    type: "Point",
    coordinates: [-0.12769869299995662, 51.507408360000056],
  },
  place_name: "London, Greater London, England, GBR",
  properties: {
    Country: "GBR",
    Label: "London, Greater London, England, GBR",
    Municipality: "London",
    Region: "England",
    SubRegion: "Greater London",
  },
  type: "Feature",
  text: "London, Greater London, England, GBR",
  place_type: ["place"],
  center: [-0.12769869299995662, 51.507408360000056],
};

var TANZANIA = {
  geometry: {
    type: "Point",
    coordinates: [34.517755, -6.193388],
  },
  place_name: "Manyoni, Singida, Tanzania",
  properties: {
    Country: "TZA",
    Label: "Manyoni, Singida, Tanzania",
    Municipality: "Manyoni",
    Region: "Singida",
    SubRegion: "Manyoni",
  },
  type: "Feature",
  text: "Manyoni, Singida, Tanzania",
  place_type: ["place"],
  center: [34.517755, -6.193388],
};

var BELLINGHAM = {
  geometry: {
    type: "Point",
    coordinates: [-122.49998672488617, 48.717186690468154],
  },
  place_name: "1714 14th St, Bellingham, WA, 98225, USA",
  properties: {
    AddressNumber: "1714",
    Country: "USA",
    Label: "1714 14th St, Bellingham, WA, 98225, USA",
    Municipality: "Bellingham",
    Neighborhood: "Fairhaven",
    PostalCode: "98225",
    Region: "Washington",
    Street: "14th St",
    SubRegion: "Whatcom County",
  },
  type: "Feature",
  text: "1714 14th St, Bellingham, WA, 98225, USA",
  place_type: ["place"],
  center: [-122.49998672488617, 48.717186690468154],
};

module.exports = {
  GOLDEN_GATE_BRIDGE,
  CANADA,
  QUEEN_STREET,
  PARIS,
  LONDON,
  TANZANIA,
  BELLINGHAM,
};
