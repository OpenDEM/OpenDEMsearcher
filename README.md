# OpenDEMsearcher
OpenLayers 8 project with custom vector tiles including fid

Functions: Hover highlighting and single click feature info
Set up a new [OpenLayers](https://openlayers.org/doc/quickstart.html) project and copy the files to the folder.

## Create vector tiles for VectorTileLayer

The underlying data here originates from [NaturalEarthData.com](https://www.naturalearthdata.com/downloads/)

### Create vector tiles with [Tippecanoe](https://github.com/mapbox/tippecanoe)

    tippecanoe --use-attribute-for-id=fid --no-tile-compression --maximum-zoom=10 -e /yourPath/yourFolderName /yourPath/your.geojson

OpenLayers VectorTilelayers need the data uncompressed: *--no-tile-compression*.

Specify a valid field id with *--use-attribute-for-id*.
Otherwise, the hover highlighting is not working properly, because a feature could be split into many parts.

Supported projections are EPSG:4326 (WGS84, the default) and EPSG:3857 (Web Mercator).

### Create vector tiles with [GDAL](https://gdal.org/)

    ogr2ogr -preserve_fid -f MVT /yourPath/yourFolderName /yourPath/your.geojson -dsco MINZOOM=0 -dsco MAXZOOM=8 -dsco COMPRESS=NO -dsco 

Create a valid fid (*-preserve_fid*) and uncompressed tiles (*-dsco COMPRESS=NO*).

#### GDAL also supports custom projection systems (this was not necessary here)

Use the *TILING_SCHEME* parameter.

    -dsco TILING_SCHEME="EPSG:3035, 2000000.0, 5450000, 5400000"

* 1 parameter: EPSG code
* 2 parameter: xmin
* 3 parameter: ymax
* 4 parameter: distance xmin, max

Example subset of EPSG:3035

* xmin: 2000000.0
* ymin: 1000000.0
* xmax: 7400000.0
* ymax: 5450000.0

OpenLayers code:

    var extent = [2000000.0, 1000000.0, 7400000.0, 5450000.0];
    var states_laea_sub_3035 = new VectorTileLayer({
    className: 'the_name',
    declutter: true,
    source: new VectorTileSource({
    attributions: '...',
    projection: 'EPSG:3035',
    extent: extent,
    format: new MVT({ defaultDataProjection: 'EPSG:3035' }),
    tileGrid: createXYZ({
    minZoom: 0,
    maxZoom: 12,
    extent: extent
    }),
    tilePixelRatio: 1,
    url: "yourFolderName/{z}/{x}/{y}.pbf",
    }),
    extent: extent,
    style: region
    });

To see the entire initial map, you may need to zoom to the extent:

    const padding = [150, 150, 150, 150];
    map.getView().fit(extent, {
    size: map.getSize(),
    padding: padding,
    });
