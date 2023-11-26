import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { createXYZ } from 'ol/tilegrid';
import { transformExtent } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { defaults as defaultControls, Control } from "ol/control";

var mapExtent = transformExtent([-180.000000, -90.00000, 180.000000, 90.000000], 'EPSG:4326', 'EPSG:3857');
var mapMinZoom = 0;
var mapMaxZoom = 10;
var selection = {};

const region = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(255,0,0,0.3)',
  }),
});

const selectedRegion = new Style({
  stroke: new Stroke({
    color: 'rgba(200,20,20,0.8)',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(200,20,20,0.4)',
  })
});

class RegionControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement('div');
    element.innerHTML = 'Region: ';
    element.id = "regionname";
    super({
      element: element,
      target: options.target,
    });
  }
}
class HelpControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const img = document.createElement('img');
    img.src = 'images/help.png';
    img.className = 'helpimage ol-unselectable ol-control';
    img.id = 'helpimage';

    super({
      element: img,
      target: options.target,
    });

    img.addEventListener('click', this.handleHelp.bind(this), false);
  }

  handleHelp() {
    if (document.getElementById("help").style.display === "none") {
      document.getElementById("help").style.display = "block";
      document.getElementById("helpimage").style.border = "solid 3px red";
    } else {
      document.getElementById("help").style.display = "none";
      document.getElementById("helpimage").style.border = "none";
    }
  }
}

class TocControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    var tocDiv = document.createElement("div");
    var radioItem1 = document.createElement("input");
    radioItem1.type = "radio";
    radioItem1.name = "radioGrp";
    radioItem1.id = "rad1";
    radioItem1.value = "myradio1";
    radioItem1.defaultChecked = true;
    radioItem1.checked = true;
    var radioItem2 = document.createElement("input");
    radioItem2.type = "radio";
    radioItem2.name = "radioGrp";
    radioItem2.id = "rad2";
    radioItem2.value = "myradio2";
    var objTextNode1 = document.createTextNode(" High Resolution DEMs (<= 2m)");
    var objTextNode2 = document.createTextNode(" Middle Resolution DEMs (2-30 m");
    var objLabel = document.createElement("label");
    var objLabel = document.createElement("label");
    objLabel.style.cssText = "position:absolute;top:5px;left:10px";
    objLabel.htmlFor = radioItem1.id;
    objLabel.appendChild(radioItem1);
    objLabel.appendChild(objTextNode1);
    var objLabel2 = document.createElement("label");
    objLabel2.style.cssText = "position:absolute;top:30px;left:10px;";
    objLabel2.htmlFor = radioItem2.id;
    objLabel2.appendChild(radioItem2);
    objLabel2.appendChild(objTextNode2);
    tocDiv.appendChild(objLabel);
    tocDiv.appendChild(objLabel2);
    tocDiv.style.cssText =
      "position:absolute; bottom:5px; left:5px; width: 260px; height:60px; background-color:white;";
    tocDiv.className = "tocDiv";
    tocDiv.id = "tocDiv";

    super({
      element: tocDiv,
      target: options.target,
    });

    tocDiv.addEventListener(
      "click",
      this.handleTocDivChange.bind(this),
      false
    );

  }
  handleTocDivChange() {
    let toclayer = document.getElementsByName('radioGrp');
    if (toclayer[0].checked) {
      // high res
      highresLayer.setVisible(true);
      highresSelectionLayer.setVisible(true);
      midresLayer.setVisible(false);
      midresSelectionLayer.setVisible(false);
    } else {
      // middle res
      highresLayer.setVisible(false);
      highresSelectionLayer.setVisible(false);
      midresLayer.setVisible(true);
      midresSelectionLayer.setVisible(true);
    }
  }
}

// Prepare vector layer
var highresLayer = new VectorTileLayer({
  className: 'highresLayer',
  declutter: true,
  source: new VectorTileSource({
    attributions: ', Made with <a target="_blank" href="http://www.naturalearthdata.com/">Natural Earth</a>.',
    format: new MVT(),
    tileGrid: createXYZ({
      minZoom: mapMinZoom,
      maxZoom: mapMaxZoom,
      tileSize: 512,
    }),
    tilePixelRatio: 8,
    url: "https://www.opendem.info/opendemsearcher/highres/{z}/{x}/{y}.pbf",
  }),
  extent: mapExtent,
  style: region
});

var midresLayer = new VectorTileLayer({
  className: 'midresLayer',
  declutter: true,
  visible: false,
  source: new VectorTileSource({
    attributions: ', Made with <a target="_blank" href="http://www.naturalearthdata.com/">Natural Earth</a>.',
    format: new MVT(),
    tileGrid: createXYZ({
      minZoom: mapMinZoom,
      maxZoom: mapMaxZoom,
      tileSize: 512,
    }),
    tilePixelRatio: 8,
    url: "https://www.opendem.info/opendemsearcher/midres/{z}/{x}/{y}.pbf",
  }),
  extent: mapExtent,
  style: region
});

var view = new View({
  center: [0, 0],
  zoom: 2
});

