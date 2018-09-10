/* global Highcharts */
import * as d3 from 'd3-collection';

import s from './styles.scss';
//import main from '@Project/css/main.scss';
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
        //console.log(d3.nest().key(d => d.iso_a3).entries(this.model.countries));
        // take the csv data and nest it by country so each country is one object with an array of values
        var joinData = d3.nest().key(d => d.iso_a3).entries(this.model.countries).map(d => {
            var ratified = [];
            d.values.sort((a,b) => a.treaty_id < b.treaty_id ? -1 : a.treaty_id > b.treaty_id ? 1 : a.treaty_id >= b.treaty_id ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
                if (v.ratified_date !== '' ){
                    ratified.push(v.treaty_id);
                }
            })
            // add className property to each country that corresponds to which treaties it is party to, or "none"
            d.value = ratified.length === 0 ? 'none' : ratified.join('-');
            return d;
        });
        var valueDictionary = { // convert string values into arbitrary numbers
            'none':0,
            'cta':1,
            'ilo':2,
            'psma':3,
            'cta-ilo':4,
            'cta-psma':5,
            'ilo-psma':6,
            'cta-ilo-psma':7            
        };
        var allCountriesData = this.geoJSON.features.filter(f => f.hasOwnProperty('id')).map(f => { // filter for only feature
            var className = joinData.find(d => d.key === f.id) && joinData.find(d => d.key === f.id).value || 'none';                                                                                       // that have iso_a3 codes
            return {
                iso_a3: f.id,
                name: this.model.countryCodes[f.id],
                value: valueDictionary[className],
                className 
            };
        });
        //console.log(joinData);
        console.log(allCountriesData);
/*
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
                //mapData: {type: "FeatureCollection", features: data.map(country => this.geoJSON.features.find(f => f.id === country.iso_a3))},
                //mapData: this.geoJSON,
                data: s.values.map(v => {
                    console.log(s.key.split('-'));
                    return {
                        iso_a3: v.key,
                        name: this.model.countryCodes[v.key],
                        value: s.key === 'none' ? 'None': s.key.split('-').map(abbr => this.model.treaties.find(t => t.key === abbr).name).join(' | ')
                    };
                })
            };
        });
        console.log(series);
        console.log(nestedByClassName);*/
        Highcharts.mapChart(this.el.id, {
            chart: {
                map: this.geoJSON,
                borderWidth: 0
            },
            colorAxis: {
                dataClassColor: 'category',
                dataClasses: [{
                    to: 1 //0
                }, {
                    from: 1, //1
                    to: 2
                }, {
                    from: 2,
                    to: 3
                }, {
                    from: 3,
                    to: 4
                }, {
                    from: 4,
                    to: 5
                }, {
                    from: 5,
                    to: 6
                }, {
                    from: 6
                }]
            },
            colors: ['#ffffff', '#031eff', '#000b66',
                '#007fff', '#ff8d27', '#ff8d27', '#ff8d27'],
           
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

            
           tooltip: {
                formatter: function(){
                    console.log(this);
                    return this.point.value;
                }
           },

            series: [{
                data: allCountriesData,
                joinBy: ['iso_a3'],
                //animation: true,
                name: 'Population density',
                states: {
                    hover: {
                        color: '#a4edba'
                    } 
                },
                shadow: false
            }]
        });
    }
}