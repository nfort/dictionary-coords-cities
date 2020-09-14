const csv = require('csv-parser')
const fs = require('fs');
const fetch = require('node-fetch');
const openGeocoder = require('node-open-geocoder');
const results = [];

function geocoder(address) {
    return new Promise(function (resolve, reject) {
        openGeocoder()
            .geocode(address)
            .end((err, res) => {
                if (!err) {
                    resolve(res);
                } else {
                    reject(err)
                }
            });
    });
}

fs.createReadStream('input.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        (async function() {
            let counter = 0;
            let addedPolygonsForCities = [];
            for (const {kladr_id, name} of results) {
                console.log("name", name);
                try {
                    const response = await geocoder(name);
                    // console.log("response", response);
                    const data = response.find((item) => {
                        return (item.type === "town" || item.type === "city") && item.class === "place" && item.geojson && item.address.country_code === "ru" && (item.geojson.type === "Polygon" || item.geojson.type === "MultiPolygon")
                    })

                    if (data) {
                        if (data.geojson.type === "MultiPolygon") {
                            data.geojson.coordinates.forEach(item => {
                                fetch("http://logistics.dev.gazprombank.ru/logistics/admin/api/v1/delivery-areas", {
                                    "headers": {
                                        "accept": "application/json, text/plain, */*",
                                        "accept-language": "ru,en-US;q=0.9,en;q=0.8",
                                        "authorization": "Basic YTph",
                                        "cache-control": "no-cache",
                                        "content-type": "application/json;charset=UTF-8",
                                        "gpb-requestid": "927ce96f-73d0-48aa-9474-2d0cb63ad63e",
                                        "pragma": "no-cache",
                                        "cookie": "cto_lwid=57b3ab21-33ea-4f66-ba8d-ad376ee1eeef; _ym_uid=15704521851002612213; top100_id=t1.6549858.1159214461.1570452185543; tmr_lvid=6a27bd2b6e6b95b05aebb3f1f588df9b; tmr_lvidTS=1562142209000; experimentation_subject_id=IjUwNTBmNDQ5LWEyYzItNGNlZS1hZDkxLTEyZmM4NDU3Y2ZjNCI%3D--632ccd26cfedd7af00aa8d55c28d7d7d04b86995; _gcl_au=1.1.1941100838.1591083399; _ym_d=1591083399; _fbp=fb.1.1591083399833.1764160879; _gcl_aw=GCL.1594816288.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-38=1.1594816289.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-1=1.1594816334.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; last_visit=1596432002374::1596442802374; tmr_reqNum=507; _ga=GA1.1.273552468.1570452185; _ga_KHW2TG20WW=GS1.1.1596442805.38.0.1596442805.60; 252dd4243a0afe0581b274d4b8b723fd=aee3e77eb1c42f00c34f19eb65664b74; 583f42b4b16aac55c902e39820ff4d9d=c3278ce9978ef031de47753a7ddaac64"
                                    },
                                    "referrer": "http://logistics.dev.gazprombank.ru/logistics/admin/delivery-areas",
                                    "referrerPolicy": "no-referrer-when-downgrade",
                                    "body": JSON.stringify({
                                        cityId: kladr_id,
                                        isExclusion: false,
                                        isEditable: true,
                                        points: item[0].map(item => ({lat: item[1], lng: item[0]}))
                                    }),
                                    "method": "POST",
                                    "mode": "cors"
                                }).then(res => {
                                    console.log("res", res);
                                }).catch(e => {
                                    console.log("e", e);
                                });
                            });
                            // data.geojson.coordinates.map(item => ({lat: item[1], lng: item[0]}));
                        } else {
                            fetch("http://logistics.dev.gazprombank.ru/logistics/admin/api/v1/delivery-areas", {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "ru,en-US;q=0.9,en;q=0.8",
                                    "authorization": "Basic YTph",
                                    "cache-control": "no-cache",
                                    "content-type": "application/json;charset=UTF-8",
                                    "gpb-requestid": "927ce96f-73d0-48aa-9474-2d0cb63ad63e",
                                    "pragma": "no-cache",
                                    "cookie": "cto_lwid=57b3ab21-33ea-4f66-ba8d-ad376ee1eeef; _ym_uid=15704521851002612213; top100_id=t1.6549858.1159214461.1570452185543; tmr_lvid=6a27bd2b6e6b95b05aebb3f1f588df9b; tmr_lvidTS=1562142209000; experimentation_subject_id=IjUwNTBmNDQ5LWEyYzItNGNlZS1hZDkxLTEyZmM4NDU3Y2ZjNCI%3D--632ccd26cfedd7af00aa8d55c28d7d7d04b86995; _gcl_au=1.1.1941100838.1591083399; _ym_d=1591083399; _fbp=fb.1.1591083399833.1764160879; _gcl_aw=GCL.1594816288.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-38=1.1594816289.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-1=1.1594816334.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; last_visit=1596432002374::1596442802374; tmr_reqNum=507; _ga=GA1.1.273552468.1570452185; _ga_KHW2TG20WW=GS1.1.1596442805.38.0.1596442805.60; 252dd4243a0afe0581b274d4b8b723fd=aee3e77eb1c42f00c34f19eb65664b74; 583f42b4b16aac55c902e39820ff4d9d=c3278ce9978ef031de47753a7ddaac64"
                                },
                                "referrer": "http://logistics.dev.gazprombank.ru/logistics/admin/delivery-areas",
                                "referrerPolicy": "no-referrer-when-downgrade",
                                "body": JSON.stringify({
                                    cityId: kladr_id,
                                    isExclusion: false,
                                    isEditable: true,
                                    points: data.geojson.coordinates[0].map(item => ({lat: item[1], lng: item[0]}))
                                }),
                                "method": "POST",
                                "mode": "cors"
                            }).then(res => {
                                console.log("res", res);
                            }).catch(e => {
                                console.log("e", e);
                            });
                        }
                        addedPolygonsForCities.push(name);
                        counter++;
                    }
                } catch (e) {
                    console.log("e", e);
                }
            }
            console.log("Добавлено для " + counter + " городов. Список городов: " + addedPolygonsForCities.join(","))
        })();
    });


