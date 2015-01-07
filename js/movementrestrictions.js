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
                if(focusCountry!=d.properties.ISO3){
                    d3.select(this)
                        .attr("stroke","steelblue")
                        .attr("stroke-width",5);
                }
            }
        })
        .on("mouseout",function(d){
            if(d.properties.ISO3 === "GIN" || d.properties.ISO3 === "SLE" || d.properties.ISO3 === "LBR"){
                if(focusCountry!=d.properties.ISO3){
                    d3.select(this)
                        .attr("stroke","#aaaaaa")
                        .attr("stroke-width",1);
                }
            }
        })
        .on("click",function(d){
            if(d.properties.ISO3 === "GIN" || d.properties.ISO3 === "SLE" || d.properties.ISO3 === "LBR"){
                    d3.select(this)
                        .attr("stroke","#aaaaaa")
                        .attr("stroke-width",1);
                setCountryRestrictions(d.properties.NAME,moveRes);
                focusOn(d.properties.ISO3);                
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
                    d3.select(this)
                        .attr("stroke","steelblue")
                        .attr("stroke-width",5);
            }
        })
        .on("mouseout",function(d){
            if(d.properties.CNTRY_CODE===focusCountry){
                //if(focusAdm==="" || d.properties.PCODE_REF ===focusAdm){
                //    d3.select(this).attr("fill","#FFCA28");
                //} else {
                //    d3.select(this).attr("fill","#ffffff");
                //}
                    d3.select(this)
                        .attr("stroke","#aaaaaa")
                        .attr("stroke-width",1);                
            }
        })
        .on("click",function(d){
            setadmRestrictions(d.properties.CNTRY_NAME,d.properties.PCODEUSE,d.properties.NAMEUSE,moveRes);
            focusOnAdm(d.properties.CNTRY_CODE,d.properties.PCODEUSE);
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
                return "#FFCA28";
            } else {
                return "none";
            }    
        });
}

function focusOnAdm(country,adm){
    focusAdm = adm;
    d3.selectAll(".region")
        .attr("fill",function(d){
            if(d.properties.CNTRY_CODE===country){
                if(d.properties.PCODE_REF===adm){
                    return "#FFCA28";
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
generateMap();

$(window).scroll(function(){
    stickydiv();
});