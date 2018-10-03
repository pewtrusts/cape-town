/* global Highcharts */

//import * as d3 from 'd3-collection';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import s from './styles.scss';
import './map-exclude.scss'; // '-exclude' is excluded from modularized css renaming
                                             // so that the imported class match the ones on the external
                                             // resource being overridden
import Element from '@UI/element/element.js';
import * as topojson from 'topojson-client';
import worldTopo from '@Project/data/worldtopo.json';

import { GTMPush } from '@Utils';

//const dataPath = 'data/worldtopo.json'; // path to dat file relative to index.html

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
        
        this.convertToGeoJSON(); // the chain leading to initialization of the map starts here. by the time init() is called
                                 // the map container exists as this.el
    }
   /* getTopoJSON(){
        fetch(dataPath)
            .then(function(response){
                return response.json();
            })
            .then(topo => {
                this.convertToGeoJSON(topo); // chain continues
            });
    }*/
    convertToGeoJSON(){
        this.geoJSON = topojson.feature(worldTopo, worldTopo.objects.world);
        this.initializeMap(); // chain continues
    }
    updateMap(msg,data) {
        if ( msg.split('.')[0] === 'deselected' ){
            let treaty = msg.split('.')[1];
            this.el.parentNode.classList.toggle('deselect-' + treaty); // change classes on parentNode, ie, app root 
                                                                       // so that other views can react to same change 
        } 
        if ( msg === 'searchCountries'){
            
            if ( data.length !== 0 ) { // ie search is active, not an empty array
                this.Highmap.container.parentNode.classList.add(s.searchActive);
                this.Highmap.series[0].data.forEach(country => {
                    var el = country.graphic.element;
                    if ( data.indexOf(country.iso_a3) !== -1 || ( this.model.EUCountries.indexOf(country.iso_a3) !== -1 && data.indexOf('EU') !== -1 )){ 
                                                            // ie country code is in the search array or part of EU and EU is in the search array
                        el.classList.add(s.matchesSearch); // SVGElement.prototype.classList i not fully supported
                    } else {
                        el.classList.remove(s.matchesSearch);
                    }
                });
            } else {
                this.Highmap.container.parentNode.classList.remove(s.searchActive);
            }
        }
                                                                   
    }
    initializeMap(){
        this.mapState = {}; 

        var allCountriesData = this.geoJSON.features.filter(f => f.hasOwnProperty('id')).map(f => { // filter for only feature
            var match = this.model.joinData.find(d => d.key === f.id);
            var className = match && match.value || 'None';                                                                                       // that have iso_a3 codes
            return {
                iso_a3: f.id,
                name: this.model.countryCodes[f.id],
                className: className,
                classArray: className.split('-')
            };
        });
        

        // the tooltip formatter below needs access to this.model but also needs to call a function
        // with the datum as `this`. the IIFE below generates the necessary function with closure
        // over this.model
        var returnFormatter = (function(model){
            function Formatter(){
                
                var agreementsString = this.point.className === 'None' ? 'None' : this.point.classArray.map(c => {
                    var parenthetical = c === 'psma' && model.joinData.find(d => d.key === this.point.iso_a3).values.length === 0 ? ' (EU)' :
                        c === 'psma' && model.EUCountries.indexOf(this.point.iso_a3) !== -1 ? '<br />(EU and in respect of overseas territories)' : ''
                    return model.treaties.find(t => t.key === c).name + parenthetical   ;
                }).join('<br />');
                setTimeout(() => {
                    let el = document.querySelector('.highcharts-tooltip');
                    el.classList.add(this.point.className); 
                });
                return `
                    <b>${this.point.name}</b><br />
                    ${agreementsString}
                `;
            }
            return Formatter;
        })(this.model);
        
        this.Highmap = new Highcharts.Map(this.el.id, {
            chart: {
                map: this.geoJSON,
                events: {
                    load: () => {
                        this.resolve(true);
                        
                    }
                }
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
               // clickedPoints: [],
                data: allCountriesData,
                joinBy: ['iso_a3'],
                name: 'International agreements',
                events: {
                    click: (e) => {
                        window.lastCountrySelectMethod = 'map';
                         // using timestamp make each event unique so that clicking the same country twice results in a new setState
                        var isOn = ( !document.querySelector('#pct-map').classList.contains(s.searchActive) || ( document.querySelector('#pct-map').classList.contains(s.searchActive) && !e.target.classList.contains(s.matchesSearch) ));
                        GTMPush('EIFP|Map|' + e.point.iso_a3 + '|' + ( isOn ? 'on' : 'off' ));
                        S.setState('clickCountries.' + e.timeStamp.toString().split('.')[0], e.point.iso_a3);
                        

                    }
                }
                
            }]
        });
        
    }
}