// fetch("http://logistics.dev.gazprombank.ru/logistics/admin/api/v1/delivery-areas", {
//     "headers": {
//         "accept": "application/json, text/plain, */*",
//         "accept-language": "ru,en-US;q=0.9,en;q=0.8",
//         "authorization": "Basic YTph",
//         "cache-control": "no-cache",
//         "content-type": "application/json;charset=UTF-8",
//         "gpb-requestid": "ec73bd68-f9ac-436f-8c86-e9fc3c22a616",
//         "pragma": "no-cache",
//         "cookie": "cto_lwid=57b3ab21-33ea-4f66-ba8d-ad376ee1eeef; _ym_uid=15704521851002612213; top100_id=t1.6549858.1159214461.1570452185543; tmr_lvid=6a27bd2b6e6b95b05aebb3f1f588df9b; tmr_lvidTS=1562142209000; experimentation_subject_id=IjUwNTBmNDQ5LWEyYzItNGNlZS1hZDkxLTEyZmM4NDU3Y2ZjNCI%3D--632ccd26cfedd7af00aa8d55c28d7d7d04b86995; _gcl_au=1.1.1941100838.1591083399; _ym_d=1591083399; _fbp=fb.1.1591083399833.1764160879; _gcl_aw=GCL.1594816288.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-38=1.1594816289.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; _gac_UA-31919883-1=1.1594816334.Cj0KCQjw0rr4BRCtARIsAB0_48MiN8vMtOKDRvD3tXEM23oJSLVMO5rybcg-DJKaJaCoIQQXRGdfwKgaAiAwEALw_wcB; last_visit=1596432002374::1596442802374; tmr_reqNum=507; _ga=GA1.1.273552468.1570452185; _ga_KHW2TG20WW=GS1.1.1596442805.38.0.1596442805.60; 252dd4243a0afe0581b274d4b8b723fd=aee3e77eb1c42f00c34f19eb65664b74; 583f42b4b16aac55c902e39820ff4d9d=c3278ce9978ef031de47753a7ddaac64"
//     },
//     "referrer": "http://logistics.dev.gazprombank.ru/logistics/admin/delivery-areas",
//     "referrerPolicy": "no-referrer-when-downgrade",
//     "body": "{\"cityId\":\"38000004000000000000000\",\"isExclusion\":false,\"isEditable\":true,\"points\":[{\"lat\":52.632005256245904,\"lng\":104.03399069268414},{\"lat\":52.519895732154126,\"lng\":104.0916689153404},{\"lat\":52.68878650662017,\"lng\":104.27019674737161},{\"lat\":52.632005256245904,\"lng\":104.03399069268414}]}",
//     "method": "POST",
//     "mode": "cors"
// }).then(res => {
//     console.log("res2", res);
// }).catch(e => {
//     console.log("e2", e);
// });
