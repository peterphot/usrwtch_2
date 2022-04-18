function readyRunner() {
    let trackingObj = JSON.parse(localStorage.getItem('uwEventLogs'));
    if (trackingObj) {
        let lastTime = new Date(trackingObj['lastEventTs']);
        let curTime = getCurrentDateTime(false);
        if ((curTime.getTime() - lastTime.getTime())/(60.0*1000.0) > 10) {
            resetEventLogs();
        }
    } else {
        resetEventLogs();
    }
}

async function resetEventLogs() {
    const ipData = await getIp()
    let trackingObj = {
        lastEventTs: getCurrentDateTime()
        , totalNumEvents: 0
        , sessionUuid: uuidv4()
        , ipAddress: ipData.data.ip
        , eventLogs: {
            button1: 0
            , button2: 0
            , button3: 0
            , button4: 0
            , button5: 0
            , button6: 0
            , button7: 0
            , button8: 0
            , button9: 0
            , button10: 0
            , button11: 0
            , button12: 0
            , button13: 0
            , button14: 0
            , button15: 0
            , button16: 0
        }
    };
    console.log(trackingObj);
    $("#match_display").text('');
    $("#match_cnt").text(0);
    window.localStorage.setItem("uwEventLogs", JSON.stringify(trackingObj));
}

function getCurrentDateTime(iso = true) {
    let now = new Date();
    if (iso) {
        return now.toISOString();
    } else {
        return now;
    }
}

const getIp = () => {
    return axios("https://api.ipify.org?format=json")
}

function checkInteractionVectors() {
    console.log('checking vecs');
    //    this goes to the API
    let trackingObjString = localStorage.getItem('uwEventLogs');
    $.post('http://localhost:9000/db/insertEvents', {obj: trackingObjString}, () => console.log('insert done'));
    $.post('http://localhost:9000/db/getFormatCurrentSession', {obj: trackingObjString}, (data, status) => {
        $("#your_session").text(JSON.stringify(data, undefined, 2));
    });
    $.post('http://localhost:9000/db/getMatchingSessions', {obj: trackingObjString}, (data, status) => {
        console.log('get done');
        $("#match_cnt").text(data.length);
        $("#match_display").text(JSON.stringify(data, undefined, 2));
    });

}

function clickHandler() {
    if (this.id === 'reset_session') {
        $("#your_session").text('');
        resetEventLogs().then(resp => console.log('reset done'));
    } else {
        $("#display").text($(this).text());
        let trackingObj = JSON.parse(localStorage.getItem('uwEventLogs'));
        trackingObj['lastEventTs'] = getCurrentDateTime();
        trackingObj['eventLogs'][this.id]++;
        trackingObj['totalNumEvents']++;

        window.localStorage.setItem("uwEventLogs", JSON.stringify(trackingObj));
        checkInteractionVectors();
    }
}

$('button').click(clickHandler);
$(document).ready(readyRunner);
