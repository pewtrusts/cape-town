/* global Highcharts */
import * as d3 from 'd3-collection';

import s from './styles.scss';
import main from '@Project/css/main.scss';
import Element from '@UI/element/element.js';
import * as topojson from 'topojson-client';
import testData from '@Project/data/test-data.json';


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
        console.log(testData);
        console.log(this.geoJSON);
        // take the csv data and nest it by country so each country is one object with an array of values
        var joinData = d3.nest().key(d => d.iso_a3).entries(this.model.countries).map(d => {
            var ratified = [];
            d.values.sort((a,b) => a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
                if (v.ratified_date !== '' ){
                    ratified.push(v.treaty_id);
                }
            })
            // add className property to each country that corresponds to which treaties it is party to, or "none"
            d.className = ratified.length === 0 ? 'none' : ratified.join('-');
            return d;
        });

        var nestedByClassName = d3.nest().key(d => d.className).entries(joinData);
        console.log(nestedByClassName);
        var series = nestedByClassName.map(s => {
            var data = s.values.map(v => {
                return {
                    iso_a3: v.key,
                    name: this.model.countryCodes[v.key],
                    value: s.key === 'none' ? 'None': s.key.split('-').map(abbr => this.model.treaties.find(t => t.key === abbr).name).join(' | ')
                };
            });
            var features = data.map(country => this.geoJSON.features.find(f => f.id === country.iso_a3));
            console.log(features);
            console.log(data);
            return {
                className: s.key,
                joinBy: 'iso_a3',
                name: s.key,
                shadow: false,
                mapData: {type: "FeatureCollection", features: data.map(country => this.geoJSON.features.find(f => f.id === country.iso_a3))},
                //mapData: this.geoJSON,
                data/*: s.values.map(v => {
                    console.log(s.key.split('-'));
                    return {
                        iso_a3: v.key,
                        name: this.model.countryCodes[v.key],
                        value: s.key === 'none' ? 'None': s.key.split('-').map(abbr => this.model.treaties.find(t => t.key === abbr).name).join(' | ')
                    };
                })*/
            };
        });
        console.log(series);
        console.log(nestedByClassName);
        Highcharts.mapChart(this.el.id, {
            chart: {
               
                borderWidth: 1
            },

           
            title: {
                text: ''
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
                symbolHeight: 14,
                enabled: false
            },

            
           

            series/*: [{
                data: testData,
                joinBy: ['iso_a3', 'code'],
                //animation: true,
                name: 'Population density',
                states: {
                    hover: {
                        color: '#a4edba'
                    } 
                },
                shadow: false
            }]*/
        });
    }
}