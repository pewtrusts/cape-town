/* global Highcharts */

import * as d3 from 'd3-collection';

import s from './styles.scss';
import './map-overrides.scss'; // '-override' is excluded from modularized css renaming
                                             // so that the imported class match the ones on the external
                                             // resource being overridden
//import main from '@Project/css/main.scss';
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
        // take the csv data and nest it by country so each country is one object with an array of values
        var joinData = d3.nest().key(d => d.iso_a3).entries(this.model.countries).map(d => {
            var ratified = [];
            d.values.sort((a,b) => a.treaty_id < b.treaty_id ? -1 : a.treaty_id > b.treaty_id ? 1 : a.treaty_id >= b.treaty_id ? 0 : NaN).forEach(v => { // sort fn from d3.ascending()
                if (v.ratified_date !== '' ){
                    ratified.push(v.treaty_id);
                }
            })
            // add className property to each country that corresponds to which treaties it is party to, or "none"
            d.value = ratified.length === 0 ? 'None' : ratified.join('-');
            return d;
        });
      
        var allCountriesData = this.geoJSON.features.filter(f => f.hasOwnProperty('id')).map(f => { // filter for only feature
            var className = joinData.find(d => d.key === f.id) && joinData.find(d => d.key === f.id).value || 'None';                                                                                       // that have iso_a3 codes
            return {
                iso_a3: f.id,
                name: this.model.countryCodes[f.id],
                value: 2,
                className,
                classArray: className.split('-')
            };
        });
        console.log(allCountriesData);

        // the tooltip formatter below needs access to this.model but also needs to call a function
        // with the datum as `this`. the IIFE below generates the necessary function with closure
        // over this.model
        var returnFormatter = (function(treaties){
            function Formatter(){
                var agreementsString = this.point.className === 'None' ? 'None' : this.point.classArray.map(c => treaties.find(t => t.key === c).name).join('<br />');
                setTimeout(() => {
                    document.querySelector('.highcharts-tooltip').classList.add(this.point.className);
                });
                return `
                    <b>${this.point.name}</b><br />
                    ${agreementsString}
                `;
            }
            return Formatter;
        })(this.model.treaties);
        Highcharts.mapChart(this.el.id, {
            chart: {
                map: this.geoJSON,
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
                },
                valueDecimals: 0,
                enabled: false
            },

           tooltip: {
                formatter: returnFormatter
           },

            series: [{
                data: allCountriesData,
                joinBy: ['iso_a3'],
                name: 'International agreements'
                
            }]
        });
    }
}