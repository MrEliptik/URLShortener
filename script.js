var URLs_str = '{ "URLs" : []}';
let longURL = "";
let shortMURMUR;
let shortURL_MURMUR;

/* For the HTTP request */
/*const domain = "http://localhost";*/ 
const domain = "http://redu.me";
const req_domain ="http://redu.me"
//const port = "8081";

/* --------------------------- PAGE ELEMENTS -----------------------------------*/

const button_shorten    = document.getElementById('btn-shorten');
const result            = document.querySelector('.modal-body');
// Get the modal
var modal               = document.getElementById('myModal');
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
