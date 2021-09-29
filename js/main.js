const _urlData = "http://datosabiertos.bogota.gov.co/api/3/action/datastore_search?resource_id=2d063361-e271-4ae7-9cd2-f96be0ca79b4&limit=1352"
let keys;
let groupKey = 'Organo';
let curYear = 2020;
let dataViz = [];

width = 900,
    height = 500
var margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100
}

var getData = (url) => {
    axios.get(url).then(response => {
        let data = response.data.result.records
        let dataFiltrada = data.filter(d => d.Ano == curYear)
        //console.log(dataFiltrada)

        // Accepts the array and key
        const groupBy = (array, key) => {
            // Return the end result
            return array.reduce((result, currentValue) => {
            // If an array already present for key, push it to the array. Else create an array and push the object
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue
            );
            // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
            return result;
            }, []); // empty object is the initial value for result object
        };

        const databyOrgan = (array, organ) => {
            return array[organ].reduce((l, c) => {
            l[''+c.Proceso] = +c['Numero personas'] + (l[c.Proceso] || 0)

            l['Organo']=organ

            if(l['Lista de espera de donación de órganos']===undefined)
            {
                l['Lista de espera de donación de órganos']= 0;
            }
            if(l['Trasplantes']===undefined)
            {
                l['Trasplantes']= 0;
            }
            if(l['Donación']===undefined)
            {
                l['Donación']= 0;
            }

            return l
        }, {})
        };
        
        let dataGroupByOrgan= groupBy(dataFiltrada, 'Organo');
        //console.log(dataGroupByOrgan);

        dataViz = []
        let i = 0
        for (const property in dataGroupByOrgan) {
            dataViz[i] = databyOrgan(dataGroupByOrgan, property)
            i++
        }
        
        dataViz.splice(0, 1);
        console.log(dataViz);
        keys = Object.keys(dataViz[0])
        keys.splice(keys.indexOf('Organo'), 1); 
        console.log(keys);
        viz(dataViz);
    })
}

var viz = (data) => {

    color = d3.scaleOrdinal()
    .range(["#FF3361", "#33C6FF", "#33FF92"])

    x0 = d3.scaleBand()
        .domain(data.map(d => d.Organo))
        .rangeRound([margin.left, width - margin.right])
        .paddingInner(0.1)

    x1 = d3.scaleBand()
        .domain(keys)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05)

    y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
        .rangeRound([height - margin.bottom, margin.top])

    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0).tickSizeOuter(0))
    .call(g => g.select(".domain").remove())

    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

    svg = d3.select(".dataviz > svg")

    legend = svg => {
    const g = svg
      .attr("transform", `translate(${width},0)`)
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
    .selectAll("g")
    .data(color.domain().slice().reverse())
    .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    g.append("rect")
      .attr("x", -19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color);

    g.append("text")
      .attr("x", -24)
      .attr("y", 9.5)
      .attr("dy", "0.35em")
      .text(d => d);
    }

    svg.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
      .attr("transform", d => `translate(${x0(d[groupKey])},0)`)
    .selectAll("rect")
    .data(d => keys.map(key => ({key, value: d[key]})))
    .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.key));
    
    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    svg.append("g")
      .call(legend);
}

function myFunction(year) {
  d3.select(".dataviz > svg").remove()
  dataViz = []
  curYear = year
  getData(_urlData)
  viz(dataViz)
}

getData(_urlData)