let map = new Map({
  target: 'map',
  controls: defaultControls().extend([
    new TocControl(),
    new RegionControl(),
    new HelpControl()
  ]),
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    highresLayer,
    midresLayer
  ],
  view: view
});

// Selection
const highresSelectionLayer = new VectorTileLayer({
  map: map,
  className: 'highresSelectionLayer',
  renderMode: 'vector',
  source: highresLayer.getSource(),
  style: function (feature) {
    if (feature.getId() in selection) {
      return selectedRegion;
    }
  }
});

const midresSelectionLayer = new VectorTileLayer({
  map: map,
  className: 'midresSelectionLayer',
  renderMode: 'vector',
  source: midresLayer.getSource(),
  style: function (feature) {
    if (feature.getId() in selection) {
      return selectedRegion;
    }
  }
});

// Popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById("popup-closer");

var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  },
});

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};
map.addOverlay(overlay);

// Single Click Event
map.on('singleclick', function (e) {
  var html = '';
  var htmlregion1 = '';
  map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
    var props = feature.getProperties();
    if (layer) {
      var licenseURL = '';
      if (props.lic_url != undefined) {
        licenseURL = '<a target="_blank" href="' + props.lic_url + '">' + props.license + '</a>';
      }
      var dtmURL = '';
      if (props.data_dtm != undefined) {
        dtmURL = '<a target="_blank" href="' + props.data_dtm + '">Link</a>';
      }
      var dsmURL = '';
      if (props.data_dsm != undefined) {
        dsmURL = '<a target="_blank" href="' + props.data_dsm + '">Link</a>';
      }
      var comment = '';
      if (props.comment != undefined) {
        comment = props.comment;
      }

      if (html.length > 0) {
        // Tabs
        let htmlfirst = html;
        // extract region
        html = `<ul class="tab"><li><a href="javascript:void(0)" class="tablinks active"
        onclick="switchTabs(event, \'tab1\')" id="defaultOpen">${props.region}
        </a></li><li><a href="javascript:void(0)" class="tablinks" onclick="switchTabs(event, \'tab2\')">
        ${htmlregion1}</a></li></ul>`;

        html += `<div id="tab1" class="inspect-layer">
  <h3>Region: ${props.region}</h3>
  <ul style="list-style-type:none;">
  <li>Distributor: <a target="_blank" href="${props.d_url}">${props.distributo}</a></li>
  <li>License: ${licenseURL}</li>
  <li>Data type: ${props.data_type}</li>
  <li>Resolution: ${props.resolution}</li>
  <li>Link DTM: ${dtmURL}</li>
  <li>Link DSM: ${dsmURL}</li>
  <li>Comment: ${comment}</li>
  </ul>
  </div>`;

        htmlfirst = htmlfirst.replace('<div class="inspect-layer">', '<div id="tab2" class="inspect-layer-deactive">');
        html += htmlfirst;
      } else {
        htmlregion1 = props.region;
        html += `<div class="inspect-layer">
  <h3>Region: ${props.region}</h3>
  <ul style="list-style-type:none;">
  <li>Distributor: <a target="_blank" href="${props.d_url}">${props.distributo}</a></li>
  <li>License: ${licenseURL}</li>
  <li>Data type: ${props.data_type}</li>
  <li>Resolution: ${props.resolution}</li>
  <li>Link DTM: ${dtmURL}</li>
  <li>Link DSM: ${dsmURL}</li>
  <li>Comment: ${comment}</li>
  </ul>
  </div > `;
      }
    }
  });

  if (html.length > 0) {
    content.innerHTML = html;
    if (e.coordinate[1] > 0) {
      document.getElementById('popup').className = 'ol-popup-bottom';
    } else {
      document.getElementById('popup').className = 'ol-popup';
    }
    overlay.setPosition(e.coordinate);
  } else {
    overlay.setPosition(undefined);
  }
});

//const selectElement = document.getElementById('type');

// MouseOver Selection
map.on('pointermove', function (event) {
  if (highresSelectionLayer.getVisible()) {
    highresLayer.getFeatures(event.pixel).then(function (features) {
      if (!features.length || !highresSelectionLayer.getVisible()) {
        selection = {};
        highresSelectionLayer.changed();
        document.getElementById('regionname').innerHTML = 'Region:';
        return;
      }
      const feature = features[0];
      if (!feature) {
        return;
      }
      const fid = feature.getId();
      document.getElementById('regionname').innerHTML = 'Region: ' + features[0].properties_.region;
      // add selected feature to lookup
      selection[fid] = feature;
      highresSelectionLayer.changed();
    });
  } else {
    midresLayer.getFeatures(event.pixel).then(function (features) {
      if (!features.length || !midresSelectionLayer.getVisible()) {
        selection = {};
        midresSelectionLayer.changed();
        document.getElementById('regionname').innerHTML = 'Region:';
        return;
      }
      const feature = features[0];
      if (!feature) {
        return;
      }
      const fid = feature.getId();
      document.getElementById('regionname').innerHTML = 'Region: ' + features[0].properties_.region;
      // add selected feature to lookup
      selection[fid] = feature;
      midresSelectionLayer.changed();
    });
  }
});
