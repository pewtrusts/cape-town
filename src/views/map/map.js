/* global Highcharts */
import s from './styles.scss';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';
import * as topojson from 'topojson-client';

const dataPath = 'data/worldtopo.json'; // path to dat file relative to index.html

export default class MapView extends Element {
    prerender(){
        var map = super.prerender();
        if ( this.prerendered ) {
            return map;
        }
        map.innerHTML = 'map';
        map.classList.add(s.mapContainer);
        map.classList.add(main.wireframe);
        return map;
    }
    init(){
        console.log('map view initialized');
        this.getTopoJSON();
    }
    getTopoJSON(){
        fetch(dataPath)
            .then(function(response){
                return response.json();
            })
            .then(topo => {
                this.convertToGeoJSON(topo);
            });
    }
    convertToGeoJSON(topo){
        this.geoJSON = topojson.feature(topo, topo.objects.world);
        this.initializeMap()
    }
    initializeMap(){
        var that = this;
   /*     console.log(this.geoJSON);
        Highcharts.mapChart(this.el.id, {
            map: this.geoJSON,
            borderWidth:1
        });
*/
        // Load the data from a Google Spreadsheet
        // https://docs.google.com/spreadsheets/d/1WBx3mRqiomXk_ks1a5sEAtJGvYukguhAkcCuRDrY1L0/pubhtml
        Highcharts.data({
            googleSpreadsheetKey: '1WBx3mRqiomXk_ks1a5sEAtJGvYukguhAkcCuRDrY1L0',

            // Custom handler when the spreadsheet is parsed
            parsed: function (columns) {

                // Read the columns into the data array
                var data = [];
                Highcharts.each(columns[0], function (code, i) {
                    data.push({
                        code: code.toUpperCase(),
                        value: parseFloat(columns[2][i]),
                        name: columns[1][i]
                    });
                });
                console.log(data);
                // Initiate the chart
                Highcharts.mapChart(that.el.id, {
                    chart: {
                        map: that.geoJSON,
                        borderWidth: 1
                    },

                    colors: ['rgba(19,64,117,0.05)', 'rgba(19,64,117,0.2)', 'rgba(19,64,117,0.4)',
                        'rgba(19,64,117,0.5)', 'rgba(19,64,117,0.6)', 'rgba(19,64,117,0.8)', 'rgba(19,64,117,1)'],

                    title: {
                        text: 'Population density by country (/km²)'
                    },

                    mapNavigation: {
                        enabled: true
                    },

                    legend: {
                        title: {
                            text: 'Individuals per km²',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                            }
                        },
                        align: 'left',
                        verticalAlign: 'bottom',
                        floating: true,
                        layout: 'vertical',
                        valueDecimals: 0,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255, 255, 255, 0.85)',
                        symbolRadius: 0,
                        symbolHeight: 14
                    },

                    colorAxis: {
                        dataClasses: [{
                            to: 3
                        }, {
                            from: 3,
                            to: 10
                        }, {
                            from: 10,
                            to: 30
                        }, {
                            from: 30,
                            to: 100
                        }, {
                            from: 100,
                            to: 300
                        }, {
                            from: 300,
                            to: 1000
                        }, {
                            from: 1000
                        }]
                    },

                    series: [{
                        data: data,
                        joinBy: ['iso_a3', 'code'],
                        animation: true,
                        name: 'Population density',
                        states: {
                            hover: {
                                color: '#a4edba'
                            }
                        },
                        tooltip: {
                            valueSuffix: '/km²'
                        },
                        shadow: false
                    }]
                });
            },
            error: function () {
                document.getElementById('container').innerHTML = '<div class="loading">' +
                    '<i class="icon-frown icon-large"></i> ' +
                    'Error loading data from Google Spreadsheets' +
                    '</div>';
            }
        });

    }
}