/* global Highcharts */

//import * as d3 from 'd3-collection';
import PS from 'pubsub-setter';

import s from './styles.scss';
import './map-exclude.scss'; // '-exclude' is excluded from modularized css renaming
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
        PS.setSubs([
            ['deselected', (msg,data) => {
                this.updateMap.call(this,msg,data);
            }],
            ['searchCountries', (msg,data) => {
               this.updateMap.call(this,msg,data); 
            }]
        ]);
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
    updateMap(msg,data) {
        if ( msg.split('.')[0] === 'deselected' ){
            let treaty = msg.split('.')[1];
            this.el.parentNode.classList.toggle('deselect-' + treaty); // change classes on parentNode, ie, app root 
                                                                       // so that other views can react to same change 
        } 
        if ( msg === 'searchCountries'){
            console.log('searchCountries update map', data);
            if ( data.length !== 0 ) { // ie search is active, not an empty array
                this.Highmap.container.parentNode.classList.add(s.searchActive);
                this.Highmap.series[0].data.forEach(country => {
                    if ( data.indexOf(country.iso_a3) !== -1 ){ // ie country code is in the search array
                        country.graphic.element.classList.add(s.matchesSearch);
                    } else {
                        country.graphic.element.classList.remove(s.matchesSearch);
                    }
                });
            } else {
                this.Highmap.container.parentNode.classList.remove(s.searchActive);
            }
        }
                                                                   
    }
    initializeMap(){

        var allCountriesData = this.geoJSON.features.filter(f => f.hasOwnProperty('id')).map(f => { // filter for only feature
            var match = this.model.joinData.find(d => d.key === f.id);
            var className = match && match.value || 'None';                                                                                       // that have iso_a3 codes
            return {
                iso_a3: f.id,
                name: this.model.countryCodes[f.id],
                value: 2,
                className: className,
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
        
        this.Highmap = new Highcharts.Map(this.el.id, {
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
        console.log(this.Highmap);
    }
}