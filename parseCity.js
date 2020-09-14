const http = require('http');
const https = require('https');
const libxmljs = require("libxmljs");

const httpGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
    });
};

const httpsXMLGet = url => {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
};

function parseXMLCity(cityId) {
    return new Promise(function (resolve, reject) {
        httpsXMLGet(`https://www.openstreetmap.org/api/0.6/way/${cityId}/full`)
            .then(res => {
                const orders = [];
                const xmlDoc = libxmljs.parseXmlString(res);

                xmlDoc.find("/osm/way/nd").forEach(item => orders.push(item.attr("ref").value()));

                const points = orders.map(item => ({
                    lat: xmlDoc.find(`number(/osm/node[@id=${item}]/@lat)`),
                    lng: xmlDoc.find(`number(/osm/node[@id=${item}]/@lon)`)
                }));

                const polygons = [{
                    id: city.id,
                    is_exclusion: false,
                    editable: true,
                    points,
                }];
                resolve(polygons);
            })
    })
}

parseXMLCity(2173235770).then(res => console.log("res", res))
