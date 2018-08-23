import s from './css/main.scss';

const TestApp = {
	prerender(){
		console.log('Prerender!');
		const h2 = document.createElement('h2');
		h2.innerHTML = 'App is working';
		h2.className = s.message;
		var app = document.querySelector('#pew-app');
		app.appendChild(h2);
		app.classList.add('rendered');
	},
	init(){
		console.log('Init!');
	}
}

export default TestApp;