function removeDuplicates(dataset) {
    return dataset.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
}

function buildObject(country, restriction_type, restriction_nature, dataset) {
    for (var i = 0; i < restriction_type.length; i++) {  
        var temp_data = [];
        var obj_data = {};
        for (var j =0; j < moveRes.length; j++) {
            if (country === "All") {
                if (restriction_type[i] === moveRes[j].Type_of_restriction) {
                    if (temp_data.length === 0)
                        temp_data[0] = moveRes[j].Nature_of_restriction;
                    else
                        temp_data.push(moveRes[j].Nature_of_restriction);        
                }
            }
            else {
                if (restriction_type[i] === moveRes[j].Type_of_restriction && country === moveRes[j].Country) {
                    if (temp_data.length === 0)
                        temp_data[0] = moveRes[j].Nature_of_restriction;
                    else
                        temp_data.push(moveRes[j].Nature_of_restriction);        
                }
            }
        }
        for (var j = 0; j < restriction_nature.length; j++) {
            var count = 0;
            for (x in temp_data) {
                if (restriction_nature[j] === temp_data[x])
                    count++;
            }
            obj_data[restriction_nature[j]] = count;
        }    
        if (dataset.length === 0) {
            dataset[0] = obj_data;
        }
        else {
            dataset.push(obj_data);
        }
    };
    return dataset;
}

function generateBarChart(id) {
    restriction_type = moveRes.map(function (d) {
        return d.Type_of_restriction;
    });
    restriction_nature = moveRes.map(function (d) {
        return d.Nature_of_restriction;
    });

    // remove the duplicates
    restriction_type = removeDuplicates(restriction_type);
    restriction_nature = removeDuplicates(restriction_nature);
    
    var num_samples = restriction_type.length,  // number of samples per layer
        num_layers = restriction_nature.length;  // number of layers

    // get the data from moveRes in data.js, the final data for the bar chart is in the array dataset[]
    var dataset = [];
        dataset = buildObject("All", restriction_type, restriction_nature, dataset);

    var stack = d3.layout.stack(),
        layers = stack(d3.range(num_layers).map(function(d) { 
            var a = [];
            for (var i = 0; i < num_samples; ++i) {
                a[i] = {x: restriction_type[i], y: dataset[i][restriction_nature[d]]};  
            }
            return a;
        })),
        //the largest single layer
        max_group = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
         //the largest stack
        max_stack = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    var margin = {top: 0, right: 10, bottom: 20, left: 50},
        width = 683 - margin.left - margin.right,
        height = 263 - margin.top - margin.bottom;

    var x = d3.scale.linear()
            .domain([0, max_stack])
            .range([0, (width-120)]);

    var y = d3.scale.ordinal()
            .domain(restriction_type)
            .rangeRoundBands([2, height-160], .08);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');    
    
    var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(0)
            .orient('left');
    
    var colors = d3.scale.category10();

    var svg = d3.select(id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + (margin.left + 50) + "," + margin.top + ")");

    var layer = svg.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .style("fill", function(d, i) { return colors(i); });
    
    var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("y", function(d) { return y(d.x); })
            .attr("x", function(d) { return x(d.y0); })
            .attr("height", y.rangeBand())
            .attr("width", function(d) { return x(d.y); });
    
    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + [height-160] + ")") // corresponding to y
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y_axis')
        .call(yAxis);
    
    // color description
     restriction_nature.forEach(function (s, i) {
        svg.append('rect')
            .attr('fill', colors(i))
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', i%2*width/2)
            .attr('y', Math.floor(i/2) * 24 + 130);
        svg.append('text')
            .attr('fill', 'black')
            .attr('x', i%2*width/2+20)
            .attr('y', Math.floor(i/2) * 24 + 140)
            .text(s);
    }); 
}

