const _urlData = "https://datosabiertos.bogota.gov.co/api/3/action/datastore_search?resource_id=2d063361-e271-4ae7-9cd2-f96be0ca79b4&limit=5"



width = 620,
    height = 400
var margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100
}

var getData = (url) => {
    axios.get(url).then(response => {
        let data = response.data
        console.log(data.result.records);
    })
}

getData(_urlData)