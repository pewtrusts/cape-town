/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers" }]*/
import { StringHelpers } from '@Utils'; // string helpers is an IIFE
import './arrayFrom.js'; // IIFE

import CapeTown from './cape-town.js';

const containerSelector = '#pew-app';
const App = new CapeTown();

App.wasPrerendered = true;
App.container = document.querySelector(containerSelector);
if ( !App.container.classList.contains('rendered') ){
	App.prerender();
}
App.init();