function transitionBarChart(id, country) {
    restriction_type = moveRes.map(function (d) {
        return d.Type_of_restriction;
    });
    restriction_nature = moveRes.map(function (d) {
        return d.Nature_of_restriction;
    });
    // remove the duplicates
    restriction_type = removeDuplicates(restriction_type);
    restriction_nature = removeDuplicates(restriction_nature);
    
    var num_samples = restriction_type.length,
        num_layers = restriction_nature.length;
    
    // get the data from moveRes in data.js, the final data for the bar chart is in the array dataset[]
    var dataset = [];
    dataset = buildObject(country, restriction_type, restriction_nature, dataset);
    
    var stack = d3.layout.stack(),
        layers = stack(d3.range(num_layers).map(function(d) { 
            var a = [];
            for (var i = 0; i < num_samples; ++i) {
                a[i] = {x: restriction_type[i], y: dataset[i][restriction_nature[d]]};  
            }
            return a;
        }));
        
     //the largest stack
     var max_stack = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
        
     var margin = {top: 0, right: 10, bottom: 20, left: 50},
        width = 683 - margin.left - margin.right,
        height = 263 - margin.top - margin.bottom;
    
    var x = d3.scale.linear()
            .domain([0, max_stack])
            .range([0, (width-120)]);
    
    var y = d3.scale.ordinal()
           .domain(restriction_type)
            .rangeRoundBands([2, height-160], .08);
    
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');  

    var layer = d3.select(id).selectAll("g.layer")
                .data(layers);
               
    rect = layer.selectAll("rect") 
        .data(function(d) { return d; })  // match the new data to the existing rectangles
        .transition().duration(500)
        .attr("y", function(d) { return y(d.x); })
        .attr("x", function(d) { return x(d.y0); })
        .attr("height", y.rangeBand())
        .attr("width", function(d) { return x(d.y); }); 

    d3.select("g.x_axis")
        .attr("transform", "translate(0," + [height-160] + ")") // corresponding to y
        .call(xAxis);
}

function generateMap(){
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = $('#map').width() - margin.left - margin.right,
    height = 550;
   
    var projection = d3.geo.mercator()
        .center([-8,9])
        .scale(3600);

    var svg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height);

    var path = d3.geo.path()
        .projection(projection);
    
    var g = svg.append("g");
    
    g.selectAll("path")
        .data(westafrica.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'#aaaaaa')
        .attr("fill",'#ffffff')
        .attr("class","country")
        .on("mouseover",function(d){
            if(d.properties.ISO3 === "GIN" || d.properties.ISO3 === "SLE" || d.properties.ISO3 === "LBR"){
                if(focusCountry!=d.properties.ISO3){d3.select(this).attr("fill","steelblue");}
            }
        })
        .on("mouseout",function(d){
            if(d.properties.ISO3 === "GIN" || d.properties.ISO3 === "SLE" || d.properties.ISO3 === "LBR"){
                if(focusCountry!=d.properties.ISO3){d3.select(this).attr("fill","#ffffff");}
            }
        })
        .on("click",function(d){
            if(d.properties.ISO3 === "GIN" || d.properties.ISO3 === "SLE" || d.properties.ISO3 === "LBR"){
                d3.select(this).attr("fill","#ffffff");
                setCountryRestrictions(d.properties.NAME,moveRes);
                focusOn(d.properties.ISO3);
                transitionBarChart("#bar_chart", d.properties.NAME);
            }            
        });

    var mapLabels = svg.append("g");    

    mapLabels.selectAll('text')
        .data(westafrica.features)
        .enter()
        .append("text")
        .attr("x", function(d,i){
                    return path.centroid(d)[0]-20;})
        .attr("y", function(d,i){
                    return path.centroid(d)[1];})
        .attr("dy", ".55em")
        .attr("class","maplabel")
        .style("font-size","12px")
        .attr("opacity",0.4)
        .text(function(d,i){
                    return d.properties.NAME;
                });
                

    var g = svg.append("g");    

    g.selectAll("path")
        .data(regions.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke",'none')
        .attr("stroke-width","0px")
        .attr("fill",'none')
        .attr("id",function(d){return d.properties.PCODE_REF;})
        .attr("class","region")
        .on("mouseover",function(d){
            if(d.properties.CNTRY_CODE===focusCountry){
                d3.select(this).attr("fill","steelblue");
            }
        })
        .on("mouseout",function(d){
            if(d.properties.CNTRY_CODE===focusCountry){
                if(focusAdm==="" || d.properties.PCODE_REF ===focusAdm){
                    d3.select(this).attr("fill","#ff9999");
                } else {
                    d3.select(this).attr("fill","#ffffff");
                }
            }
        })
        .on("click",function(d){
            setadmRestrictions(d.properties.CNTRY_NAME,d.properties.PCODE_REF,d.properties.NAME_REF,moveRes);
            focusOnAdm(d.properties.CNTRY_CODE,d.properties.PCODE_REF);
        })
        .append("svg:title")
        .text(function(d) { return d.properties.NAME_REF; });                
                
}


