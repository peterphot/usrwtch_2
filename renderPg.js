const { Pool } = require('pg');

const connectionString = process.env.CON_STR;
console.log(process.env.CON_STR);

const pool = new Pool({
    connectionString
});

const getQuery = (request, response) => {
    pool.query('SELECT 1;', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const insertEvents = (request, response) => {
    let trackingObj = JSON.parse(request.body.obj);
    let queryString = `INSERT INTO sessions (last_event_ts, total_num_events, ip_address, session_uuid, button1, 
                                            button2, button3, button4, button5, button6, button7, button8, button9,
                                             button10, button11, button12, button13, button14, button15, button16)
                    VALUES('${trackingObj.lastEventTs}', ${trackingObj.totalNumEvents}, '${trackingObj.ipAddress}'
                            , '${trackingObj.sessionUuid}', ${trackingObj.eventLogs.button1},
                            ${trackingObj.eventLogs.button2}, ${trackingObj.eventLogs.button3},
                            ${trackingObj.eventLogs.button4}, ${trackingObj.eventLogs.button5},
                            ${trackingObj.eventLogs.button6}, ${trackingObj.eventLogs.button7},
                            ${trackingObj.eventLogs.button8}, ${trackingObj.eventLogs.button9},
                            ${trackingObj.eventLogs.button10}, ${trackingObj.eventLogs.button11},
                            ${trackingObj.eventLogs.button12}, ${trackingObj.eventLogs.button13},
                            ${trackingObj.eventLogs.button14}, ${trackingObj.eventLogs.button15},
                            ${trackingObj.eventLogs.button16}) 
                    ON CONFLICT (session_uuid) 
                    DO UPDATE SET last_event_ts = '${trackingObj.lastEventTs}'
                                    , total_num_events = ${trackingObj.totalNumEvents}
                                    , button1 = ${trackingObj.eventLogs.button1}
                                    , button2 = ${trackingObj.eventLogs.button2}
                                    , button3 = ${trackingObj.eventLogs.button3}
                                    , button4 = ${trackingObj.eventLogs.button4}
                                    , button5 = ${trackingObj.eventLogs.button5}
                                    , button6 = ${trackingObj.eventLogs.button6}
                                    , button7 = ${trackingObj.eventLogs.button7}
                                    , button8 = ${trackingObj.eventLogs.button8}
                                    , button9 = ${trackingObj.eventLogs.button9}
                                    , button10 = ${trackingObj.eventLogs.button10}
                                    , button11 = ${trackingObj.eventLogs.button11}
                                    , button12 = ${trackingObj.eventLogs.button12}
                                    , button13 = ${trackingObj.eventLogs.button13}
                                    , button14 = ${trackingObj.eventLogs.button14}
                                    , button15 = ${trackingObj.eventLogs.button15}
                                    , button16 = ${trackingObj.eventLogs.button16};`
    pool.query(queryString, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getMatchingSessions = (request, response) => {
    let trackingObj = JSON.parse(request.body.obj);
    let queryString = `select
                            *
                        from sessions
                        where True
                            and session_uuid <> '${trackingObj.sessionUuid}';`
    pool.query(queryString, (error, results) => {
        if (error) {
            throw error
        }

        let cleanedSessions = results.rows.map(processSessionData);
        let currentSession = processSessionData(trackingObj);

        let similaritySessions = cleanedSessions.map((session) => makeMatchResults(session, currentSession));
        let matchedSessions = similaritySessions.filter(session => session.similarity <= 0.25);
        response.status(200).json(matchedSessions);
    })
}

const getFormatCurrentSession = (request, response) => {
    let trackingObj = JSON.parse(request.body.obj);
    response.status(200).json(processSessionData(trackingObj));
}

function makeMatchResults(refSession, curSession) {
    let sim = checkForMatches(refSession, curSession);
    refSession['similarity'] = sim;
    return refSession;
}

function checkForMatches(refSession, curSession) {
    let refProp = refSession.prop_vector;
    let curProp = curSession.prop_vector;
    // let numerator = 0;
    // let denom1 = 0;
    // let denom2 = 0;

    return eucDistance(refProp, curProp);
    // for (let i = 0; i < curProp.length; i++) {
    //     numerator += (curProp[i]*refProp[i]);
    //     denom1 += (curProp[i]*curProp[i]);
    //     denom2 += (refProp[i]*refProp[i]);
    // }
    // denom1 = Math.sqrt(denom1);
    // denom2 = Math.sqrt(denom2);

    // return numerator/(denom1*denom2);
}

function processSessionData(row) {
    let lts, ia, su, tne, evr;
    if ('lastEventTs' in row) {
        lts = 'lastEventTs';
        ia = 'ipAddress';
        su = 'sessionUuid';
        tne = 'totalNumEvents';
        evr = row.eventLogs;
    } else {
        lts = 'last_event_ts';
        ia = 'ip_address';
        su = 'session_uuid';
        tne = 'total_num_events';
        evr = row;
    }

    return {
        lastEventTs: row[lts]
        , ipAddress: row[ia]
        , sessionUuid: row[su]
        , prop_vector: [1.0 * evr['button1'] / row[tne]
            , 1.0 * evr['button2'] / row[tne]
            , 1.0 * evr['button3'] / row[tne]
            , 1.0 * evr['button4'] / row[tne]
            , 1.0 * evr['button5'] / row[tne]
            , 1.0 * evr['button6'] / row[tne]
            , 1.0 * evr['button7'] / row[tne]
            , 1.0 * evr['button8'] / row[tne]
            , 1.0 * evr['button9'] / row[tne]
            , 1.0 * evr['button10'] / row[tne]
            , 1.0 * evr['button11'] / row[tne]
            , 1.0 * evr['button12'] / row[tne]
            , 1.0 * evr['button13'] / row[tne]
            , 1.0 * evr['button14'] / row[tne]
            , 1.0 * evr['button15'] / row[tne]
            , 1.0 * evr['button16'] / row[tne]]
    }
}

function eucDistance(a, b) {
    return a
            .map((x, i) => Math.abs( x - b[i] ) ** 2)
            .reduce((sum, now) => sum + now)
        ** (1/2)
}

module.exports = {
    getQuery,
    insertEvents,
    getMatchingSessions,
    getFormatCurrentSession,
}
