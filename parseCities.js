const http = require('http');
const https = require('https');
const fs = require('fs');
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

const xmlCities = [
    {
        id: 42969693,
        name: 'Nefteyugansk'
    },
    {
        id: 32080632,
        name: 'Nizhnevartovsk'
    },
    {
        id: 36238496,
        name: 'Nyagan'
    },
    {
        id: 36185832,
        name: 'Sovetskiy'
    }
];

const cities = [
    {
        id: 421007,
        name: 'Saint-Petersburg',
    },
    {
        id: 2555133,
        name: 'Moscow',
    },
    {
        id: 7790937,
        name: 'Belgorod'
    },
    {
        id: 5581147,
        name: 'Beloyarsky'
    },
    {
        id: 3374767,
        name: 'Volgograd'
    },
    {
        id: 3536492,
        name: 'Voronezh'
    },
    {
        id: 6564910,
        name: 'Yekaterinburg'
    },
    {
        id: 1670935,
        name: 'Izhevsk'
    },
    {
        id: 1430614,
        name: 'Irkutsk'
    },
    {
        id: 3437391,
        name: 'Kazan'
    },
    {
        id: 1674442,
        name: 'Kaliningrad'
    },
    {
        id: 7373058,
        name: 'Krasnodar'
    },
    {
        id: 1430616,
        name: 'Krasnoyarsk'
    },
    {
        id: 4676636,
        name: 'Kurgan',
    },
    {
        id: 1752948,
        name: 'Nizhny-Novgorod'
    },
    {
        id: 366544,
        name: 'Novosibirsk'
    },
    {
        id: 3442814,
        name: 'Omsk'
    },
    {
        id: 3437213,
        name: 'Perm'
    },
    {
        id: 5727237,
        name: 'Pyt-Yakh'
    },
    {
        id: 1285772,
        name: 'Rostov-on-Don'
    },
    {
        id: 3368701,
        name: 'Samara'
    },
    {
        id: 3955288,
        name: 'Saratov'
    },
    {
        id: 1430508,
        name: 'Sochi'
    },
    {
        id: 2048253,
        name: 'Stary Oskol'
    },
    {
        id: 4261682,
        name: 'Surgut'
    },
    {
        id: 3338286,
        name: 'Togliatti'
    },
    {
        id: 2049854,
        name: 'Tyumen'
    },
    {
        id: 1549169,
        name: 'Ufa'
    },
    {
        id: 2049848,
        name: 'Khabarovsk'
    },
    {
        id: 2339614,
        name: 'Khanty-Mansiysk'
    },
    {
        id: 4442556,
        name: 'Chelyabinsk'
    },
    {
        id: 1701435,
        name: 'Yaroslavl'
    },
];

function parseCity(city) {
    return new Promise(function (resolve, reject) {
        httpGet(`http://polygons.openstreetmap.fr/get_geojson.py?id=${city.id}&params=0`)
            .then(res => {
                const polygons = res.geometries[0].coordinates.map((item, i) => ({
                    id: city.id + i,
                    is_exclusion: true,
                    points: item[0].map(c => ({ lng: c[0], lat: c[1] }))
                }));

                if (!fs.existsSync(__dirname + '/polygons/')) {
                    fs.mkdirSync(__dirname + '/polygons/');
                }

                fs.writeFile(__dirname + '/polygons/' + `${city.name}.json`, JSON.stringify(polygons), (e) => reject(e));
                resolve();
            })
    })
}

async function parseCities() {
    for (const city of cities) {
        console.log('city', city.name);
        await parseCity(city)
    }
}

function parseXMLCity(city) {
    return new Promise(function (resolve, reject) {
        httpsXMLGet(`https://www.openstreetmap.org/api/0.6/way/${city.id}/full`)
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
                    is_exclusion: true,
                    points,
                }];

                if (!fs.existsSync(__dirname + '/polygons/')) {
                    fs.mkdirSync(__dirname + '/polygons/');
                }

                fs.writeFile(__dirname + '/polygons/' + `${city.name}.json`, JSON.stringify(polygons), (e) => reject(e));
                resolve();
            })
    })
}

async function parseXMLCities() {
    for (const city of xmlCities) {
        console.log('city', city.name);
        await parseXMLCity(city)
    }
}


// parseCities();
parseXMLCities();