function setCountryRestrictions(country,data){
    var htmlcur = "<h3>Country Level Restrictions for "+country+"</h3>";
    var htmlsub = "<h3>Sub Country Level Restrictions</h3>";
    $.each(data,function(i,e){
        if(e.Country === country && e.adm1 ==="n/a" && e.Date_to==="n/a"){
            htmlcur = htmlcur + convertCountryResToHTML(e);
        }
        if(e.Country === country && e.adm1 !=="n/a" && e.Date_to==="n/a"){
            htmlsub = htmlsub +convertAdmResToHTML(e);
        }        
    });
    $("#current_geo").html(htmlcur);
    $("#sub_geo").html(htmlsub);
}

function setadmRestrictions(country,adm,adm_name,data){
    var htmlcur = "<h3>Restrictions for "+adm_name+"</h3>";
    var htmlsub = "<h3>Sub Level Restrictions</h3>";
    var htmlsup = "<h3>Supra Level Restrictions</h3>";
    var admLevel;
    if(country==="Liberia"){
        admLevel = "adm1_id";
        admNextLevel = "adm2";
    } else {
        admLevel = "adm2_id";
        admNextLevel = "adm3";
    }   
    $.each(data,function(i,e){
        if(e[admLevel]===adm && e[admNextLevel] === "n/a" && e.Date_to==="n/a"){
            htmlcur = htmlcur +convertAdmResToHTML(e);
        }
        if(e[admLevel]===adm && e[admNextLevel] !== "n/a" && e.Date_to==="n/a"){
            htmlsub = htmlsub +convertAdmResToHTML(e);
        }
        if(e.Country === country && e.adm1 ==="n/a" && e.Date_to==="n/a"){
            htmlsup = htmlsup + convertCountryResToHTML(e);
        }
        $("#current_geo").html(htmlcur);
        $("#sub_geo").html(htmlsub);   
        $("#sup_geo").html(htmlsup); 
    });
}

function convertAdmResToHTML(e){
    var loc = "";
    if(e.adm3!=="n/a"){loc=loc+e.adm3+", " ;} 
    if(e.adm2!=="n/a"){loc=loc+e.adm2+", " ;}
    if(e.adm1!=="n/a"){loc=loc+e.adm1+", " ;}
    return "<div class='res'><h4>"+e.Location+"</h4>"+ loc+"<p>"+e.Type_of_restriction+" - "+e.Nature_of_restriction+"</p><p>Starting from "+e.Date_from+"</p><p>"+e.Notes+"</p><p><a href='"+e.Source_Hyperlink+"' target='_blank'>"+e.Source+"</a></p></div>";
}

function convertCountryResToHTML(e){
    return "<div class='res'><h4>"+e.Type_of_restriction+" - "+e.Nature_of_restriction+"</h4><p>Starting from "+e.Date_from+"</p><p>"+e.Notes+"</p><p><a href='"+e.Source_Hyperlink+"' target='_blank'>"+e.Source+"</a></p></div>";
}

function focusOn(country){
    focusCountry=country;
    focusAdm = "";
    d3.selectAll(".region")
        .attr("stroke",function(d){
            if(d.properties.CNTRY_CODE===country){
                return "#aaaaaa";
            } else {
                return "none";
            }
        })
        .attr("stroke-width",function(d){
            if(d.properties.CNTRY_CODE===country){
                return "1px";
            } else {
                return "0px";
            }
        })
        .attr("fill",function(d){
            if(d.properties.CNTRY_CODE===country){
                return "#ff9999";
            } else {
                return "none";
            }    
        });
}

function focusOnAdm(country,adm){
    focusAdm = adm;
    console.log(country);
    d3.selectAll(".region")
        .attr("fill",function(d){
            if(d.properties.CNTRY_CODE===country){
                if(d.properties.PCODE_REF===adm){
                    return "#ff9999";
                } else {
                    return "#ffffff";
                }
            } else {
                return "none";
            }    
        });
}

function stickydiv(){
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top && focusCountry!==""&&$(window).width()>975){
        $('#map').addClass('sticky');
    }
    else{
        $('#map').removeClass('sticky');
    }
};

var focusCountry="";
var focusAdm ="";
generateBarChart("#bar_chart");
generateMap();

$(window).scroll(function(){
    stickydiv();
});
