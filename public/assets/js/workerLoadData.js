const url = "http://127.0.0.1:7500";

function loadData (table="undefined", limit=1000, skip=0) {
    let xhttpSrcRequest = new XMLHttpRequest ();

    xhttpSrcRequest.open ("GET", `${url}/api/${table}?limit=${limit}&skip=${skip}`, true);
    xhttpSrcRequest.send ();
    xhttpSrcRequest.onloadend = (data) => {
        postMessage (JSON.parse(data.target.response));
    }
}

onmessage = e => {
    loadData (e.data.table, e.data.limit, e.data.skip);
}

