// feature detection
var loadingElem = document.getElementById('loading');
function webgl_support() {
    try {
        var canvas = document.createElement( 'canvas' ); 
        return !! window.WebGLRenderingContext && ( 
                canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
    } catch (e) { 
        return false;
    }
};
if (!webgl_support()) {
    loadingElem.innerHTML = '<p>Sorry, your device does not support accelerated graphics with <a class="link dim" href="https://get.webgl.org/">WebGL</a>.</p><p> Please update your OS.</p>';
}