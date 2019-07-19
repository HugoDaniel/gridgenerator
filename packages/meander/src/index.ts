const dom = document;
function meander() {
	console.log('LOADED')
	// Remove the loading for now
	const loading = dom.getElementById('loading')
	loading.classList.add('dn')
	loading.classList.remove('flex')
}
dom.addEventListener("DOMContentLoaded", meander);

/*
Actions:
exit
startLoading
stopLoading
goto() // login | about | projects ...

*/