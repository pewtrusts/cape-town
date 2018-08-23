import s from './css/main.scss';

const TestApp = {
	init(){
		console.log('Initialized!');
		const h2 = document.createElement('h2');
		h2.innerHTML = 'App is working';
		h2.className = s.message;
		document.querySelector('#pew-app').appendChild(h2);

	}	
}

export default TestApp;