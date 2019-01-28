console.log("javascript working Happily")
function buildMetadata(sample) {
  var url = "/metadata/" + sample;
  console.log(url)
  d3.json(url).then(function(response) {

    console.log(response);
    
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select("#sample-metadata")
    // Use `.html("") to clear any existing metadata
    panel.html("")
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(response).forEach(function([key, value]) {
      panel.append("div").text(key + ": " + value)
    })
    // BONUS: Build the Gauge Chart
    console.log(response.WFREQ)

    function buildGauge(washFrequency) {

      // Trig to calc meter point
      var degrees = 180 - (washFrequency * 20),
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);

      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);

      var data = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 28, color:'850000'},
          showlegend: false,
          name: 'Wash Frequency',
          text: washFrequency,
          hoverinfo: 'name+text'
        },
        { values: [20, 20, 20, 20, 20, 20, 20, 20, 20, 180],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6',
                  '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:['rgba(232, 226, 202, .5)', 'rgba(210, 206, 145, .5)', 
                        'rgba(202, 209, 95, .5)', 'rgba(170, 202, 42, .5)',  
                        'rgba(155, 184, 39, .5)', 'rgba(110, 154, 22, .5)', 
                        'rgba(100, 140, 20, .5)', 'rgba(35, 138, 23, .5)', 
                        'rgba(14, 127, 0, .5)', 'rgba(255, 255, 255, 0)']},
        labels: 'text',
        hoverinfo: 'text',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];

      var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
          }],
        title: 'Bellybutton Wash Frequency',
        xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };

      Plotly.newPlot('gauge', data, layout);
          }

    buildGauge(response.WFREQ);

  });
}

function buildCharts(sample) {
  var url = "/samples/" + sample;
  console.log(url)
  
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(url).then(function(response) {

      console.log(response);
      console.log(response.sample_values);
      var sample_values = response.sample_values;
      var otu_ids = response.otu_ids;
      var otu_labels = response.otu_labels;
      console.log(response.sample_values.length);
      console.log(`otu_ids:`)
      console.log(otu_ids)
    // @TODO: Build a Bubble Chart using the sample data
    var trace1 = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        color: otu_ids,
        size: sample_values
      }
    };
    
    var data = [trace1];
    
    var layout = {
      title: {
        text: `Microbial "Species" (OTU) Present`
      },
      xaxis: {
        title: {
          text: 'OTU ID'
        }
      },
      yaxis: {
        title: {
          text: 'OTU Amount'
        }
      }
    };
    
    Plotly.newPlot('bubble', data, layout);
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    //1) combine the arrays:
    var combined = [];
    for (var j = 0; j < sample_values.length; j++) 
        combined.push({'sample_values': sample_values[j], 'otu_ids': otu_ids[j], 'otu_labels': otu_labels[j]});
    console.log(combined)
    console.log(combined[0].sample_values)
    // //2) sort:
    combined.sort(function(a, b) {
      return b.sample_values - a.sample_values;
  });
  console.log(combined)
  var topTen = combined.slice(0,10)
  console.log(topTen)
    //3) separate them back out:
    var topSampleValues = []
    var topOtuIds = []
    var topOtuLabels = []

    for (var k = 0; k < topTen.length; k++) {
        topSampleValues[k] = topTen[k].sample_values;
        topOtuIds[k] = topTen[k].otu_ids;
        topOtuLabels[k] = topTen[k].otu_labels;
    }
  
    var trace1 = {
      labels: topOtuIds,
      values: topSampleValues,
      text: 'percent',
      hovertext: topOtuLabels,
      type: 'pie'
    };
    
    var data = [trace1];
    
    var layout = {
      title: {
        text: `Top Ten Microbial "Species"`
      },
    };
    
    Plotly.newPlot("pie", data, layout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();