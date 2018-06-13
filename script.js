var URLs_str = '{ "URLs" : []}';
var URLS = JSON.parse(URLs_str);
let longURL = "";
let shortMURMUR;
let shortURL_MURMUR;

/* For the HTTP request */
/*const domain = "http://localhost";*/ 
const domain = "http://redu.me";
const req_domain ="http://redu.me"
const port = "8081";

/* --------------------------- PAGE ELEMENTS -----------------------------------*/

const button_shorten    = document.getElementById('btn-shorten');
const result            = document.querySelector('.modal-body');
// Get the modal
var modal               = document.getElementById('myModal');
// Get the button that opens the modal
var btn                 = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span                = document.getElementsByClassName("close")[0];


/* --------------------------- FUNCTIONS -----------------------------------*/

function calculate(urlToShorten){
    /* Check if URL is not too short */
    if(urlToShorten.length < 5 || !isURL(urlToShorten)){
        showSnackbarBody("URL not correct !");
        return;
    }

    longURL = urlToShorten;

    var seed = (new Date).getTime() * Math.random();

    /* Create hash and short url */
    shortMURMUR = (Math.abs(murmurhash2_32_gc(longURL, seed))).toString();
    shortURL_MURMUR = domain + "/" + shortMURMUR;

    /* SEND TO SERVER */
    /* Create JSON */
    var urls_JSON = JSON.stringify({"longURL":longURL,"shortURL":shortMURMUR,"date":""});

    /* Create and send request */
    request= new XMLHttpRequest();
    request.open("POST", req_domain + "/addURL", true);
    request.setRequestHeader("cache-control", "no-cache");
    request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    request.send(urls_JSON);


    // Set html result of the modal
    result.innerHTML = `<span class="box-result">
                        ${shortURL_MURMUR}
                        <button class="button-copy" onclick="copy()" onmouseout="outFunc()" style="font-size:24px">
                            <i class="material-icons">content_copy</i>
                        </button>
                        <div class="tooltip">
                            <span class="tooltiptext" id="myTooltip">Copy to clipboard</span>
                        </div>
                        </span>
                        <span class="info">
                            <p>
                                Your link will be stored 60 days, unless you use it. </br>
                                Each time you use the sort URL, the timer resets.</br>
                            </p>
                        </span>
                        <!-- The actual snackbar -->
                        <div id="snackbar" class="snackbar">
                            <i class="material-icons mdl-shadow--2dp" style="color:green; vertical-align:middle;">check</i> 
                            URL copied !
                        </div>
                    `;
    openModal();
}

function store(longURL, shortURL){
    //Add at first position
    URLS['URLs'].unshift({"longURL":longURL,"shortURL":shortURL}); 
    URLS_str = JSON.stringify(URLS);
    localStorage.setItem("urls", URLS_str);
}

function retrieve(url_short){
    const url = url_short;
    URLS_str = localStorage.getItem("urls");
    URLS = JSON.parse(URLS_str);
    for (i = 0; i < URLS.URLs.length; i++) {
        if(URLS.URLs[i].shortURL == url){
            return URLS.URLs[i].longURL;
        }
    }
}

function copy() {
    /* Little trick to copy and element to the client clipboard
    Create a dummy element in wich will put what we want to Copy
    We select it and execute the commande 'copy'
    Then we remove the dummy element */
    var dummy = document.createElement('input');
    dummy.setAttribute('value', shortURL_MURMUR);
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy)

    /* Alert the copied text */
    showSnackbar("URL copied !");
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied: " + shortURL_MURMUR;
}

function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}

/* --------------------------- GUI FUNCTIONS -----------------------------------*/

function openModal(){
    // When the user clicks on the button, open the modal
    modal.style.display = "block";
}

function closeModal(){
    modal.style.display = "none";
}

function showSnackbar(message) {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");
    // Apply wanted text
    x.text = message;
    // Add the "show" class to DIV
    x.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function showSnackbarBody(message) {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar-body");
    // Apply wanted text
    x.text = message;
    // Add the "show" class to DIV
    x.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}


/* --------------------------- EVENT LISTENERS -----------------------------------*/

button_shorten.addEventListener('click', () => {
    url = document.getElementById("url-field").value;
    calculate(url);
});

window.addEventListener('keydown', (e)=> {
    if(e.keyCode != 13) return; //exit if not "enter"
    url = document.getElementById("url-field").value;
    calculate(url);
});

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    closeModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}
