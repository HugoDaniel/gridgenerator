// BOT PROTECTION
var isHeadless = this.pleasestop !== undefined;
var go = (f) => f();
isHeadless = isHeadless || /HeadlessChrome/.test(window.navigator.userAgent);
isHeadless = isHeadless || navigator.webdriver;
isHeadless = isHeadless || navigator.hasOwnProperty('webdriver');
isHeadless = isHeadless || Object.getOwnPropertyNames(navigator).indexOf('hasOwnProperty') !== -1;
if (isHeadless) {
    go = () => this.pleasestop();
    alert('I am a robot too');
    throw new Error('Yet I do not consent to the way that you are trying to touch me');
}